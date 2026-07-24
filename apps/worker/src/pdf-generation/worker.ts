import { UnrecoverableError, Worker, type Job } from "bullmq";

import {
  createQueueConnection,
  QUEUE_JOB_NAMES,
  QUEUE_NAMES,
  type GenerateReportPdfJobData,
} from "@workspace/queues";

import { PdfGenerationService } from "./service.js";
import type { PdfLogger } from "./types.js";

export function createPdfGenerationProcessor(service: PdfGenerationService) {
  return async (job: Job<GenerateReportPdfJobData, void, string>): Promise<void> => {
    if (job.name !== QUEUE_JOB_NAMES.generateReportPdf || !isUuid(job.data.reportId))
      throw new UnrecoverableError("PDF generation job payload is invalid.");
    await service.process(
      job.data.reportId,
      Math.max(job.attemptsStarted, 1),
      typeof job.opts.attempts === "number" ? job.opts.attempts : 1,
    );
  };
}

export function createPdfGenerationWorker(options: {
  connectionString: string;
  service: PdfGenerationService;
  logger: PdfLogger;
}): Worker<GenerateReportPdfJobData, void, string> {
  const worker = new Worker(
    QUEUE_NAMES.pdfGeneration,
    createPdfGenerationProcessor(options.service),
    { connection: createQueueConnection({ connectionString: options.connectionString }) },
  );
  worker.on("failed", (job, error) =>
    options.logger.error(
      { jobId: job?.id, reportId: job?.data.reportId, error },
      "PDF generation job failed",
    ),
  );
  return worker;
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}
