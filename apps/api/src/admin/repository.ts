import { desc, eq, inArray, sql } from "drizzle-orm";

import { type Database, schema } from "@workspace/db";

export type AdminCollection =
  | "reports"
  | "payments"
  | "refunds"
  | "providers"
  | "searches"
  | "alerts"
  | "maintenance";

interface AdminOverview {
  reportsByStatus: Array<{ status: string; count: number }>;
  purchaseCount: number;
  refundCount: number;
  qualifyingTransactions: number;
  netRevenuePence: number;
  searchCount: number;
  conversionRate: number;
  openAlertCount: number;
  failedMaintenanceCount: number;
}

interface AdminPage {
  items: unknown[];
  page: number;
  limit: number;
  total: number;
}

export class AdminRepository {
  constructor(private readonly db: Database) {}

  async overview(): Promise<AdminOverview> {
    const [reports, purchases, refunds, searches, alerts, maintenance] = await Promise.all([
      this.db
        .select({ status: schema.purchasedReports.status, count: sql<number>`count(*)::int` })
        .from(schema.purchasedReports)
        .groupBy(schema.purchasedReports.status),
      this.db.select().from(schema.creditPurchases),
      this.db.select().from(schema.creditRefundRequests),
      this.db.select({ count: sql<number>`count(*)::int` }).from(schema.searchLogs),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.adminAlerts)
        .where(inArray(schema.adminAlerts.status, ["queued", "sending", "failed"])),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.maintenanceRuns)
        .where(eq(schema.maintenanceRuns.status, "failed")),
    ]);
    const qualifyingTransactions = reports
      .filter((row) => row.status === "ready" || row.status === "partial")
      .reduce((sum, row) => sum + row.count, 0);
    const grossRevenuePence = purchases.reduce((sum, row) => sum + row.amountPaidPence, 0);
    const refundedPence = purchases.reduce((sum, row) => sum + row.amountRefundedPence, 0);
    const searchCount = searches[0]?.count ?? 0;
    return {
      reportsByStatus: reports,
      purchaseCount: purchases.length,
      refundCount: refunds.length,
      qualifyingTransactions,
      netRevenuePence: grossRevenuePence - refundedPence,
      searchCount,
      conversionRate: searchCount === 0 ? 0 : qualifyingTransactions / searchCount,
      openAlertCount: alerts[0]?.count ?? 0,
      failedMaintenanceCount: maintenance[0]?.count ?? 0,
    };
  }

  async collection(collection: AdminCollection, page: number, limit: number): Promise<AdminPage> {
    const offset = (page - 1) * limit;
    switch (collection) {
      case "reports": {
        const [items, total] = await Promise.all([
          this.db
            .select()
            .from(schema.purchasedReports)
            .orderBy(desc(schema.purchasedReports.createdAt))
            .limit(limit)
            .offset(offset),
          this.db.select({ count: sql<number>`count(*)::int` }).from(schema.purchasedReports),
        ]);
        return { items, page, limit, total: total[0]?.count ?? 0 };
      }
      case "payments": {
        const [items, total] = await Promise.all([
          this.db
            .select()
            .from(schema.creditPurchases)
            .orderBy(desc(schema.creditPurchases.createdAt))
            .limit(limit)
            .offset(offset),
          this.db.select({ count: sql<number>`count(*)::int` }).from(schema.creditPurchases),
        ]);
        return { items, page, limit, total: total[0]?.count ?? 0 };
      }
      case "refunds": {
        const [items, total] = await Promise.all([
          this.db
            .select()
            .from(schema.creditRefundRequests)
            .orderBy(desc(schema.creditRefundRequests.createdAt))
            .limit(limit)
            .offset(offset),
          this.db.select({ count: sql<number>`count(*)::int` }).from(schema.creditRefundRequests),
        ]);
        return { items, page, limit, total: total[0]?.count ?? 0 };
      }
      case "providers": {
        const [items, total] = await Promise.all([
          this.db
            .select()
            .from(schema.providerUsageLogs)
            .orderBy(desc(schema.providerUsageLogs.createdAt))
            .limit(limit)
            .offset(offset),
          this.db.select({ count: sql<number>`count(*)::int` }).from(schema.providerUsageLogs),
        ]);
        return { items, page, limit, total: total[0]?.count ?? 0 };
      }
      case "searches": {
        const [items, total] = await Promise.all([
          this.db
            .select()
            .from(schema.searchLogs)
            .orderBy(desc(schema.searchLogs.createdAt))
            .limit(limit)
            .offset(offset),
          this.db.select({ count: sql<number>`count(*)::int` }).from(schema.searchLogs),
        ]);
        return { items, page, limit, total: total[0]?.count ?? 0 };
      }
      case "alerts": {
        const [items, total] = await Promise.all([
          this.db
            .select()
            .from(schema.adminAlerts)
            .orderBy(desc(schema.adminAlerts.occurredAt))
            .limit(limit)
            .offset(offset),
          this.db.select({ count: sql<number>`count(*)::int` }).from(schema.adminAlerts),
        ]);
        return { items, page, limit, total: total[0]?.count ?? 0 };
      }
      case "maintenance": {
        const [items, total] = await Promise.all([
          this.db
            .select()
            .from(schema.maintenanceRuns)
            .orderBy(desc(schema.maintenanceRuns.startedAt))
            .limit(limit)
            .offset(offset),
          this.db.select({ count: sql<number>`count(*)::int` }).from(schema.maintenanceRuns),
        ]);
        return { items, page, limit, total: total[0]?.count ?? 0 };
      }
    }
  }
}
