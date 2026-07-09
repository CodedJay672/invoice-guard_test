import { and, eq, inArray, sql } from "drizzle-orm";

import { schema, type Database } from "@workspace/db";

import type { PdfArtifactRecord, PdfArtifactRepository, PdfOutput } from "./types.js";

export class DrizzlePdfArtifactRepository implements PdfArtifactRepository {
  constructor(private readonly db: Database) {}

  async ensureQueued(
    reportId: string,
    templateVersion: string,
    complianceVersion: string,
  ): Promise<boolean> {
    const eligible = await this.db
      .select({ id: schema.purchasedReports.id })
      .from(schema.purchasedReports)
      .where(
        and(
          eq(schema.purchasedReports.id, reportId),
          inArray(schema.purchasedReports.status, ["ready", "partial"]),
        ),
      )
      .limit(1);
    if (!eligible[0]) return false;
    await this.db
      .insert(schema.reportPdfArtifacts)
      .values({ reportId, templateVersion, complianceVersion })
      .onConflictDoUpdate({
        target: schema.reportPdfArtifacts.reportId,
        set: {
          templateVersion,
          complianceVersion,
          status: sql`CASE WHEN ${schema.reportPdfArtifacts.status} = 'failed' THEN 'queued' ELSE ${schema.reportPdfArtifacts.status} END`,
          updatedAt: new Date(),
        },
      })
      .returning({ reportId: schema.reportPdfArtifacts.reportId });
    return true;
  }

  async findQueuedReportIds(): Promise<string[]> {
    const rows = await this.db
      .select({ reportId: schema.reportPdfArtifacts.reportId })
      .from(schema.reportPdfArtifacts)
      .innerJoin(
        schema.purchasedReports,
        eq(schema.purchasedReports.id, schema.reportPdfArtifacts.reportId),
      )
      .where(
        and(
          eq(schema.reportPdfArtifacts.status, "queued"),
          inArray(schema.purchasedReports.status, ["ready", "partial"]),
        ),
      );
    return rows.map(({ reportId }) => reportId);
  }

  async claim(reportId: string): Promise<PdfArtifactRecord | undefined> {
    const claimed = await this.db
      .update(schema.reportPdfArtifacts)
      .set({
        status: "generating",
        attemptCount: sql`${schema.reportPdfArtifacts.attemptCount} + 1`,
        generationStartedAt: new Date(),
        failureCode: null,
        failureMessage: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.reportPdfArtifacts.reportId, reportId),
          eq(schema.reportPdfArtifacts.status, "queued"),
          sql`${schema.reportPdfArtifacts.reportId} IN (
            SELECT ${schema.purchasedReports.id}
            FROM ${schema.purchasedReports}
            WHERE ${eq(schema.purchasedReports.id, reportId)}
            AND ${schema.purchasedReports.status} IN ('ready', 'partial')
          )`,
        ),
      )
      .returning({ reportId: schema.reportPdfArtifacts.reportId });
    if (!claimed[0]) return undefined;
    const rows = await this.db
      .select({
        reportId: schema.reportPdfArtifacts.reportId,
        reportReference: schema.purchasedReports.reportReference,
        reportTier: schema.purchasedReports.reportTier,
        reportStatus: schema.purchasedReports.status,
        reportData: schema.purchasedReports.reportData,
        providerStatuses: schema.purchasedReports.providerStatuses,
        status: schema.reportPdfArtifacts.status,
        attemptCount: schema.reportPdfArtifacts.attemptCount,
        templateVersion: schema.reportPdfArtifacts.templateVersion,
        complianceVersion: schema.reportPdfArtifacts.complianceVersion,
      })
      .from(schema.reportPdfArtifacts)
      .innerJoin(
        schema.purchasedReports,
        eq(schema.purchasedReports.id, schema.reportPdfArtifacts.reportId),
      )
      .where(eq(schema.reportPdfArtifacts.reportId, reportId))
      .limit(1);
    return rows[0] as PdfArtifactRecord | undefined;
  }

  async requeue(reportId: string): Promise<boolean> {
    const rows = await this.db
      .update(schema.reportPdfArtifacts)
      .set({
        status: "queued",
        failedAt: null,
        failureCode: null,
        failureMessage: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.reportPdfArtifacts.reportId, reportId),
          eq(schema.reportPdfArtifacts.status, "generating"),
        ),
      )
      .returning({ reportId: schema.reportPdfArtifacts.reportId });
    return Boolean(rows[0]);
  }

  async complete(reportId: string, output: PdfOutput): Promise<void> {
    await this.db
      .update(schema.reportPdfArtifacts)
      .set({
        status: "ready",
        objectKey: output.objectKey,
        sha256: output.sha256,
        byteSize: output.byteSize,
        generatedAt: output.generatedAt,
        updatedAt: output.generatedAt,
      })
      .where(
        and(
          eq(schema.reportPdfArtifacts.reportId, reportId),
          eq(schema.reportPdfArtifacts.status, "generating"),
        ),
      );
  }

  async fail(reportId: string, code: string, message: string): Promise<void> {
    await this.db
      .update(schema.reportPdfArtifacts)
      .set({
        status: "failed",
        failureCode: code,
        failureMessage: message.slice(0, 1000),
        failedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.reportPdfArtifacts.reportId, reportId));
  }
}
