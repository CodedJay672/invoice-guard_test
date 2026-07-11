import { eq } from "drizzle-orm";
import { schema, type Database } from "@workspace/db";
import {
  QUEUE_JOB_NAMES,
  type InvoiceGuardQueue,
  type ProcessCreditRefundJobData,
} from "@workspace/queues";

export class CreditRefundPublisher {
  constructor(
    private readonly db: Database,
    private readonly queue: InvoiceGuardQueue<ProcessCreditRefundJobData, void, string>,
  ) {}
  async publish(reportId: string): Promise<void> {
    const request = (
      await this.db
        .select({ id: schema.creditRefundRequests.id })
        .from(schema.creditRefundRequests)
        .where(eq(schema.creditRefundRequests.reportId, reportId))
        .limit(1)
    )[0];
    if (request)
      await this.queue.add(
        QUEUE_JOB_NAMES.processCreditRefund,
        { refundRequestId: request.id },
        { jobId: request.id },
      );
  }
  async reconcile(): Promise<void> {
    const queued = await this.db
      .select({ id: schema.creditRefundRequests.id })
      .from(schema.creditRefundRequests)
      .where(eq(schema.creditRefundRequests.status, "queued"));
    await Promise.all(
      queued.map((item) =>
        this.queue.add(
          QUEUE_JOB_NAMES.processCreditRefund,
          { refundRequestId: item.id },
          { jobId: item.id },
        ),
      ),
    );
  }
}
