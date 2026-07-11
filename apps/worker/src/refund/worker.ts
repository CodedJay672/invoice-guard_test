import { UnrecoverableError, Worker, type Job } from "bullmq";
import {
  createQueueConnection,
  QUEUE_JOB_NAMES,
  QUEUE_NAMES,
  type ProcessCreditRefundJobData,
} from "@workspace/queues";
import { CreditRefundService } from "./service.js";

export function createCreditRefundWorker(options: {
  connectionString: string;
  service: CreditRefundService;
}): Worker<ProcessCreditRefundJobData, void, string> {
  return new Worker<ProcessCreditRefundJobData, void, string>(
    QUEUE_NAMES.refund,
    async (job: Job<ProcessCreditRefundJobData, void, string>) => {
      if (
        job.name !== QUEUE_JOB_NAMES.processCreditRefund ||
        !/^[0-9a-f-]{36}$/i.test(job.data.refundRequestId)
      )
        throw new UnrecoverableError("Refund job payload is invalid.");
      await options.service.process(job.data.refundRequestId);
    },
    { connection: createQueueConnection({ connectionString: options.connectionString }) },
  );
}
