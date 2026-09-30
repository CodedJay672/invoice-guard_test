import { UnrecoverableError, Worker, type Job } from "bullmq";

import {
  createQueueConnection,
  QUEUE_JOB_NAMES,
  QUEUE_NAMES,
  type MaintenanceJobData,
} from "@workspace/queues";

import { MaintenanceService } from "./service.js";

export function createMaintenanceWorker(
  connectionString: string,
  service: MaintenanceService,
): Worker<MaintenanceJobData, void, string> {
  return new Worker(
    QUEUE_NAMES.maintenance,
    async (job: Job<MaintenanceJobData, void, string>) => {
      if (job.name !== QUEUE_JOB_NAMES.runMaintenance || job.data.version !== 1) {
        throw new UnrecoverableError("Maintenance job payload is invalid.");
      }
      const boundary =
        job.data.scheduleBoundary === "scheduled"
          ? new Date(Math.floor(job.timestamp / 3_600_000) * 3_600_000).toISOString()
          : job.data.scheduleBoundary;
      await service.process({ ...job.data, scheduleBoundary: boundary });
    },
    { connection: createQueueConnection({ connectionString }) },
  );
}
