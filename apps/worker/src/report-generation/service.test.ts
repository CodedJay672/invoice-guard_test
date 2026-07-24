import assert from "node:assert/strict";
import test from "node:test";

import { reportGenerationCutoff } from "./repository.js";
import { ReportGenerationService } from "./service.js";
import type {
  DelayedReport,
  GenerationLogger,
  PersistedReportStatus,
  ReportClaimResult,
  ReportGenerationHandler,
  ReportGenerationResult,
  ReportGenerationRepository,
} from "./types.js";
import { ReportGenerationError } from "./types.js";

const REPORT_ID = "123e4567-e89b-42d3-a456-426614174000";

void test("pending reports are claimed and completed with every supported outcome", async () => {
  for (const outcome of ["ready", "partial", "refund_required"] as const) {
    const harness = createHarness("pending", {
      generate: () => Promise.resolve({ outcome }),
    });
    const result = await harness.service.process(input());

    assert.deepEqual(result, { state: "completed", status: outcome });
    assert.equal(harness.repository.status, outcome);
    assert.equal(harness.repository.claimCount, 1);
    assert.equal(harness.handlerCalls(), 1);
  }
});

void test("frozen report data is handed to the terminal transition atomically", async () => {
  const reportData = { facts: { overview: { companyName: "ACME LIMITED" } } };
  const providerStatuses = { companies_house: "success" };
  const harness = createHarness("pending", {
    generate: () => Promise.resolve({ outcome: "ready", reportData, providerStatuses }),
  });

  await harness.service.process(input());

  assert.deepEqual(harness.repository.completedResult, {
    outcome: "ready",
    reportData,
    providerStatuses,
  });
});

void test("generation-terminal reports converge as no-ops", async () => {
  for (const status of ["ready", "partial", "failed", "refund_required", "refunded"] as const) {
    const harness = createHarness(status);
    assert.deepEqual(await harness.service.process(input()), { state: "noop", status });
    assert.equal(harness.handlerCalls(), 0);
  }
});

void test("a retry resumes generating while a duplicate first attempt does not", async () => {
  const duplicate = createHarness("generating");
  assert.deepEqual(await duplicate.service.process(input()), {
    state: "noop",
    status: "generating",
  });
  assert.equal(duplicate.handlerCalls(), 0);

  const retry = createHarness("generating");
  assert.deepEqual(await retry.service.process(input({ attempt: 2 })), {
    state: "completed",
    status: "ready",
  });
  assert.equal(retry.handlerCalls(), 1);
});

void test("retryable and unexpected failures retry before becoming terminal", async () => {
  for (const error of [new ReportGenerationError("temporary", true), new Error("unexpected")]) {
    const retry = createHarness("pending", {
      generate: () => Promise.reject(error),
    });
    await assert.rejects(() => retry.service.process(input()), error);
    assert.equal(retry.repository.status, "generating");

    const exhausted = createHarness("generating", {
      generate: () => Promise.reject(error),
    });
    assert.deepEqual(await exhausted.service.process(input({ attempt: 3 })), {
      state: "completed",
      status: "failed",
    });
    assert.equal(exhausted.repository.status, "failed");
  }
});

void test("non-retryable failures become failed immediately", async () => {
  const harness = createHarness("pending", {
    generate: () => Promise.reject(new ReportGenerationError("terminal", false)),
  });
  assert.deepEqual(await harness.service.process(input()), {
    state: "completed",
    status: "failed",
  });
  assert.equal(harness.repository.status, "failed");
});

void test("an exhausted AI transport failure can freeze a partial factual fallback", async () => {
  const artifact = {
    facts: { overview: { companyName: "ACME LIMITED" } },
    interpretation: { status: "unavailable", reason: "unavailable" },
  };
  const harness = createHarness("generating", {
    generate: () => Promise.reject(new ReportGenerationError("Anthropic unavailable", true)),
    recoverTerminalFailure: () => Promise.resolve({ outcome: "partial", reportData: artifact }),
  });

  assert.deepEqual(await harness.service.process(input({ attempt: 3 })), {
    state: "completed",
    status: "partial",
  });
  assert.deepEqual(harness.repository.completedResult?.reportData, artifact);
});

void test("missing reports do not mutate or invoke generation", async () => {
  const harness = createHarness(undefined);
  assert.deepEqual(await harness.service.process(input()), { state: "noop", status: "missing" });
  assert.equal(harness.handlerCalls(), 0);
  assert.equal(harness.repository.status, undefined);
});

void test("a concurrent terminal transition cannot be overwritten", async () => {
  const harness = createHarness("pending", {
    generate: () => {
      harness.repository.status = "refunded";
      return Promise.resolve({ outcome: "ready" });
    },
  });
  assert.deepEqual(await harness.service.process(input()), {
    state: "completed",
    status: "refunded",
  });
  assert.equal(harness.repository.status, "refunded");
});

void test("the delayed cutoff includes the exact fifteen-minute UTC boundary", () => {
  const now = new Date("2026-06-30T12:00:00.000Z");
  assert.equal(reportGenerationCutoff(now, 900_000).toISOString(), "2026-06-30T11:45:00.000Z");
});

function input(
  overrides: Partial<Parameters<ReportGenerationService["process"]>[0]> = {},
): Parameters<ReportGenerationService["process"]>[0] {
  return { reportId: REPORT_ID, attempt: 1, maxAttempts: 3, ...overrides };
}

function createHarness(
  status: PersistedReportStatus | undefined,
  handler: ReportGenerationHandler = {
    generate: () => Promise.resolve({ outcome: "ready" }),
  },
): {
  repository: InMemoryReportGenerationRepository;
  service: ReportGenerationService;
  handlerCalls: () => number;
} {
  const repository = new InMemoryReportGenerationRepository(status);
  let calls = 0;
  const countedHandler: ReportGenerationHandler = {
    async generate(reportId) {
      calls += 1;
      return handler.generate(reportId);
    },
    recoverTerminalFailure(reportId, error) {
      return handler.recoverTerminalFailure?.(reportId, error) ?? Promise.resolve(undefined);
    },
  };
  const logger: GenerationLogger = { info() {}, warn() {}, error() {} };
  return {
    repository,
    service: new ReportGenerationService(repository, countedHandler, logger),
    handlerCalls: () => calls,
  };
}

class InMemoryReportGenerationRepository implements ReportGenerationRepository {
  claimCount = 0;
  completedResult: ReportGenerationResult | undefined;

  constructor(public status: PersistedReportStatus | undefined) {}

  claimPending(): Promise<ReportClaimResult> {
    this.claimCount += 1;
    if (!this.status) return Promise.resolve({ state: "missing" });
    if (this.status === "pending") {
      this.status = "generating";
      return Promise.resolve({ state: "claimed" });
    }
    return Promise.resolve({ state: "existing", status: this.status });
  }

  complete(
    _reportId: string,
    result: ReportGenerationResult,
  ): Promise<PersistedReportStatus | undefined> {
    this.completedResult = result;
    if (this.status === "generating") this.status = result.outcome;
    return Promise.resolve(this.status);
  }

  fail(): Promise<PersistedReportStatus | undefined> {
    if (this.status === "generating") this.status = "failed";
    return Promise.resolve(this.status);
  }

  findDelayed(): Promise<DelayedReport[]> {
    return Promise.resolve([]);
  }
}
