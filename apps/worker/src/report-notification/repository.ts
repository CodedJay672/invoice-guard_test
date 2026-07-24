import { and, eq, inArray, sql } from "drizzle-orm";

import { schema, type Database } from "@workspace/db";

import type { OwnerReportNotificationRecord, ReportNotificationRepository } from "./types.js";

export class DrizzleReportNotificationRepository implements ReportNotificationRepository {
  constructor(private readonly db: Database) {}

  async ensureQueued(reportId: string): Promise<void> {
    await this.db
      .insert(schema.reportNotifications)
      .values({ reportId, type: "owner_report_ready" })
      .onConflictDoNothing({
        target: [schema.reportNotifications.reportId, schema.reportNotifications.type],
      });
  }

  async findByReportId(reportId: string): Promise<OwnerReportNotificationRecord | undefined> {
    const rows = await this.db
      .select({
        id: schema.reportNotifications.id,
        reportId: schema.reportNotifications.reportId,
        reportReference: schema.purchasedReports.reportReference,
        clerkUserId: schema.purchasedReports.clerkUserId,
        companyName: schema.purchasedReports.companyName,
        reportTier: schema.purchasedReports.reportTier,
        reportStatus: schema.purchasedReports.status,
        reportData: schema.purchasedReports.reportData,
        status: schema.reportNotifications.status,
        attemptCount: schema.reportNotifications.attemptCount,
      })
      .from(schema.reportNotifications)
      .innerJoin(
        schema.purchasedReports,
        eq(schema.purchasedReports.id, schema.reportNotifications.reportId),
      )
      .where(
        and(
          eq(schema.reportNotifications.reportId, reportId),
          eq(schema.reportNotifications.type, "owner_report_ready"),
          inArray(schema.purchasedReports.status, ["ready", "partial"]),
        ),
      )
      .limit(1);
    return rows[0] as OwnerReportNotificationRecord | undefined;
  }

  async findQueuedReportIds(): Promise<string[]> {
    const rows = await this.db
      .select({ reportId: schema.reportNotifications.reportId })
      .from(schema.reportNotifications)
      .innerJoin(
        schema.purchasedReports,
        eq(schema.purchasedReports.id, schema.reportNotifications.reportId),
      )
      .where(
        and(
          eq(schema.reportNotifications.status, "queued"),
          eq(schema.reportNotifications.type, "owner_report_ready"),
          inArray(schema.purchasedReports.status, ["ready", "partial"]),
        ),
      );
    return rows.map((row) => row.reportId);
  }

  async markSending(notificationId: string): Promise<boolean> {
    const rows = await this.db
      .update(schema.reportNotifications)
      .set({
        status: "sending",
        attemptCount: sql`${schema.reportNotifications.attemptCount} + 1`,
        submissionStartedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.reportNotifications.id, notificationId),
          eq(schema.reportNotifications.status, "queued"),
        ),
      )
      .returning({ id: schema.reportNotifications.id });
    return Boolean(rows[0]);
  }

  async returnToQueue(notificationId: string, failureCode: string): Promise<void> {
    await this.db
      .update(schema.reportNotifications)
      .set({
        status: "queued",
        failureCode,
        failureKind: "explicit_rejection",
        updatedAt: new Date(),
      })
      .where(eq(schema.reportNotifications.id, notificationId));
  }

  async markSent(notificationId: string, messageId: string, sentAt: Date): Promise<void> {
    await this.db
      .update(schema.reportNotifications)
      .set({
        status: "sent",
        postmarkMessageId: messageId,
        sentAt,
        failureCode: null,
        failureKind: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.reportNotifications.id, notificationId));
  }

  async markFailed(
    notificationId: string,
    failureKind: string,
    failureCode: string,
  ): Promise<void> {
    await this.db
      .update(schema.reportNotifications)
      .set({
        status: "failed",
        failureKind,
        failureCode,
        failedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.reportNotifications.id, notificationId));
  }
}
