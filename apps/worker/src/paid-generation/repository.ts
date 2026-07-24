import { createHash } from "node:crypto";

import { and, desc, eq, gte, max } from "drizzle-orm";

import { schema, type Database } from "@workspace/db";
import type { ProviderName, ProviderResult } from "@workspace/integrations";
import { paidReportEntitlementsSchema } from "@workspace/validation/paid-report";

import type {
  FairPaymentCodeRecord,
  GeneratingPaidReport,
  PaidGenerationRepository,
  PaidReportSnapshot,
} from "./types.js";
import { ReportGenerationError } from "../report-generation/types.js";

export class DrizzlePaidGenerationRepository implements PaidGenerationRepository {
  constructor(private readonly db: Database) {}

  async findGeneratingReport(reportId: string): Promise<GeneratingPaidReport | undefined> {
    const rows = await this.db
      .select()
      .from(schema.purchasedReports)
      .where(
        and(
          eq(schema.purchasedReports.id, reportId),
          eq(schema.purchasedReports.status, "generating"),
        ),
      )
      .limit(1);
    const row = rows[0];
    if (!row) return undefined;
    if (!row.stripeCheckoutSessionId || row.amountPaidPence <= 0 || row.currency !== "GBP") {
      throw new ReportGenerationError(
        "Generating report does not have verified paid ownership data.",
        false,
      );
    }
    return {
      id: row.id,
      reportReference: row.reportReference,
      clerkUserId: row.clerkUserId,
      stripeCheckoutSessionId: row.stripeCheckoutSessionId,
      amountPaidPence: row.amountPaidPence,
      currency: row.currency,
      companiesHouseNumber: row.companiesHouseNumber,
      companyName: row.companyName,
      reportTier: row.reportTier,
      entitlements: paidReportEntitlementsSchema.parse(row.entitlements),
    };
  }

  async findReusableSuccess(
    reportId: string,
    provider: ProviderName,
    operation: string,
    cutoff: Date,
  ): Promise<PaidReportSnapshot | undefined> {
    const rows = await this.db
      .select()
      .from(schema.companyDataSnapshots)
      .where(
        and(
          eq(schema.companyDataSnapshots.reportId, reportId),
          eq(schema.companyDataSnapshots.provider, provider),
          eq(schema.companyDataSnapshots.operation, operation),
          eq(schema.companyDataSnapshots.status, "success"),
          gte(schema.companyDataSnapshots.fetchedAt, cutoff),
        ),
      )
      .orderBy(desc(schema.companyDataSnapshots.attempt))
      .limit(1);
    return rows[0] ? mapSnapshot(rows[0]) : undefined;
  }

  async listLatestSnapshots(reportId: string): Promise<PaidReportSnapshot[]> {
    const rows = await this.db
      .select()
      .from(schema.companyDataSnapshots)
      .where(eq(schema.companyDataSnapshots.reportId, reportId))
      .orderBy(desc(schema.companyDataSnapshots.attempt));
    const latest = new Map<string, PaidReportSnapshot>();
    for (const row of rows) {
      const key = `${row.provider}:${row.operation}`;
      if (!latest.has(key)) latest.set(key, mapSnapshot(row));
    }
    return [...latest.values()];
  }

  async saveSnapshot(input: {
    report: GeneratingPaidReport;
    operation: string;
    result: ProviderResult<Record<string, unknown>>;
  }): Promise<PaidReportSnapshot> {
    const attemptRows = await this.db
      .select({ value: max(schema.companyDataSnapshots.attempt) })
      .from(schema.companyDataSnapshots)
      .where(
        and(
          eq(schema.companyDataSnapshots.reportId, input.report.id),
          eq(schema.companyDataSnapshots.provider, input.result.provider),
          eq(schema.companyDataSnapshots.operation, input.operation),
        ),
      );
    const attempt = (attemptRows[0]?.value ?? 0) + 1;
    const data = input.result.status === "success" ? input.result.data : {};
    const inserted = await this.db
      .insert(schema.companyDataSnapshots)
      .values({
        reportId: input.report.id,
        companiesHouseNumber: input.report.companiesHouseNumber,
        provider: input.result.provider,
        operation: input.operation,
        attempt,
        sourceContext: "paid_report",
        reportTier: input.report.reportTier,
        snapshotData: data,
        snapshotHash: createHash("sha256").update(stableJson(data)).digest("hex"),
        status: input.result.status,
        errorCode: input.result.status === "failed" ? input.result.errorCode : null,
        errorMessage: input.result.status === "failed" ? input.result.errorMessage : null,
        retryable: input.result.status === "failed" ? input.result.retryable : false,
        fetchedAt: new Date(input.result.checkedAt),
      })
      .returning();
    if (!inserted[0]) throw new Error("Paid provider snapshot was not persisted.");
    return mapSnapshot(inserted[0]);
  }

  async logProviderUsage(input: {
    report: GeneratingPaidReport;
    provider: ProviderName;
    operation: string;
    status: "success" | "failed";
    estimatedCostPence: number | null;
  }): Promise<void> {
    await this.db.insert(schema.providerUsageLogs).values({
      provider: input.provider,
      operation: input.operation,
      companiesHouseNumber: input.report.companiesHouseNumber,
      reportId: input.report.id,
      reportTier: input.report.reportTier,
      estimatedCostPence: input.estimatedCostPence,
      status: input.status,
    });
  }

  async findFairPaymentCode(companyNumber: string): Promise<FairPaymentCodeRecord | undefined> {
    const rows = await this.db
      .select()
      .from(schema.fairPaymentCodeStatuses)
      .where(eq(schema.fairPaymentCodeStatuses.companiesHouseNumber, companyNumber))
      .limit(1);
    const row = rows[0];
    return row
      ? {
          companiesHouseNumber: row.companiesHouseNumber,
          statusLabel: row.statusLabel,
          awardLevel: row.awardLevel,
          sourceReference: row.sourceReference,
          verifiedAt: row.verifiedAt,
          expiresAt: row.expiresAt,
        }
      : undefined;
  }
}

function mapSnapshot(row: typeof schema.companyDataSnapshots.$inferSelect): PaidReportSnapshot {
  return {
    provider: row.provider as ProviderName,
    operation: row.operation,
    attempt: row.attempt,
    checkedAt: row.fetchedAt.toISOString(),
    status: row.status,
    data: row.status === "success" ? row.snapshotData : null,
    errorCode: row.errorCode,
    errorMessage: row.errorMessage,
    retryable: row.retryable,
  };
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableJson(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
