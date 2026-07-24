import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import type { Job } from "bullmq";

import { DEFAULT_JOB_OPTIONS, QUEUE_JOB_NAMES, QUEUE_NAMES } from "@workspace/queues";

import { ReportGenerationService } from "./service.js";
import type { GenerationLogger, ReportGenerationRepository } from "./types.js";
import { REPORT_GENERATION_JOB_OPTIONS, createReportGenerationProcessor } from "./worker.js";

const REPORT_ID = "123e4567-e89b-42d3-a456-426614174000";
const logger: GenerationLogger = { info() {}, warn() {}, error() {} };

void test("processor uses the canonical queue job contract and attempt metadata", async () => {
  const calls: unknown[] = [];
  const service = {
    process(input: unknown) {
      calls.push(input);
      return Promise.resolve({ state: "noop" as const, status: "ready" as const });
    },
  } as ReportGenerationService;
  const process = createReportGenerationProcessor(service);
  await process({
    name: QUEUE_JOB_NAMES.generatePaidReport,
    data: { reportId: REPORT_ID },
    id: REPORT_ID,
    attemptsStarted: 2,
    opts: { attempts: 3 },
  } as Job<{ reportId: string }, void, string>);
  assert.deepEqual(calls, [{ reportId: REPORT_ID, jobId: REPORT_ID, attempt: 2, maxAttempts: 3 }]);
  assert.equal(QUEUE_NAMES.reportGeneration, "report-generation-queue");
  assert.equal(REPORT_GENERATION_JOB_OPTIONS, DEFAULT_JOB_OPTIONS);
});

void test("malformed report jobs are unrecoverable and never touch persistence", async () => {
  let touched = false;
  const repository = {
    claimPending() {
      touched = true;
      return Promise.resolve({ state: "missing" as const });
    },
    complete() {
      touched = true;
      return Promise.resolve(undefined);
    },
    fail() {
      touched = true;
      return Promise.resolve(undefined);
    },
    findDelayed() {
      touched = true;
      return Promise.resolve([]);
    },
  } satisfies ReportGenerationRepository;
  const service = new ReportGenerationService(
    repository,
    { generate: () => Promise.resolve({ outcome: "ready" }) },
    logger,
  );
  const process = createReportGenerationProcessor(service);

  await assert.rejects(
    () =>
      process({
        name: QUEUE_JOB_NAMES.generatePaidReport,
        data: { reportId: "not-a-uuid" },
        attemptsStarted: 1,
        opts: { attempts: 3 },
      } as Job<{ reportId: string }, void, string>),
    /payload is invalid/,
  );
  assert.equal(touched, false);
});

void test("production bootstrap composes the paid report consumer", () => {
  const source = readFileSync(new URL("../index.ts", import.meta.url), "utf8");
  assert.match(source, /new PaidReportGenerationHandler\s*\(/);
  assert.match(source, /createReportGenerationWorker\s*\(/);
});
