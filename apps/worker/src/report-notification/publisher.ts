import type { InvoiceGuardQueue, SendOwnerReportNotificationJobData } from "@workspace/queues";
import { QUEUE_JOB_NAMES } from "@workspace/queues";

import type { ReportNotificationRepository } from "./types.js";

export class OwnerNotificationPublisher {
  constructor(
    private readonly repository: ReportNotificationRepository,
    private readonly queue: InvoiceGuardQueue<SendOwnerReportNotificationJobData, void, string>,
  ) {}

  async publish(reportId: string): Promise<void> {
    await this.repository.ensureQueued(reportId);
    await this.queue.add(
      QUEUE_JOB_NAMES.sendOwnerReportReady,
      { reportId },
      {
        jobId: ownerNotificationJobId(reportId),
        attempts: 5,
        backoff: { type: "exponential", delay: 30_000 },
      },
    );
  }

  async reconcileQueued(): Promise<number> {
    const reportIds = await this.repository.findQueuedReportIds();
    await Promise.all(reportIds.map((reportId) => this.publish(reportId)));
    return reportIds.length;
  }
}

export function ownerNotificationJobId(reportId: string): string {
  return `owner-report-ready-${reportId}`;
}
