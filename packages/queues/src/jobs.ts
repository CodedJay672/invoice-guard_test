import type { QueueName } from "./names.js";
import type { ReportProductCode } from "@workspace/types";

export type ReportTier = ReportProductCode;

export interface GeneratePaidReportJobData extends Record<string, unknown> {
  reportId: string;
}

export const QUEUE_JOB_NAMES = {
  generatePaidReport: "generate-paid-report",
  generateReportPdf: "generate-report-pdf",
  sendOwnerReportReady: "send-owner-report-ready",
  processCreditRefund: "process-credit-refund",
} as const;

export interface GenerateReportPdfJobData extends Record<string, unknown> {
  reportId: string;
}

export interface SendOwnerReportNotificationJobData extends Record<string, unknown> {
  reportId: string;
}
export interface ProcessCreditRefundJobData extends Record<string, unknown> {
  refundRequestId: string;
}

export interface SendAdminAlertJobData extends Record<string, unknown> {
  subject: string;
  message: string;
  reportId?: string;
  provider?: string;
}

export interface MaintenanceJobData {
  task: "detect_stuck_reports" | "anonymise_old_search_logs" | "scrape_fair_payment_code";
}

export type QueueJobPayloadByName = {
  "report-generation-queue": GeneratePaidReportJobData;
  "pdf-generation-queue": GenerateReportPdfJobData;
  "email-queue": SendOwnerReportNotificationJobData;
  "provider-alert-queue": SendAdminAlertJobData;
  "maintenance-queue": MaintenanceJobData;
  "refund-queue": ProcessCreditRefundJobData;
};

export type QueuePayload<TQueueName extends QueueName> = QueueJobPayloadByName[TQueueName];
