import { schema, type Database } from "@workspace/db";
import { and, eq } from "drizzle-orm";

import type { DeliverableReportRecord, ReportDeliveryRepository } from "./types.js";

export class DrizzleReportDeliveryRepository implements ReportDeliveryRepository {
  constructor(private readonly db: Database) {}

  async findByReference(reportReference: string): Promise<DeliverableReportRecord | undefined> {
    const rows = await this.db
      .select({
        reportReference: schema.purchasedReports.reportReference,
        clerkUserId: schema.purchasedReports.clerkUserId,
        reportTier: schema.purchasedReports.reportTier,
        entitlements: schema.purchasedReports.entitlements,
        status: schema.purchasedReports.status,
        reportData: schema.purchasedReports.reportData,
        providerStatuses: schema.purchasedReports.providerStatuses,
        pdfStorageUrl: schema.purchasedReports.pdfStorageUrl,
        pdfStatus: schema.reportPdfArtifacts.status,
        pdfObjectKey: schema.reportPdfArtifacts.objectKey,
        notificationStatus: schema.reportNotifications.status,
        notificationAttemptCount: schema.reportNotifications.attemptCount,
        notificationFailureKind: schema.reportNotifications.failureKind,
        notificationUpdatedAt: schema.reportNotifications.updatedAt,
      })
      .from(schema.purchasedReports)
      .leftJoin(
        schema.reportPdfArtifacts,
        eq(schema.reportPdfArtifacts.reportId, schema.purchasedReports.id),
      )
      .leftJoin(
        schema.reportNotifications,
        and(
          eq(schema.reportNotifications.reportId, schema.purchasedReports.id),
          eq(schema.reportNotifications.type, "owner_report_ready"),
        ),
      )
      .where(eq(schema.purchasedReports.reportReference, reportReference))
      .limit(1);

    const row = rows[0];
    if (!row) return undefined;
    const {
      notificationStatus,
      notificationAttemptCount,
      notificationFailureKind,
      notificationUpdatedAt,
      pdfStatus,
      pdfObjectKey,
      ...report
    } = row;
    return {
      ...report,
      pdfArtifact: pdfStatus ? { status: pdfStatus, objectKey: pdfObjectKey } : null,
      notification:
        notificationStatus && notificationAttemptCount !== null && notificationUpdatedAt
          ? {
              status: notificationStatus,
              attemptCount: notificationAttemptCount,
              failureKind: notificationFailureKind,
              updatedAt: notificationUpdatedAt,
            }
          : null,
    };
  }
}
