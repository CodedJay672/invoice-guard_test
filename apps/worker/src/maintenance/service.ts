import { and, eq, isNotNull, isNull, lt, or } from "drizzle-orm";

import { type Database, schema } from "@workspace/db";
import type { MaintenanceJobData } from "@workspace/queues";

export class MaintenanceService {
  constructor(
    private readonly db: Database,
    private readonly options: {
      stuckAfterMs: number;
      publishAlert(alertId: string): Promise<void>;
      reconcileNotifications?(): Promise<number>;
      reconcilePdfs?(): Promise<number>;
      reconcileRefunds?(): Promise<number>;
      refreshFairPaymentCode?(): Promise<{ examined: number; changed: number }>;
    },
  ) {}

  async process(job: MaintenanceJobData): Promise<void> {
    const boundary = new Date(job.scheduleBoundary);
    if (Number.isNaN(boundary.getTime())) throw new Error("Maintenance boundary is invalid.");
    const inserted = await this.db
      .insert(schema.maintenanceRuns)
      .values({ task: job.task, scheduleBoundary: boundary })
      .onConflictDoNothing()
      .returning({ id: schema.maintenanceRuns.id });
    const runId = inserted[0]?.id;
    if (!runId) return;

    try {
      const result = await this.execute(job.task, boundary);
      await this.db
        .update(schema.maintenanceRuns)
        .set({
          status: "succeeded",
          recordsExamined: result.examined,
          recordsChanged: result.changed,
          finishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.maintenanceRuns.id, runId));
    } catch (error) {
      const summary = error instanceof Error ? error.message.slice(0, 500) : "Maintenance failed.";
      await this.db
        .update(schema.maintenanceRuns)
        .set({
          status: "failed",
          safeErrorSummary: summary,
          finishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.maintenanceRuns.id, runId));
      await this.createAlert(job.task, boundary, summary);
      throw error;
    }
  }

  private async execute(
    task: MaintenanceJobData["task"],
    boundary: Date,
  ): Promise<{ examined: number; changed: number }> {
    if (task === "anonymise_old_search_logs") {
      const cutoff = new Date(boundary.getTime() - 90 * 24 * 60 * 60 * 1000);
      const changed = await this.db
        .update(schema.searchLogs)
        .set({ ipHash: null, ipAnonymisedAt: boundary })
        .where(
          and(
            lt(schema.searchLogs.createdAt, cutoff),
            isNotNull(schema.searchLogs.ipHash),
            isNull(schema.searchLogs.ipAnonymisedAt),
          ),
        )
        .returning({ id: schema.searchLogs.id });
      return { examined: changed.length, changed: changed.length };
    }
    if (task === "detect_stuck_reports") {
      const cutoff = new Date(boundary.getTime() - this.options.stuckAfterMs);
      const stuck = await this.db
        .select({
          id: schema.purchasedReports.id,
          reference: schema.purchasedReports.reportReference,
        })
        .from(schema.purchasedReports)
        .where(
          and(
            or(
              eq(schema.purchasedReports.status, "pending"),
              eq(schema.purchasedReports.status, "generating"),
            ),
            lt(schema.purchasedReports.updatedAt, cutoff),
          ),
        );
      for (const report of stuck) {
        await this.createAlert(
          "stuck_report",
          boundary,
          `Report ${report.reference} has exceeded the generation threshold.`,
          report.id,
        );
      }
      return { examined: stuck.length, changed: stuck.length };
    }
    if (task === "refresh_fair_payment_code") {
      if (!this.options.refreshFairPaymentCode) {
        throw new Error("Official Fair Payment Code source is not configured.");
      }
      return this.options.refreshFairPaymentCode();
    }
    const reconciler: (() => Promise<number>) | undefined =
      task === "reconcile_notifications"
        ? () => this.options.reconcileNotifications?.() ?? Promise.resolve(0)
        : task === "reconcile_pdfs"
          ? () => this.options.reconcilePdfs?.() ?? Promise.resolve(0)
          : task === "reconcile_refunds"
            ? () => this.options.reconcileRefunds?.() ?? Promise.resolve(0)
            : undefined;
    if (!reconciler) return { examined: 0, changed: 0 };
    const changed = await reconciler();
    return { examined: changed, changed };
  }

  private async createAlert(
    category: string,
    boundary: Date,
    message: string,
    relatedEntityId?: string,
  ): Promise<void> {
    const inserted = await this.db
      .insert(schema.adminAlerts)
      .values({
        category,
        severity: category === "stuck_report" ? "important" : "critical",
        subject: `InvoiceGuard ${category.replaceAll("_", " ")}`,
        message,
        relatedEntityType: relatedEntityId ? "report" : "maintenance",
        relatedEntityId,
        deduplicationKey: `${category}:${relatedEntityId ?? boundary.toISOString()}`,
      })
      .onConflictDoNothing()
      .returning({ id: schema.adminAlerts.id });
    if (inserted[0]) await this.options.publishAlert(inserted[0].id);
  }
}
