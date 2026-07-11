export type PersistedReportStatus =
  | "pending"
  | "generating"
  | "ready"
  | "partial"
  | "failed"
  | "refund_required"
  | "refunded";

export type ReportGenerationOutcome = "ready" | "partial" | "refund_required";

export interface ReportGenerationResult {
  outcome: ReportGenerationOutcome;
  reportData?: Record<string, unknown> | undefined;
  providerStatuses?: Record<string, unknown> | undefined;
}

export interface ReportGenerationHandler {
  generate(reportId: string): Promise<ReportGenerationResult>;
  recoverTerminalFailure?(
    reportId: string,
    error: unknown,
  ): Promise<ReportGenerationResult | undefined>;
}

export type ReportClaimResult =
  | { state: "claimed" }
  | { state: "missing" }
  | { state: "existing"; status: PersistedReportStatus };

export interface ReportGenerationRepository {
  claimPending(reportId: string): Promise<ReportClaimResult>;
  complete(
    reportId: string,
    result: ReportGenerationResult,
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

export interface OwnerNotificationPublisher {
  publish(reportId: string): Promise<void>;
}

export interface PdfPublisher {
  publish(reportId: string): Promise<void>;
}
export interface RefundPublisher {
  publish(reportId: string): Promise<void>;
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
