import { schema, type Database } from "@workspace/db";
import { eq } from "drizzle-orm";

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
      })
      .from(schema.purchasedReports)
      .where(eq(schema.purchasedReports.reportReference, reportReference))
      .limit(1);

    return rows[0];
  }
}
