import { createHash } from "node:crypto";

import { frozenPaidReportSchema, frozenProviderStatusesSchema } from "@workspace/validation";

import type {
  ComplianceContent,
  PdfArtifactRepository,
  PdfLogger,
  PdfObjectStore,
  PdfRenderer,
} from "./types.js";

export class PdfGenerationService {
  constructor(
    private readonly repository: PdfArtifactRepository,
    private readonly renderer: PdfRenderer,
    private readonly storage: PdfObjectStore,
    private readonly compliance: ComplianceContent,
    private readonly logger: PdfLogger,
  ) {}

  async process(
    reportId: string,
    attempt: number,
    maxAttempts: number,
  ): Promise<"completed" | "noop"> {
    const artifact = await this.repository.claim(reportId);
    if (!artifact) return "noop";
    try {
      const report = frozenPaidReportSchema.parse(artifact.reportData);
      const statuses = frozenProviderStatusesSchema.parse(artifact.providerStatuses);
      const pdf = await this.renderer.render({ report, statuses, compliance: this.compliance });
      const sha256 = createHash("sha256").update(pdf).digest("hex");
      const objectKey = `reports/${reportId}/${artifact.templateVersion}.pdf`;
      await this.storage.put({ key: objectKey, body: pdf, sha256 });
      await this.repository.complete(reportId, {
        objectKey,
        sha256,
        byteSize: pdf.byteLength,
        generatedAt: new Date(),
      });
      this.logger.info({ reportId, objectKey, byteSize: pdf.byteLength }, "Report PDF generated");
      return "completed";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown PDF generation failure";
      if (attempt < maxAttempts) {
        await this.repository.requeue(reportId);
        this.logger.warn({ reportId, attempt, error }, "PDF generation attempt will be retried");
        throw error;
      }
      await this.repository.fail(reportId, "generation_failed", message);
      this.logger.error({ reportId, error }, "PDF generation reached terminal failure");
      return "completed";
    }
  }
}
