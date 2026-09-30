import { UnrecoverableError, Worker, type Job } from "bullmq";

import {
  createQueueConnection,
  QUEUE_JOB_NAMES,
  QUEUE_NAMES,
  type SendAdminAlertJobData,
} from "@workspace/queues";

import { AdminAlertService } from "./service.js";

export function createAdminAlertWorker(
  connectionString: string,
  service: AdminAlertService,
): Worker<SendAdminAlertJobData, void, string> {
  return new Worker(
    QUEUE_NAMES.providerAlert,
    async (job: Job<SendAdminAlertJobData, void, string>) => {
      if (
        job.name !== QUEUE_JOB_NAMES.sendAdminAlert ||
        !/^[0-9a-f-]{36}$/i.test(job.data.alertId)
      ) {
        throw new UnrecoverableError("Admin alert job payload is invalid.");
      }
      await service.process(job.data.alertId);
    },
    { connection: createQueueConnection({ connectionString }) },
  );
}
