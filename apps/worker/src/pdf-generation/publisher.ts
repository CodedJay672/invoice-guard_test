import type { InvoiceGuardQueue, GenerateReportPdfJobData } from "@workspace/queues";
import { DEFAULT_JOB_OPTIONS, QUEUE_JOB_NAMES } from "@workspace/queues";

import type { PdfArtifactRepository } from "./types.js";

export class PdfPublisher {
  constructor(
    private readonly repository: PdfArtifactRepository,
    private readonly queue: InvoiceGuardQueue<GenerateReportPdfJobData, void, string>,
    private readonly templateVersion: string,
    private readonly complianceVersion: string,
  ) {}

  async publish(reportId: string): Promise<void> {
    const eligible = await this.repository.ensureQueued(
      reportId,
      this.templateVersion,
      this.complianceVersion,
    );
    if (!eligible) return;
    await this.queue.add(
      QUEUE_JOB_NAMES.generateReportPdf,
      { reportId },
      {
        jobId: pdfJobId(reportId, this.templateVersion),
        attempts: 3,
        backoff: { type: "exponential", delay: 5_000 },
      },
    );
  }

  async reconcileQueued(): Promise<number> {
    const reportIds = await this.repository.findQueuedReportIds();
    await Promise.all(reportIds.map((reportId) => this.publish(reportId)));
    return reportIds.length;
  }
}

export function pdfJobId(reportId: string, templateVersion: string): string {
  return `report-pdf-${reportId}-${templateVersion}`;
}
