export const reportLifecycleFixtureNames = [
  "pending",
  "generating",
  "slow-stuck",
  "ready",
  "partial",
  "failed",
  "refund-required",
  "refund-processing",
  "refunded",
  "pending-to-ready",
  "generating-to-partial",
] as const;

export type ReportLifecycleFixtureName = (typeof reportLifecycleFixtureNames)[number];

export type ReportLifecycleStatus =
  | "pending"
  | "generating"
  | "slow_stuck"
  | "ready"
  | "partial"
  | "failed"
  | "refund_required"
  | "refund_processing"
  | "refunded";

export type ReportLifecycleTone = "default" | "positive" | "caution" | "critical";

export interface ReportLifecycleContent {
  heading: string;
  description: string;
  badge: string;
  tone: ReportLifecycleTone;
  alertTitle: string;
  alertBody: string;
  progressLabel: string;
  canRefresh: boolean;
  canOpenReport: boolean;
  isBusy: boolean;
}

export const reportLifecycleContent: Record<ReportLifecycleStatus, ReportLifecycleContent> = {
  pending: {
    heading: "Your report is queued",
    description: "Payment is confirmed and report preparation has not started yet.",
    badge: "Pending",
    tone: "default",
    alertTitle: "Waiting to begin",
    alertBody: "Your purchase is recorded. Refreshing this page will not create another report.",
    progressLabel: "Report queued",
    canRefresh: true,
    canOpenReport: false,
    isBusy: true,
  },
  generating: {
    heading: "Preparing your report",
    description: "InvoiceGuard is checking the sources included with your report tier.",
    badge: "Generating",
    tone: "caution",
    alertTitle: "Checks are in progress",
    alertBody: "You can leave this page and return later using the same report link.",
    progressLabel: "Checking entitled sources",
    canRefresh: true,
    canOpenReport: false,
    isBusy: true,
  },
  slow_stuck: {
    heading: "Your report is taking longer",
    description: "Preparation has exceeded the usual processing window.",
    badge: "Delayed",
    tone: "caution",
    alertTitle: "No action is required yet",
    alertBody:
      "The report has not been marked as failed. Check again without starting another purchase.",
    progressLabel: "Generation delayed",
    canRefresh: true,
    canOpenReport: false,
    isBusy: false,
  },
  ready: {
    heading: "Your report is ready",
    description: "The report completed with every entitled source available.",
    badge: "Ready",
    tone: "positive",
    alertTitle: "Report preparation complete",
    alertBody: "Open the timestamped report to review the checked records and source statuses.",
    progressLabel: "Report ready",
    canRefresh: false,
    canOpenReport: true,
    isBusy: false,
  },
  partial: {
    heading: "Your report is ready with unavailable data",
    description:
      "Available records are ready and unavailable sources are identified in the report.",
    badge: "Partial",
    tone: "caution",
    alertTitle: "Some data could not be retrieved",
    alertBody:
      "The report shows which sources completed and which could not be retrieved. No failure is hidden.",
    progressLabel: "Partial report ready",
    canRefresh: false,
    canOpenReport: true,
    isBusy: false,
  },
  failed: {
    heading: "Report preparation failed",
    description: "InvoiceGuard could not complete this report.",
    badge: "Failed",
    tone: "critical",
    alertTitle: "The report is not available",
    alertBody:
      "Do not purchase the same report again. The failure has been recorded for operational review.",
    progressLabel: "Generation failed",
    canRefresh: false,
    canOpenReport: false,
    isBusy: false,
  },
  refund_required: {
    heading: "A refund is required",
    description: "A foundational source failure prevented report delivery.",
    badge: "Refund required",
    tone: "critical",
    alertTitle: "This report cannot be delivered",
    alertBody: "The purchase has entered the refund path. You do not need to buy another report.",
    progressLabel: "Refund required",
    canRefresh: true,
    canOpenReport: false,
    isBusy: false,
  },
  refund_processing: {
    heading: "Your refund is processing",
    description: "The refund instruction has been submitted for this purchase.",
    badge: "Refund processing",
    tone: "caution",
    alertTitle: "Refund in progress",
    alertBody: "Your payment provider may take additional time to return the funds.",
    progressLabel: "Refund processing",
    canRefresh: true,
    canOpenReport: false,
    isBusy: true,
  },
  refunded: {
    heading: "Your purchase was refunded",
    description: "The refund has completed for this report purchase.",
    badge: "Refunded",
    tone: "positive",
    alertTitle: "Refund completed",
    alertBody: "The report remains unavailable and no further action is required.",
    progressLabel: "Refund complete",
    canRefresh: false,
    canOpenReport: false,
    isBusy: false,
  },
};

export function resolveReportLifecycleFixtureName(
  value: string | undefined,
  environment: "development" | "test" | "production",
): ReportLifecycleFixtureName | undefined {
  const isKnown = reportLifecycleFixtureNames.some((name) => name === value);
  return environment !== "production" && isKnown
    ? (value as ReportLifecycleFixtureName)
    : undefined;
}

export function normaliseReportReference(value: string): string | undefined {
  try {
    const reference = decodeURIComponent(value).trim().toUpperCase();
    return /^IG-\d{4}-[A-F0-9]{12}$/.test(reference) ? reference : undefined;
  } catch {
    return undefined;
  }
}

export function initialReportLifecycleStatus(
  fixture: ReportLifecycleFixtureName | undefined,
): ReportLifecycleStatus {
  switch (fixture) {
    case "generating":
    case "generating-to-partial":
      return "generating";
    case "slow-stuck":
      return "slow_stuck";
    case "ready":
      return "ready";
    case "partial":
      return "partial";
    case "failed":
      return "failed";
    case "refund-required":
      return "refund_required";
    case "refund-processing":
      return "refund_processing";
    case "refunded":
      return "refunded";
    case "pending":
    case "pending-to-ready":
    default:
      return "pending";
  }
}

export function nextReportLifecycleStatus(
  fixture: ReportLifecycleFixtureName | undefined,
  current: ReportLifecycleStatus,
): ReportLifecycleStatus {
  if (fixture === "pending-to-ready") {
    if (current === "pending") return "generating";
    if (current === "generating") return "ready";
  }
  if (fixture === "generating-to-partial" && current === "generating") return "partial";
  return current;
}

export function isTerminalReportLifecycleStatus(status: ReportLifecycleStatus): boolean {
  return ["ready", "partial", "failed", "refunded"].includes(status);
}
