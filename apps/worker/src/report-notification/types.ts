import type { ReportProductCode } from "@workspace/types";

export type NotificationStatus = "queued" | "sending" | "sent" | "failed";

export interface OwnerReportNotificationRecord {
  id: string;
  reportId: string;
  reportReference: string;
  clerkUserId: string;
  companyName: string;
  reportTier: ReportProductCode;
  reportStatus: "ready" | "partial";
  reportData: unknown;
  status: NotificationStatus;
  attemptCount: number;
}

export interface ReportNotificationRepository {
  ensureQueued(reportId: string): Promise<void>;
  findByReportId(reportId: string): Promise<OwnerReportNotificationRecord | undefined>;
  findQueuedReportIds(): Promise<string[]>;
  markSending(notificationId: string): Promise<boolean>;
  returnToQueue(notificationId: string, failureCode: string): Promise<void>;
  markSent(notificationId: string, messageId: string, sentAt: Date): Promise<void>;
  markFailed(notificationId: string, failureKind: string, failureCode: string): Promise<void>;
}

export interface OwnerEmailResolver {
  resolveVerifiedPrimaryEmail(clerkUserId: string): Promise<string>;
}

export interface ReportReadyEmailContent {
  subject: string;
  htmlBody: string;
  textBody: string;
}

export interface ReportReadyEmailRenderer {
  render(record: OwnerReportNotificationRecord): ReportReadyEmailContent;
}

export type PostmarkSendResult =
  | { kind: "accepted"; messageId: string; submittedAt: Date }
  | { kind: "rejected"; code: string; retryable: boolean }
  | { kind: "ambiguous"; code: string };

export interface PostmarkGateway {
  send(
    input: ReportReadyEmailContent & { to: string; reportId: string },
  ): Promise<PostmarkSendResult>;
}

export interface NotificationLogger {
  info(context: Record<string, unknown>, message: string): void;
  warn(context: Record<string, unknown>, message: string): void;
  error(context: Record<string, unknown>, message: string): void;
}

export class OwnerEmailResolutionError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly code: string,
  ) {
    super(message);
    this.name = "OwnerEmailResolutionError";
  }
}
