import { UnrecoverableError, Worker, type Job, type WorkerOptions } from "bullmq";

import {
  createQueueConnection,
  QUEUE_JOB_NAMES,
  QUEUE_NAMES,
  type SendOwnerReportNotificationJobData,
} from "@workspace/queues";

import { OwnerReportNotificationService } from "./service.js";
import type { NotificationLogger } from "./types.js";

export function createOwnerReportNotificationProcessor(service: OwnerReportNotificationService) {
  return async (job: Job<SendOwnerReportNotificationJobData, void, string>): Promise<void> => {
    if (job.name !== QUEUE_JOB_NAMES.sendOwnerReportReady || !isUuid(job.data.reportId)) {
      throw new UnrecoverableError("Owner report notification job payload is invalid.");
    }
    await service.process({
      reportId: job.data.reportId,
      jobId: job.id,
      attempt: Math.max(job.attemptsStarted, 1),
      maxAttempts: typeof job.opts.attempts === "number" ? job.opts.attempts : 1,
    });
  };
}

export function createOwnerReportNotificationWorker(options: {
  connectionString: string;
  service: OwnerReportNotificationService;
  logger: NotificationLogger;
  workerOptions?: Omit<WorkerOptions, "connection">;
}): Worker<SendOwnerReportNotificationJobData, void, string> {
  const worker = new Worker<SendOwnerReportNotificationJobData, void, string>(
    QUEUE_NAMES.email,
    createOwnerReportNotificationProcessor(options.service),
    {
      ...options.workerOptions,
      connection: createQueueConnection({ connectionString: options.connectionString }),
    },
  );
  worker.on("failed", (job) => {
    options.logger.error(
      { jobId: job?.id, reportId: job?.data.reportId, attemptsMade: job?.attemptsMade },
      "Owner report notification job attempt failed",
    );
  });
  return worker;
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}
