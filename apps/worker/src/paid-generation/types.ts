import type { ProviderName, ProviderResult } from "@workspace/integrations";
import type { PaidReportEntitlements, PaidReportTier } from "@workspace/validation/paid-report";

export interface GeneratingPaidReport {
  id: string;
  reportReference: string;
  clerkUserId: string;
  stripeCheckoutSessionId: string;
  amountPaidPence: number;
  currency: string;
  companiesHouseNumber: string;
  companyName: string;
  reportTier: PaidReportTier;
  entitlements: PaidReportEntitlements;
}

export interface PaidReportSnapshot {
  provider: ProviderName;
  operation: string;
  attempt: number;
  checkedAt: string;
  status: "success" | "failed";
  data: Record<string, unknown> | null;
  errorCode: string | null;
  errorMessage: string | null;
  retryable: boolean;
}

export interface FairPaymentCodeRecord {
  companiesHouseNumber: string;
  statusLabel: string;
  awardLevel: string | null;
  sourceReference: string | null;
  verifiedAt: Date;
  expiresAt: Date | null;
}

export interface PaidGenerationRepository {
  findGeneratingReport(reportId: string): Promise<GeneratingPaidReport | undefined>;
  findReusableSuccess(
    reportId: string,
    provider: ProviderName,
    operation: string,
    cutoff: Date,
  ): Promise<PaidReportSnapshot | undefined>;
  listLatestSnapshots(reportId: string): Promise<PaidReportSnapshot[]>;
  saveSnapshot(input: {
    report: GeneratingPaidReport;
    operation: string;
    result: ProviderResult<Record<string, unknown>>;
  }): Promise<PaidReportSnapshot>;
  logProviderUsage(input: {
    report: GeneratingPaidReport;
    provider: ProviderName;
    operation: string;
    status: "success" | "failed";
    estimatedCostPence: number | null;
  }): Promise<void>;
  findFairPaymentCode(companyNumber: string): Promise<FairPaymentCodeRecord | undefined>;
}

export interface ProviderAlertPublisher {
  publish(input: {
    reportId: string;
    reportReference: string;
    outcome: "partial" | "refund_required";
    failures: Array<{ provider: ProviderName; operation: string; errorCode: string | null }>;
  }): Promise<void>;
}
