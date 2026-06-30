export type PersistedReportStatus =
  | "pending"
  | "generating"
  | "ready"
  | "partial"
  | "failed"
  | "refund_required"
  | "refunded";

export type ReportGenerationOutcome = "ready" | "partial" | "refund_required";

export interface ReportGenerationHandler {
  generate(reportId: string): Promise<ReportGenerationOutcome>;
}

export type ReportClaimResult =
  | { state: "claimed" }
  | { state: "missing" }
  | { state: "existing"; status: PersistedReportStatus };

export interface ReportGenerationRepository {
  claimPending(reportId: string): Promise<ReportClaimResult>;
  complete(
    reportId: string,
    outcome: ReportGenerationOutcome,
  ): Promise<PersistedReportStatus | undefined>;
  fail(reportId: string): Promise<PersistedReportStatus | undefined>;
  findDelayed(cutoff: Date): Promise<DelayedReport[]>;
}

export interface DelayedReport {
  id: string;
  status: "pending" | "generating";
  updatedAt: Date;
}

export interface GenerationLogger {
  info(context: Record<string, unknown>, message: string): void;
  warn(context: Record<string, unknown>, message: string): void;
  error(context: Record<string, unknown>, message: string): void;
}

export class ReportGenerationError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "ReportGenerationError";
  }
}
