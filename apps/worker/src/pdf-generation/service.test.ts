import assert from "node:assert/strict";
import test from "node:test";

import { PdfGenerationService } from "./service.js";
import type { PdfArtifactRepository } from "./types.js";

const reportId = "11111111-1111-4111-8111-111111111111";

void test("uploads a deterministic Premium artifact and persists its checksum", async () => {
  const events: string[] = [];
  const repository = fakeRepository(events);
  const service = new PdfGenerationService(
    repository,
    {
      render() {
        return Promise.resolve(Buffer.from("%PDF deterministic"));
      },
    },
    {
      put(input) {
        events.push(`put:${input.key}:${input.sha256}`);
        return Promise.resolve();
      },
    },
    compliance,
    logger,
  );
  assert.equal(await service.process(reportId, 1, 3), "completed");
  assert.match(
    events.join("\n"),
    new RegExp(`put:reports/${reportId}/premium-pdf-v1\\.pdf:[a-f0-9]{64}`),
  );
  assert.ok(events.includes("complete"));
});

void test("requeues transient failures and records terminal failures", async () => {
  const transient: string[] = [];
  const service = new PdfGenerationService(
    fakeRepository(transient),
    {
      render() {
        return Promise.reject(new Error("chromium unavailable"));
      },
    },
    {
      put() {
        return Promise.resolve();
      },
    },
    compliance,
    logger,
  );
  await assert.rejects(service.process(reportId, 1, 3), /chromium unavailable/);
  assert.ok(transient.includes("requeue"));
  const terminal: string[] = [];
  const terminalService = new PdfGenerationService(
    fakeRepository(terminal),
    {
      render() {
        return Promise.reject(new Error("still unavailable"));
      },
    },
    {
      put() {
        return Promise.resolve();
      },
    },
    compliance,
    logger,
  );
  assert.equal(await terminalService.process(reportId, 3, 3), "completed");
  assert.ok(terminal.includes("fail:generation_failed"));
});

const compliance = {
  version: "fixture-v1",
  disclaimer: "Not advice.",
  issueUrl: "https://invoiceguard.co.uk/report-an-issue",
};
const logger = { info() {}, warn() {}, error() {} };

function fakeRepository(events: string[]): PdfArtifactRepository {
  return {
    ensureQueued() {
      return Promise.resolve(true);
    },
    findQueuedReportIds() {
      return Promise.resolve([]);
    },
    claim() {
      return Promise.resolve({
        reportId,
        reportReference: "IG-2026-ABCDEF123456",
        reportTier: "premium",
        reportStatus: "ready",
        reportData: frozenReport,
        providerStatuses: statuses,
        status: "generating",
        attemptCount: 1,
        templateVersion: "premium-pdf-v1",
        complianceVersion: "fixture-v1",
      });
    },
    requeue() {
      events.push("requeue");
      return Promise.resolve(true);
    },
    complete() {
      events.push("complete");
      return Promise.resolve();
    },
    fail(_id, code) {
      events.push(`fail:${code}`);
      return Promise.resolve();
    },
  };
}

const entitlements = {
  companiesHouse: {
    profile: true,
    addressHistory: true,
    officers: true,
    filingHistory: true,
    charges: true,
    insolvency: true,
  },
  registryTrust: { enabled: true, includeAmounts: true, includeSatisfaction: true },
  londonGazette: true,
  insolvencyDisqualifiedOfficers: true,
  fairPaymentCode: true,
  evidenceCoverage: true,
  relatedCompanies: false,
  aiInterpretation: true,
};
const frozenReport = {
  schemaVersion: "paid-report-v1",
  reportReference: "IG-2026-ABCDEF123456",
  companyNumber: "01234567",
  companyName: "Example Limited",
  tier: "premium",
  entitlements,
  generatedAt: "2026-07-03T10:00:00.000Z",
  facts: {
    overview: {},
    charges: null,
    insolvency: null,
    officers: null,
    filing_history: null,
    ccj: null,
    fair_payment_code: null,
  },
  interpretation: null,
  relatedCompanies: { status: "unavailable", reason: "Not implemented" },
  evidenceCoverage: { completed: 1, failed: 0 },
  recovery: null,
};
const statuses = {
  checked: [
    {
      provider: "companies_house",
      operation: "profile",
      status: "success",
      checkedAt: "2026-07-03T10:00:00.000Z",
      errorCode: null,
    },
  ],
  fairPaymentCode: "entitled",
  relatedCompanies: "unavailable",
};
