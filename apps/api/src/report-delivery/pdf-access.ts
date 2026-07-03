import { GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, eq } from "drizzle-orm";

import { schema, type Database } from "@workspace/db";
import type { InvoiceGuardQueue, GenerateReportPdfJobData } from "@workspace/queues";
import { QUEUE_JOB_NAMES } from "@workspace/queues";

import { ReportNotFoundError } from "./types.js";

export class PdfAccessService {
  private readonly client: S3Client;

  constructor(
    private readonly db: Database,
    private readonly queue: InvoiceGuardQueue<GenerateReportPdfJobData, void, string>,
    private readonly bucket: string,
    options: { endpoint: string; accessKeyId: string; secretAccessKey: string },
  ) {
    this.client = new S3Client({
      region: "auto",
      endpoint: options.endpoint,
      credentials: { accessKeyId: options.accessKeyId, secretAccessKey: options.secretAccessKey },
    });
  }

  async createDownloadUrl(reportReference: string, clerkUserId: string): Promise<string> {
    const artifact = await this.findOwned(reportReference, clerkUserId);
    if (artifact.status !== "ready" || !artifact.objectKey) throw new PdfNotReadyError();
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: artifact.objectKey }),
      );
    } catch {
      throw new PdfObjectMissingError();
    }
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: artifact.objectKey,
        ResponseContentType: "application/pdf",
        ResponseContentDisposition: `attachment; filename="InvoiceGuard-${reportReference}.pdf"`,
      }),
      { expiresIn: 60 },
    );
  }

  async retry(
    reportReference: string,
    clerkUserId: string,
  ): Promise<"queued" | "generating" | "ready"> {
    const artifact = await this.findOwned(reportReference, clerkUserId);
    if (artifact.status === "ready") return "ready";
    if (artifact.status === "queued" || artifact.status === "generating") return "generating";
    const rows = await this.db
      .select({
        reportId: schema.reportPdfArtifacts.reportId,
        templateVersion: schema.reportPdfArtifacts.templateVersion,
      })
      .from(schema.reportPdfArtifacts)
      .where(
        and(
          eq(schema.reportPdfArtifacts.reportId, artifact.reportId),
          eq(schema.reportPdfArtifacts.status, "failed"),
        ),
      )
      .limit(1);
    if (!rows[0]) return "generating";
    await this.queue.add(
      QUEUE_JOB_NAMES.generateReportPdf,
      { reportId: rows[0].reportId },
      { jobId: `report-pdf-${rows[0].reportId}-${rows[0].templateVersion}-retry-${Date.now()}` },
    );
    await this.db
      .update(schema.reportPdfArtifacts)
      .set({
        status: "queued",
        failureCode: null,
        failureMessage: null,
        failedAt: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.reportPdfArtifacts.reportId, rows[0].reportId),
          eq(schema.reportPdfArtifacts.status, "failed"),
        ),
      );
    return "queued";
  }

  private async findOwned(
    reportReference: string,
    clerkUserId: string,
  ): Promise<{
    reportId: string;
    status: "queued" | "generating" | "ready" | "failed";
    objectKey: string | null;
  }> {
    const rows = await this.db
      .select({
        reportId: schema.reportPdfArtifacts.reportId,
        status: schema.reportPdfArtifacts.status,
        objectKey: schema.reportPdfArtifacts.objectKey,
      })
      .from(schema.purchasedReports)
      .innerJoin(
        schema.reportPdfArtifacts,
        eq(schema.reportPdfArtifacts.reportId, schema.purchasedReports.id),
      )
      .where(
        and(
          eq(schema.purchasedReports.reportReference, reportReference),
          eq(schema.purchasedReports.clerkUserId, clerkUserId),
          eq(schema.purchasedReports.reportTier, "premium"),
        ),
      )
      .limit(1);
    if (!rows[0]) throw new ReportNotFoundError(true);
    return rows[0];
  }
}

export class PdfNotReadyError extends Error {}
export class PdfObjectMissingError extends Error {}
