import assert from "node:assert/strict";
import test from "node:test";

import {
  MockCompaniesHouseClient,
  MockInsolvencyDisqualifiedOfficersClient,
  MockLondonGazetteClient,
  MockRegistryTrustClient,
  createProviderFailure,
  type ProviderName,
  type ProviderResult,
} from "@workspace/integrations";
import { entitlementsForTier, type PaidReportTier } from "@workspace/validation/paid-report";

import {
  AI_INTERPRETATION_DISCLAIMER,
  AI_INTERPRETATION_MODEL,
  AI_INTERPRETATION_PROMPT_VERSION,
} from "../ai-interpretation/prompt.js";
import type { AiInterpretationClient } from "../ai-interpretation/types.js";
import { PaidReportGenerationHandler } from "./handler.js";
import type {
  FairPaymentCodeRecord,
  GeneratingPaidReport,
  PaidGenerationRepository,
  PaidReportSnapshot,
} from "./types.js";
import { CompaniesHouseClient } from "@workspace/types";

const NOW = new Date("2026-07-02T12:00:00.000Z");

void test("Single Report collection is product-safe and reuses successful report snapshots", async () => {
  const repository = new MemoryPaidGenerationRepository(report("single_report"));
  const aiInputs: unknown[] = [];
  const handler = createHandler(repository, aiInputs);

  const first = await handler.generate(repository.report.id);
  const usageAfterFirst = repository.usage.length;
  const second = await handler.generate(repository.report.id);

  assert.equal(first.outcome, "ready");
  assert.equal(second.outcome, "ready");
  assert.equal(repository.usage.length, usageAfterFirst);
  assert.deepEqual(repository.usage.map((item) => `${item.provider}:${item.operation}`).sort(), [
    "companies_house:address_history",
    "companies_house:charges",
    "companies_house:filing_history",
    "companies_house:insolvency",
    "companies_house:officers",
    "companies_house:profile",
    "fair_payment_code:internal_lookup",
    "insolvency_disqualified_officers:company_check",
    "london_gazette:company_notices",
    "registry_trust:ccj",
  ]);
  const input = aiInputs[0] as Record<string, unknown>;
  assert.notEqual(input["charges"], null);
  assert.notEqual(input["filing_history"], null);
  assert.notEqual(input["fair_payment_code"], null);
});

void test("foundational Companies House failure skips paid sources and requires refund", async () => {
  const repository = new MemoryPaidGenerationRepository(report("agency_pack"));
  const companiesHouse = new MockCompaniesHouseClient();
  companiesHouse.getCompanyProfile = () =>
    Promise.resolve(
      createProviderFailure("companies_house", {
        code: "integration_auth_error",
        message: "Unavailable",
        retryable: false,
      }),
    );
  const handler = createHandler(repository, [], companiesHouse);

  const result = await handler.generate(repository.report.id);

  assert.equal(result.outcome, "refund_required");
  assert.deepEqual(
    repository.usage.map((item) => item.operation),
    ["profile"],
  );
});

void test("credit-pack products include internal Fair Payment Code and factual evidence coverage", async () => {
  const repository = new MemoryPaidGenerationRepository(report("business_pack"));
  repository.fairPaymentCode = {
    companiesHouseNumber: repository.report.companiesHouseNumber,
    statusLabel: "Awarded",
    awardLevel: "Gold",
    sourceReference: "internal-2026-07",
    verifiedAt: new Date("2026-07-02T10:00:00.000Z"),
    expiresAt: null,
  };
  const result = await createHandler(repository, []).generate(repository.report.id);
  const data = result.reportData as Record<string, unknown>;

  assert.equal(result.outcome, "ready");
  assert.ok(data["evidenceCoverage"]);
  assert.equal(
    repository.usage.some((item) => item.provider === "fair_payment_code"),
    true,
  );
});

void test("exhausted Registry Trust failure freezes tier-specific recovery metadata", async () => {
  const repository = new MemoryPaidGenerationRepository(report("single_report"));
  const handler = createHandler(repository, [], new MockCompaniesHouseClient(), {
    checkCompany: () =>
      Promise.resolve(
        createProviderFailure("registry_trust", {
          code: "integration_timeout",
          message: "Timed out",
          retryable: true,
        }),
      ),
  });

  await assert.rejects(() => handler.generate(repository.report.id), /retryable failures/);
  const result = await handler.recoverTerminalFailure(repository.report.id, new Error("exhausted"));
  const data = result?.reportData as Record<string, unknown>;

  assert.equal(result?.outcome, "partial");
  assert.deepEqual(data["recovery"], {
    type: "free_recheck",
    eligibleUntil: "2026-07-09T12:00:00.000Z",
  });
});

function createHandler(
  repository: MemoryPaidGenerationRepository,
  aiInputs: unknown[],
  companiesHouse: CompaniesHouseClient = new MockCompaniesHouseClient(),
  registryTrust = new MockRegistryTrustClient(),
): PaidReportGenerationHandler {
  const ai: AiInterpretationClient = {
    interpret(input) {
      aiInputs.push(input);
      return Promise.resolve({
        status: "ready",
        model: AI_INTERPRETATION_MODEL,
        promptVersion: AI_INTERPRETATION_PROMPT_VERSION,
        generatedAt: NOW.toISOString(),
        requestId: "req_test",
        output: {
          summary: `Factual summary. ${AI_INTERPRETATION_DISCLAIMER}`,
          overview: "Overview facts are recorded. The record is shown as supplied.",
          charges:
            input.charges === null ? null : "Charge facts are recorded. Details are supplied.",
          insolvency:
            input.insolvency === null
              ? null
              : "Insolvency facts are recorded. Details are supplied.",
          officers:
            input.officers === null ? null : "Officer facts are recorded. Details are supplied.",
          filing_history:
            input.filing_history === null
              ? null
              : "Filing facts are recorded. Details are supplied.",
          ccj: input.ccj === null ? null : "Court facts are recorded. Details are supplied.",
          fair_payment_code:
            input.fair_payment_code === null
              ? null
              : "Fair Payment Code facts are recorded. Details are supplied.",
        },
      });
    },
  };
  return new PaidReportGenerationHandler({
    repository,
    companiesHouse,
    registryTrust,
    londonGazette: new MockLondonGazetteClient(),
    insolvencyDisqualifiedOfficers: new MockInsolvencyDisqualifiedOfficersClient(),
    ai,
    alerts: { publish: () => Promise.resolve() },
    logger: { info() {}, warn() {}, error() {} },
    now: () => NOW,
  });
}

function report(tier: PaidReportTier): GeneratingPaidReport {
  return {
    id: "123e4567-e89b-42d3-a456-426614174000",
    reportReference: "IG-2026-TEST",
    clerkUserId: "user_test",
    stripeCheckoutSessionId: "cs_test_paid",
    amountPaidPence:
      tier === "single_report"
        ? 2000
        : tier === "starter_pack"
          ? 5400
          : tier === "business_pack"
            ? 8000
            : 14000,
    currency: "GBP",
    companiesHouseNumber: "01234561",
    companyName: "EXAMPLE LIMITED",
    reportTier: tier,
    entitlements: entitlementsForTier(tier),
  };
}

class MemoryPaidGenerationRepository implements PaidGenerationRepository {
  snapshots: PaidReportSnapshot[] = [];
  usage: Array<{ provider: ProviderName; operation: string }> = [];
  fairPaymentCode: FairPaymentCodeRecord | undefined;

  constructor(readonly report: GeneratingPaidReport) {}

  findGeneratingReport(reportId: string): Promise<GeneratingPaidReport | undefined> {
    return Promise.resolve(reportId === this.report.id ? this.report : undefined);
  }

  findReusableSuccess(
    _reportId: string,
    provider: ProviderName,
    operation: string,
    cutoff: Date,
  ): Promise<PaidReportSnapshot | undefined> {
    return Promise.resolve(
      this.snapshots.find(
        (item) =>
          item.provider === provider &&
          item.operation === operation &&
          item.status === "success" &&
          new Date(item.checkedAt) >= cutoff,
      ),
    );
  }

  listLatestSnapshots(): Promise<PaidReportSnapshot[]> {
    return Promise.resolve([...this.snapshots]);
  }

  saveSnapshot(input: {
    operation: string;
    result: ProviderResult<Record<string, unknown>>;
  }): Promise<PaidReportSnapshot> {
    const snapshot: PaidReportSnapshot = {
      provider: input.result.provider,
      operation: input.operation,
      attempt: 1,
      checkedAt: input.result.checkedAt,
      status: input.result.status,
      data: input.result.status === "success" ? input.result.data : null,
      errorCode: input.result.status === "failed" ? input.result.errorCode : null,
      errorMessage: input.result.status === "failed" ? input.result.errorMessage : null,
      retryable: input.result.status === "failed" && input.result.retryable,
    };
    this.snapshots = this.snapshots.filter(
      (item) => !(item.provider === snapshot.provider && item.operation === snapshot.operation),
    );
    this.snapshots.push(snapshot);
    return Promise.resolve(snapshot);
  }

  logProviderUsage(input: { provider: ProviderName; operation: string }): Promise<void> {
    this.usage.push(input);
    return Promise.resolve();
  }

  findFairPaymentCode(): Promise<FairPaymentCodeRecord | undefined> {
    return Promise.resolve(this.fairPaymentCode);
  }
}
