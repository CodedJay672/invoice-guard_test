import type {
  GenerationLogger,
  PersistedReportStatus,
  ReportGenerationHandler,
  ReportGenerationRepository,
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
      const outcome = await this.handler.generate(input.reportId);
      const persistedStatus = await this.repository.complete(input.reportId, outcome);
      const status = persistedStatus ?? outcome;
      this.logger.info({ ...context, status }, "Report generation completed");
      return { state: "completed", status };
    } catch (error) {
      const retryable = !(error instanceof ReportGenerationError) || error.retryable;
      const hasAttemptsRemaining = input.attempt < input.maxAttempts;

      if (retryable && hasAttemptsRemaining) {
        this.logger.warn(context, "Report generation attempt will be retried");
        throw error;
      }

      const status = (await this.repository.fail(input.reportId)) ?? "failed";
      this.logger.error({ ...context, status }, "Report generation reached a terminal failure");
      return { state: "completed", status };
    }
  }
}
