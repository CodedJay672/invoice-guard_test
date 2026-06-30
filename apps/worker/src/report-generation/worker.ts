import { UnrecoverableError, Worker, type Job, type WorkerOptions } from "bullmq";

import {
  createQueueConnection,
  DEFAULT_JOB_OPTIONS,
  QUEUE_JOB_NAMES,
  QUEUE_NAMES,
  type GeneratePaidReportJobData,
} from "@workspace/queues";

import { ReportGenerationService } from "./service.js";
import type { GenerationLogger } from "./types.js";

export interface CreateReportGenerationWorkerOptions {
  connectionString: string;
  service: ReportGenerationService;
  logger: GenerationLogger;
  workerOptions?: Omit<WorkerOptions, "connection"> | undefined;
}

export function createReportGenerationProcessor(service: ReportGenerationService) {
  return async (job: Job<GeneratePaidReportJobData, void, string>): Promise<void> => {
    if (job.name !== QUEUE_JOB_NAMES.generatePaidReport || !isUuid(job.data.reportId)) {
      throw new UnrecoverableError("Report generation job payload is invalid.");
    }

    const maxAttempts = typeof job.opts.attempts === "number" ? job.opts.attempts : 1;
    await service.process({
      reportId: job.data.reportId,
      jobId: job.id,
      attempt: Math.max(job.attemptsStarted, 1),
      maxAttempts,
    });
  };
}

export function createReportGenerationWorker(
  options: CreateReportGenerationWorkerOptions,
): Worker<GeneratePaidReportJobData, void, string> {
  if (!options.service) {
    throw new Error("A real report generation service is required before starting the worker.");
  }

  const worker = new Worker<GeneratePaidReportJobData, void, string>(
    QUEUE_NAMES.reportGeneration,
    createReportGenerationProcessor(options.service),
    {
      ...options.workerOptions,
      connection: createQueueConnection({ connectionString: options.connectionString }),
    },
  );
  worker.on("failed", (job, error) => {
    options.logger.error(
      { jobId: job?.id, reportId: job?.data.reportId, attemptsMade: job?.attemptsMade },
      error instanceof UnrecoverableError
        ? "Report generation job was rejected"
        : "Report generation job attempt failed",
    );
  });
  return worker;
}

export const REPORT_GENERATION_JOB_OPTIONS = DEFAULT_JOB_OPTIONS;

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}
