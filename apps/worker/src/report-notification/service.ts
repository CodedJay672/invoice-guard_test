import {
  OwnerEmailResolutionError,
  type NotificationLogger,
  type OwnerEmailResolver,
  type PostmarkGateway,
  type ReportNotificationRepository,
  type ReportReadyEmailRenderer,
} from "./types.js";

export interface ProcessOwnerReportNotificationInput {
  reportId: string;
  attempt: number;
  maxAttempts: number;
  jobId?: string | undefined;
}

export class OwnerReportNotificationService {
  constructor(
    private readonly repository: ReportNotificationRepository,
    private readonly ownerEmails: OwnerEmailResolver,
    private readonly renderer: ReportReadyEmailRenderer,
    private readonly postmark: PostmarkGateway,
    private readonly logger: NotificationLogger,
  ) {}

  async process(input: ProcessOwnerReportNotificationInput): Promise<void> {
    const context = { reportId: input.reportId, jobId: input.jobId, attempt: input.attempt };
    const notification = await this.repository.findByReportId(input.reportId);
    if (!notification) {
      this.logger.warn(context, "Owner notification references a missing or undeliverable report");
      return;
    }
    if (notification.status === "sent" || notification.status === "failed") {
      this.logger.info(context, "Owner notification is already terminal");
      return;
    }
    if (notification.status === "sending") {
      await this.repository.markFailed(
        notification.id,
        "ambiguous_submission",
        "submission_state_recovered",
      );
      this.logger.error(context, "Ambiguous owner notification was not resubmitted");
      return;
    }

    let recipient: string;
    try {
      recipient = await this.ownerEmails.resolveVerifiedPrimaryEmail(notification.clerkUserId);
    } catch (error) {
      if (error instanceof OwnerEmailResolutionError && !error.retryable) {
        await this.repository.markFailed(notification.id, "owner_resolution", error.code);
        this.logger.warn(context, "Owner notification has no verified recipient");
        return;
      }
      if (input.attempt < input.maxAttempts) throw error;
      const code = error instanceof OwnerEmailResolutionError ? error.code : "clerk_unavailable";
      await this.repository.markFailed(notification.id, "owner_resolution", code);
      this.logger.error(context, "Owner notification recipient lookup exhausted retries");
      return;
    }

    const content = this.renderer.render(notification);
    const claimed = await this.repository.markSending(notification.id);
    if (!claimed) return;
    let result;
    try {
      result = await this.postmark.send({ ...content, to: recipient, reportId: input.reportId });
    } catch (error) {
      if (input.attempt < input.maxAttempts) {
        await this.repository.returnToQueue(notification.id, "transport_error");
        throw error;
      }
      await this.repository.markFailed(notification.id, "explicit_rejection", "transport_error");
      this.logger.error(
        context,
        "Postmark send threw before a definitive result; retries exhausted",
      );
      return;
    }

    if (result.kind === "accepted") {
      await this.repository.markSent(notification.id, result.messageId, result.submittedAt);
      this.logger.info(context, "Postmark accepted owner report notification");
      return;
    }
    if (result.kind === "ambiguous") {
      await this.repository.markFailed(notification.id, "ambiguous_submission", result.code);
      this.logger.error(context, "Ambiguous Postmark submission was not retried");
      return;
    }
    if (result.retryable && input.attempt < input.maxAttempts) {
      await this.repository.returnToQueue(notification.id, result.code);
      throw new Error("Postmark explicitly rejected a retryable submission.");
    }
    await this.repository.markFailed(notification.id, "explicit_rejection", result.code);
    this.logger.error(context, "Postmark rejected owner report notification");
  }
}
