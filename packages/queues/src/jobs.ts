import type { QueueName } from "./names.js";

export type ReportTier = "basic" | "standard" | "premium";

export interface GeneratePaidReportJobData {
  reportId: string;
}

export interface GenerateReportPdfJobData {
  reportId: string;
}

export interface SendGuestReportLinkJobData {
  reportId: string;
}

export interface SendAdminAlertJobData {
  subject: string;
  message: string;
  reportId?: string;
  provider?: string;
}

export interface MaintenanceJobData {
  task:
    | "detect_stuck_reports"
    | "expire_guest_report_links"
    | "anonymise_old_search_logs"
    | "scrape_fair_payment_code";
}

export type QueueJobPayloadByName = {
  "report-generation-queue": GeneratePaidReportJobData;
  "pdf-generation-queue": GenerateReportPdfJobData;
  "email-queue": SendGuestReportLinkJobData;
  "provider-alert-queue": SendAdminAlertJobData;
  "maintenance-queue": MaintenanceJobData;
};

export type QueuePayload<TQueueName extends QueueName> = QueueJobPayloadByName[TQueueName];
