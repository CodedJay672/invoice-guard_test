import assert from "node:assert/strict";
import test from "node:test";

import { PdfPublisher, pdfJobId } from "./publisher.js";
import type { PdfArtifactRepository } from "./types.js";

void test("publishes deterministic jobs only for repository-approved Premium reports", async () => {
  const jobs: string[] = [];
  const repository = repositoryWithEligibility(true);
  const queue = {
    add(name: string, _data: unknown, options?: { jobId?: string }) {
      jobs.push(`${name}:${String(options?.jobId)}`);
      return Promise.resolve(undefined as never);
    },
  } as never;
  const publisher = new PdfPublisher(repository, queue, "premium-pdf-v1", "fixture-v1");
  await publisher.publish("11111111-1111-4111-8111-111111111111");
  assert.deepEqual(jobs, [
    `generate-report-pdf:${pdfJobId("11111111-1111-4111-8111-111111111111", "premium-pdf-v1")}`,
  ]);

  const excluded = new PdfPublisher(
    repositoryWithEligibility(false),
    queue,
    "premium-pdf-v1",
    "fixture-v1",
  );
  await excluded.publish("22222222-2222-4222-8222-222222222222");
  assert.equal(jobs.length, 1);
});

function repositoryWithEligibility(eligible: boolean): PdfArtifactRepository {
  return {
    ensureQueued: () => Promise.resolve(eligible),
    findQueuedReportIds: () => Promise.resolve([]),
    claim: () => Promise.resolve(undefined),
    requeue: () => Promise.resolve(false),
    complete: () => Promise.resolve(),
    fail: () => Promise.resolve(),
  };
}
