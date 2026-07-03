export const reportNotificationStates = ["sending", "sent", "delayed", "failed"] as const;

export type ReportNotificationState = (typeof reportNotificationStates)[number];

export interface ReportNotificationFixture {
  state: ReportNotificationState;
  destinationLabel: string;
  updatedAt: string;
}

export interface ReportReadyEmailFixture {
  companyName: string;
  tierLabel: string;
  reportReference: string;
  generatedAt: string;
  reportHref: string;
  supportHref: string;
}

export function resolveReportNotificationState(value: string | undefined): ReportNotificationState {
  return reportNotificationStates.includes(value as ReportNotificationState)
    ? (value as ReportNotificationState)
    : "sent";
}

export function getReportNotificationFixture(
  state: ReportNotificationState,
): ReportNotificationFixture {
  return {
    state,
    destinationLabel: "your verified account email",
    updatedAt: "3 July 2026 at 10:44 BST",
  };
}

export function getReportReadyEmailFixture(): ReportReadyEmailFixture {
  const reportReference = "IG-2026-000000000184";
  return {
    companyName: "Northstar Wholesale Limited",
    tierLabel: "Premium",
    reportReference,
    generatedAt: "3 July 2026 at 10:42 BST",
    reportHref: `/reports/${encodeURIComponent(reportReference)}`,
    supportHref: `mailto:hello@invoiceguard.co.uk?subject=${encodeURIComponent(
      `Report notification ${reportReference}`,
    )}`,
  };
}
