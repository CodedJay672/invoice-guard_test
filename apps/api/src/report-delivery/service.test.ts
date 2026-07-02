import assert from "node:assert/strict";
import test from "node:test";

import { entitlementsForTier, type PaidReportTier } from "@workspace/validation";

import { ReportDeliveryService } from "./service.js";
import {
  InvalidFrozenReportError,
  ReportNotFoundError,
  type DeliverableReportRecord,
  type ReportDeliveryRepository,
} from "./types.js";

void test("owner receives a validated ready report", async () => {
  const service = serviceFor(reportRow("basic"));
  const result = await service.getOwnedReport("IG-2026-A1B2C3D4E5F6", "user_owner");
  assert.equal(result.state, "report");
  if (result.state !== "report") return;
  assert.equal(result.report.outcome, "complete");
  assert.equal(result.report.pdfState, undefined);
});

void test("non-owner and missing reports are both concealed as not found", async () => {
  await assert.rejects(
    serviceFor(reportRow("basic")).getOwnedReport("IG-2026-A1B2C3D4E5F6", "user_attacker"),
    (error: unknown) => error instanceof ReportNotFoundError && error.accessDenied,
  );
  await assert.rejects(
    serviceFor(undefined).getOwnedReport("IG-2026-A1B2C3D4E5F6", "user_owner"),
    (error: unknown) => error instanceof ReportNotFoundError && !error.accessDenied,
  );
});

void test("lifecycle states never expose frozen report data", async () => {
  for (const status of [
    "pending",
    "generating",
    "failed",
    "refund_required",
    "refunded",
  ] as const) {
    const result = await serviceFor({ ...reportRow("basic"), status }).getOwnedReport(
      "IG-2026-A1B2C3D4E5F6",
      "user_owner",
    );
    assert.equal(
      result.state,
      status === "pending" || status === "generating" ? "not_ready" : "unavailable",
    );
    assert.equal("report" in result, false);
  }
});

void test("malformed or entitlement-inconsistent artifacts fail closed", async () => {
  const malformed = { ...reportRow("standard"), reportData: { schemaVersion: "unknown" } };
  await assert.rejects(
    serviceFor(malformed).getOwnedReport("IG-2026-A1B2C3D4E5F6", "user_owner"),
    InvalidFrozenReportError,
  );

  const inconsistent = reportRow("standard");
  inconsistent.entitlements = entitlementsForTier("premium");
  await assert.rejects(
    serviceFor(inconsistent).getOwnedReport("IG-2026-A1B2C3D4E5F6", "user_owner"),
    InvalidFrozenReportError,
  );
});

void test("tier projection omits unentitled sections and sensitive CCJ fields", async () => {
  const expected: Record<PaidReportTier, string[]> = {
    basic: ["company-overview", "address-history", "court-records", "directors"],
    standard: [
      "company-overview",
      "address-history",
      "court-records",
      "directors",
      "filing-compliance",
      "registered-charges",
    ],
    premium: [
      "company-overview",
      "address-history",
      "court-records",
      "directors",
      "filing-compliance",
      "registered-charges",
      "director-depth",
      "fair-payment-code",
      "confidence-indicator",
    ],
  };

  for (const tier of ["basic", "standard", "premium"] as const) {
    const result = await serviceFor(reportRow(tier)).getOwnedReport(
      "IG-2026-A1B2C3D4E5F6",
      "user_owner",
    );
    assert.equal(result.state, "report");
    if (result.state !== "report") continue;
    assert.deepEqual(
      result.report.sections.map((section) => section.id),
      expected[tier],
    );
    assert.equal(
      result.report.sources.some((source) => source.label === "Fair Payment Code"),
      tier === "premium",
    );
    const ccjLabels = result.report.sections
      .find((section) => section.id === "court-records")
      ?.facts.map((fact) => fact.label);
    assert.equal(ccjLabels?.includes("Judgement amount"), tier !== "basic");
    assert.equal(ccjLabels?.includes("Satisfaction status"), tier !== "basic");
  }
});

function serviceFor(row: DeliverableReportRecord | undefined): ReportDeliveryService {
  const repository: ReportDeliveryRepository = {
    findByReference: () => Promise.resolve(row),
  };
  return new ReportDeliveryService(repository);
}

function reportRow(tier: PaidReportTier): DeliverableReportRecord {
  const entitlements = entitlementsForTier(tier);
  const checkedAt = "2026-07-02T09:00:00.000Z";
  return {
    reportReference: "IG-2026-A1B2C3D4E5F6",
    clerkUserId: "user_owner",
    reportTier: tier,
    entitlements,
    status: "ready",
    pdfStorageUrl: null,
    reportData: {
      schemaVersion: "paid-report-v1",
      reportReference: "IG-2026-A1B2C3D4E5F6",
      companyNumber: "12345678",
      companyName: "ACME LIMITED",
      tier,
      entitlements,
      generatedAt: checkedAt,
      facts: {
        overview: {
          companyStatus: "active",
          companyType: "ltd",
          incorporationDate: "2018-04-12",
          sicCodes: ["46900"],
          registeredAddress: {
            locality: "Manchester",
            region: "Greater Manchester",
            country: "United Kingdom",
            changeFilings: [],
          },
        },
        charges: { charges: [{ id: "charge-secret" }] },
        insolvency: { companiesHouse: { cases: [] } },
        officers: { officers: [{ name: "A DIRECTOR", appointedOn: "2020-01-01" }] },
        filing_history: { filings: [{ id: "filing-secret" }] },
        ccj: {
          judgements: [
            {
              judgementId: "ccj-secret",
              courtName: "Manchester County Court",
              judgementYear: 2024,
              amountPence: 246000,
              satisfied: false,
            },
          ],
        },
        fair_payment_code: { statusLabel: "Gold", awardLevel: "Gold" },
      },
      interpretation: {
        status: "ready",
        model: "claude-haiku-4-5-20251001",
        promptVersion: "v1",
        generatedAt: checkedAt,
        requestId: "req_123",
        output: {
          summary: "Factual summary.",
          overview: "Overview.",
          charges: "Charges.",
          insolvency: "Insolvency.",
          officers: "Officers.",
          filing_history: "Filings.",
          ccj: "Court records.",
          fair_payment_code: "Fair Payment Code.",
        },
      },
      relatedCompanies: { status: "unavailable", reason: "verified_source_not_configured" },
      evidenceCoverage: entitlements.evidenceCoverage ? { completed: 8, failed: 0 } : null,
      recovery: null,
    },
    providerStatuses: {
      checked: [
        {
          provider: "companies_house",
          operation: "profile",
          status: "success",
          checkedAt,
          errorCode: null,
        },
        {
          provider: "registry_trust",
          operation: "ccj",
          status: "success",
          checkedAt,
          errorCode: null,
        },
        {
          provider: "london_gazette",
          operation: "company_notices",
          status: "success",
          checkedAt,
          errorCode: null,
        },
        {
          provider: "insolvency_disqualified_officers",
          operation: "company_check",
          status: "success",
          checkedAt,
          errorCode: null,
        },
        {
          provider: "fair_payment_code",
          operation: "internal_lookup",
          status: "success",
          checkedAt,
          errorCode: null,
        },
      ],
      fairPaymentCode: entitlements.fairPaymentCode ? "entitled" : "not_entitled",
      relatedCompanies: "unavailable",
    },
  };
}
