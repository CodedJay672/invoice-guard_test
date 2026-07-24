import type { BrowserReportPayload, ReportDeliveryResponse } from "@workspace/validation";
import type { ReportProductCode } from "@workspace/types";

export type PurchasedReportStatus =
  | "pending"
  | "generating"
  | "ready"
  | "partial"
  | "failed"
  | "refund_required"
  | "refunded";

export interface DeliverableReportRecord {
  reportReference: string;
  clerkUserId: string;
  reportTier: ReportProductCode;
  entitlements: unknown;
  status: PurchasedReportStatus;
  reportData: unknown;
  providerStatuses: unknown;
  pdfStorageUrl: string | null;
  pdfArtifact?: {
    status: "queued" | "generating" | "ready" | "failed";
    objectKey: string | null;
  } | null;
  notification?: {
    status: "queued" | "sending" | "sent" | "failed";
    attemptCount: number;
    failureKind: string | null;
    updatedAt: Date;
  } | null;
}

export interface ReportDeliveryRepository {
  findByReference(reportReference: string): Promise<DeliverableReportRecord | undefined>;
}

export type { BrowserReportPayload, ReportDeliveryResponse };

export class ReportNotFoundError extends Error {
  constructor(readonly accessDenied = false) {
    super("Report was not found.");
    this.name = "ReportNotFoundError";
  }
}

export class InvalidFrozenReportError extends Error {
  constructor(readonly reportReference: string) {
    super(`Frozen report ${reportReference} could not be delivered.`);
    this.name = "InvalidFrozenReportError";
  }
}
