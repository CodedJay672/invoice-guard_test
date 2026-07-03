import type { QueueName } from "./names.js";

export type ReportTier = "basic" | "standard" | "premium";

export interface GeneratePaidReportJobData extends Record<string, unknown> {
  reportId: string;
}

export const QUEUE_JOB_NAMES = {
  generatePaidReport: "generate-paid-report",
  sendOwnerReportReady: "send-owner-report-ready",
} as const;

export interface GenerateReportPdfJobData {
  reportId: string;
}

export interface SendOwnerReportNotificationJobData extends Record<string, unknown> {
  reportId: string;
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
};

export type QueuePayload<TQueueName extends QueueName> = QueueJobPayloadByName[TQueueName];
