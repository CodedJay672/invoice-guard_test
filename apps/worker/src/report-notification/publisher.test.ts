/* eslint-disable @typescript-eslint/require-await */
import assert from "node:assert/strict";
import test from "node:test";

import type { InvoiceGuardQueue, SendOwnerReportNotificationJobData } from "@workspace/queues";

import { OwnerNotificationPublisher, ownerNotificationJobId } from "./publisher.js";
import type { ReportNotificationRepository } from "./types.js";

void test("publisher uses deterministic jobs and reconciles every durable queued record", async () => {
  const ensured: string[] = [];
  const added: Array<{ name: string; reportId: string; jobId: string | undefined }> = [];
  const repository = {
    async ensureQueued(reportId: string) {
      ensured.push(reportId);
    },
    async findQueuedReportIds() {
      return ["report-a", "report-b"];
    },
  } as ReportNotificationRepository;
  const queue = {
    async add(
      name: string,
      data: SendOwnerReportNotificationJobData,
      options?: { jobId?: string },
    ) {
      added.push({ name, reportId: data.reportId, jobId: options?.jobId });
      return {};
    },
  } as unknown as InvoiceGuardQueue<SendOwnerReportNotificationJobData, void, string>;
  const publisher = new OwnerNotificationPublisher(repository, queue);
  assert.equal(await publisher.reconcileQueued(), 2);
  assert.deepEqual(ensured, ["report-a", "report-b"]);
  assert.deepEqual(
    added.map((job) => job.jobId),
    [ownerNotificationJobId("report-a"), ownerNotificationJobId("report-b")],
  );
  assert.equal(new Set(added.map((job) => job.jobId)).size, 2);
});
