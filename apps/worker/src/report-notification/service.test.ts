/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/require-await */
import assert from "node:assert/strict";
import test from "node:test";

import { OwnerReportNotificationService } from "./service.js";
import {
  OwnerEmailResolutionError,
  type OwnerReportNotificationRecord,
  type PostmarkSendResult,
  type ReportNotificationRepository,
} from "./types.js";

const REPORT_ID = "11111111-1111-4111-8111-111111111111";

void test("accepted delivery is persisted once and duplicate jobs are no-ops", async () => {
  const repository = memoryRepository();
  let sends = 0;
  const service = createService(repository, async () => {
    sends += 1;
    return { kind: "accepted", messageId: "pm-1", submittedAt: new Date() };
  });
  await service.process({ reportId: REPORT_ID, attempt: 1, maxAttempts: 3 });
  await service.process({ reportId: REPORT_ID, attempt: 2, maxAttempts: 3 });
  assert.equal(sends, 1);
  assert.equal(repository.record.status, "sent");
});

void test("ambiguous submissions become terminal and are never resubmitted", async () => {
  const repository = memoryRepository();
  let sends = 0;
  const service = createService(repository, async () => {
    sends += 1;
    return { kind: "ambiguous", code: "timeout" };
  });
  await service.process({ reportId: REPORT_ID, attempt: 1, maxAttempts: 3 });
  await service.process({ reportId: REPORT_ID, attempt: 2, maxAttempts: 3 });
  assert.equal(sends, 1);
  assert.equal(repository.record.status, "failed");
  assert.equal(repository.failureKind, "ambiguous_submission");
});

void test("explicit transient rejection returns to queue and retries", async () => {
  const repository = memoryRepository();
  let sends = 0;
  const service = createService(repository, async () => {
    sends += 1;
    return sends === 1
      ? { kind: "rejected", code: "postmark_500", retryable: true }
      : { kind: "accepted", messageId: "pm-2", submittedAt: new Date() };
  });
  await assert.rejects(
    service.process({ reportId: REPORT_ID, attempt: 1, maxAttempts: 3 }),
    /explicitly rejected/,
  );
  await service.process({ reportId: REPORT_ID, attempt: 2, maxAttempts: 3 });
  assert.equal(sends, 2);
  assert.equal(repository.record.status, "sent");
});

void test("missing verified owner email fails without calling Postmark", async () => {
  const repository = memoryRepository();
  let sends = 0;
  const service = new OwnerReportNotificationService(
    repository,
    {
      async resolveVerifiedPrimaryEmail() {
        throw new OwnerEmailResolutionError("missing", false, "owner_missing");
      },
    },
    { render: () => ({ subject: "ready", htmlBody: "html", textBody: "text" }) },
    {
      async send() {
        sends += 1;
        return { kind: "ambiguous", code: "unexpected" };
      },
    },
    logger,
  );
  await service.process({ reportId: REPORT_ID, attempt: 1, maxAttempts: 3 });
  assert.equal(sends, 0);
  assert.equal(repository.record.status, "failed");
});

function createService(
  repository: ReturnType<typeof memoryRepository>,
  send: () => Promise<PostmarkSendResult>,
) {
  return new OwnerReportNotificationService(
    repository,
    {
      async resolveVerifiedPrimaryEmail() {
        return "owner@example.com";
      },
    },
    { render: () => ({ subject: "ready", htmlBody: "html", textBody: "text" }) },
    { send },
    logger,
  );
}

function memoryRepository() {
  const record: OwnerReportNotificationRecord = {
    id: "notification-1",
    reportId: REPORT_ID,
    reportReference: "IG-2026-ABCDEF123456",
    clerkUserId: "user_1",
    companyName: "Example Limited",
    reportTier: "basic",
    reportStatus: "ready",
    reportData: {},
    status: "queued",
    attemptCount: 0,
  };
  return {
    record,
    failureKind: "",
    async ensureQueued() {},
    async findByReportId() {
      return record;
    },
    async findQueuedReportIds() {
      return [REPORT_ID];
    },
    async markSending() {
      if (record.status !== "queued") return false;
      record.status = "sending";
      record.attemptCount += 1;
      return true;
    },
    async returnToQueue() {
      record.status = "queued";
    },
    async markSent() {
      record.status = "sent";
    },
    async markFailed(_id: string, kind: string) {
      record.status = "failed";
      this.failureKind = kind;
    },
  } satisfies ReportNotificationRepository & {
    record: OwnerReportNotificationRecord;
    failureKind: string;
  };
}

const logger = { info() {}, warn() {}, error() {} };
