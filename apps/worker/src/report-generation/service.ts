import type {
  GenerationLogger,
  PersistedReportStatus,
  ReportGenerationHandler,
  ReportGenerationRepository,
  OwnerNotificationPublisher,
} from "./types.js";
import { ReportGenerationError } from "./types.js";

export interface ProcessReportGenerationInput {
  reportId: string;
  attempt: number;
  maxAttempts: number;
  jobId?: string | undefined;
}

export type ProcessReportGenerationResult =
  | { state: "completed"; status: PersistedReportStatus }
  | { state: "noop"; status: PersistedReportStatus | "missing" };

export class ReportGenerationService {
  constructor(
    private readonly repository: ReportGenerationRepository,
    private readonly handler: ReportGenerationHandler,
    private readonly logger: GenerationLogger,
    private readonly ownerNotifications?: OwnerNotificationPublisher,
  ) {}

  async process(input: ProcessReportGenerationInput): Promise<ProcessReportGenerationResult> {
    const context = {
      reportId: input.reportId,
      jobId: input.jobId,
      attempt: input.attempt,
      maxAttempts: input.maxAttempts,
    };
    const claim = await this.repository.claimPending(input.reportId);

    if (claim.state === "missing") {
      this.logger.warn(context, "Report generation job references a missing report");
      return { state: "noop", status: "missing" };
    }

    if (claim.state === "existing" && claim.status !== "generating") {
      if (claim.status === "ready" || claim.status === "partial") {
        await this.publishOwnerNotification(input.reportId, context);
      }
      this.logger.info(
        { ...context, status: claim.status },
        "Report generation is already terminal",
      );
      return { state: "noop", status: claim.status };
    }

    if (claim.state === "existing" && input.attempt <= 1) {
      this.logger.info(context, "Duplicate report generation attempt is already in progress");
      return { state: "noop", status: "generating" };
    }

    try {
      const result = await this.handler.generate(input.reportId);
      const persistedStatus = await this.repository.complete(input.reportId, result);
      const status = persistedStatus ?? result.outcome;
      this.logger.info({ ...context, status }, "Report generation completed");
      if (status === "ready" || status === "partial") {
        await this.publishOwnerNotification(input.reportId, context);
      }
      return { state: "completed", status };
    } catch (error) {
      const retryable = !(error instanceof ReportGenerationError) || error.retryable;
      const hasAttemptsRemaining = input.attempt < input.maxAttempts;

      if (retryable && hasAttemptsRemaining) {
        this.logger.warn(context, "Report generation attempt will be retried");
        throw error;
      }

      try {
        const recovery = await this.handler.recoverTerminalFailure?.(input.reportId, error);
        if (recovery) {
          const persistedStatus = await this.repository.complete(input.reportId, recovery);
          const status = persistedStatus ?? recovery.outcome;
          this.logger.warn(
            { ...context, status },
            "Report generation delivered a frozen fallback after terminal failure",
          );
          return { state: "completed", status };
        }
      } catch (recoveryError) {
        this.logger.error(
          { ...context, recoveryError },
          "Terminal-failure recovery itself failed; marking report failed",
        );
      }
      const status = (await this.repository.fail(input.reportId)) ?? "failed";
      this.logger.error({ ...context, status }, "Report generation reached a terminal failure");
      return { state: "completed", status };
    }
  }

  private async publishOwnerNotification(
    reportId: string,
    context: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.ownerNotifications?.publish(reportId);
    } catch (error) {
      this.logger.error(
        { ...context, error },
        "Owner notification enqueue failed; startup reconciliation will retry it",
      );
    }
  }
}
