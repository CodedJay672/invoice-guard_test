import type { BrowserReportPayload, ReportDeliveryResponse } from "@workspace/validation";

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
  reportTier: "basic" | "standard" | "premium";
  entitlements: unknown;
  status: PurchasedReportStatus;
  reportData: unknown;
  providerStatuses: unknown;
  pdfStorageUrl: string | null;
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
