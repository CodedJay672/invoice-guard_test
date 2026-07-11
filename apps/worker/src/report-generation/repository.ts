import { and, eq, inArray, lte } from "drizzle-orm";

import { schema, type Database } from "@workspace/db";

import type {
  DelayedReport,
  PersistedReportStatus,
  ReportClaimResult,
  ReportGenerationResult,
  ReportGenerationRepository,
} from "./types.js";

const GENERATION_TERMINAL_STATUSES: PersistedReportStatus[] = [
  "ready",
  "partial",
  "failed",
  "refund_required",
  "refunded",
];

export class DrizzleReportGenerationRepository implements ReportGenerationRepository {
  constructor(private readonly db: Database) {}

  async claimPending(reportId: string): Promise<ReportClaimResult> {
    const claimed = await this.db
      .update(schema.purchasedReports)
      .set({ status: "generating", updatedAt: new Date() })
      .where(
        and(
          eq(schema.purchasedReports.id, reportId),
          eq(schema.purchasedReports.status, "pending"),
        ),
      )
      .returning({ id: schema.purchasedReports.id });

    if (claimed[0]) return { state: "claimed" };

    const rows = await this.db
      .select({ status: schema.purchasedReports.status })
      .from(schema.purchasedReports)
      .where(eq(schema.purchasedReports.id, reportId))
      .limit(1);
    const report = rows[0];
    return report ? { state: "existing", status: report.status } : { state: "missing" };
  }

  async complete(
    reportId: string,
    result: ReportGenerationResult,
  ): Promise<PersistedReportStatus | undefined> {
    const completed = await this.db.transaction(async (tx) => {
      const rows = await tx
        .update(schema.purchasedReports)
        .set({
          status: result.outcome,
          reportData: result.reportData,
          providerStatuses: result.providerStatuses,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.purchasedReports.id, reportId),
            eq(schema.purchasedReports.status, "generating"),
          ),
        )
        .returning({ status: schema.purchasedReports.status });
      if (rows[0] && (rows[0].status === "ready" || rows[0].status === "partial")) {
        await tx
          .insert(schema.reportNotifications)
          .values({ reportId, type: "owner_report_ready" })
          .onConflictDoNothing({
            target: [schema.reportNotifications.reportId, schema.reportNotifications.type],
          });
      }
      if (rows[0]?.status === "refund_required") {
        const purchase = (
          await tx
            .select({
              purchaseId: schema.creditPurchases.id,
              unitPricePence: schema.creditPurchases.unitPricePence,
            })
            .from(schema.purchasedReports)
            .innerJoin(
              schema.creditPurchases,
              eq(schema.creditPurchases.id, schema.purchasedReports.creditPurchaseId),
            )
            .where(eq(schema.purchasedReports.id, reportId))
            .limit(1)
        )[0];
        if (purchase) {
          await tx
            .insert(schema.creditRefundRequests)
            .values({
              creditPurchaseId: purchase.purchaseId,
              reportId,
              creditQuantity: 1,
              amountPence: purchase.unitPricePence,
              reason: "Foundational Companies House report generation failure",
            })
            .onConflictDoNothing({ target: schema.creditRefundRequests.reportId });
        }
      }
      return rows;
    });
    if (completed[0]) return completed[0].status;
    return this.findStatus(reportId);
  }

  async fail(reportId: string): Promise<PersistedReportStatus | undefined> {
    const failed = await this.db
      .update(schema.purchasedReports)
      .set({ status: "failed", updatedAt: new Date() })
      .where(
        and(
          eq(schema.purchasedReports.id, reportId),
          eq(schema.purchasedReports.status, "generating"),
        ),
      )
      .returning({ status: schema.purchasedReports.status });
    if (failed[0]) return failed[0].status;
    return this.findStatus(reportId);
  }

  async findDelayed(cutoff: Date): Promise<DelayedReport[]> {
    return this.db
      .select({
        id: schema.purchasedReports.id,
        status: schema.purchasedReports.status,
        updatedAt: schema.purchasedReports.updatedAt,
      })
      .from(schema.purchasedReports)
      .where(
        and(
          inArray(schema.purchasedReports.status, ["pending", "generating"]),
          lte(schema.purchasedReports.updatedAt, cutoff),
        ),
      ) as Promise<DelayedReport[]>;
  }

  private async findStatus(reportId: string): Promise<PersistedReportStatus | undefined> {
    const rows = await this.db
      .select({ status: schema.purchasedReports.status })
      .from(schema.purchasedReports)
      .where(
        and(
          eq(schema.purchasedReports.id, reportId),
          inArray(schema.purchasedReports.status, GENERATION_TERMINAL_STATUSES),
        ),
      )
      .limit(1);
    return rows[0]?.status;
  }
}

export function reportGenerationCutoff(now: Date, stuckAfterMs: number): Date {
  return new Date(now.getTime() - stuckAfterMs);
}
