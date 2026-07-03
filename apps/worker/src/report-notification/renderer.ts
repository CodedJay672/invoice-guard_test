import { frozenPaidReportSchema } from "@workspace/validation";

import type {
  OwnerReportNotificationRecord,
  ReportReadyEmailContent,
  ReportReadyEmailRenderer,
} from "./types.js";

export class CodeOwnedReportReadyEmailRenderer implements ReportReadyEmailRenderer {
  constructor(private readonly appUrl: string) {}

  render(record: OwnerReportNotificationRecord): ReportReadyEmailContent {
    const artifact = frozenPaidReportSchema.parse(record.reportData);
    const reportUrl = new URL(
      `/reports/${encodeURIComponent(record.reportReference)}`,
      this.appUrl,
    ).toString();
    const supportUrl = `mailto:hello@invoiceguard.co.uk?subject=${encodeURIComponent(
      `Report notification ${record.reportReference}`,
    )}`;
    const company = escapeHtml(record.companyName);
    const reference = escapeHtml(record.reportReference);
    const tier = titleCase(record.reportTier);
    const generated = displayDateTime(artifact.generatedAt);
    const isPartial = record.reportStatus === "partial";
    return {
      subject: isPartial
        ? `Your InvoiceGuard ${tier} report is ready (some sections unavailable)`
        : `Your InvoiceGuard ${tier} report is ready`,
      textBody: [
        isPartial
          ? "Your company report is ready — some sections could not be completed"
          : "Your company report is ready",
        "",
        record.companyName,
        `${tier} report`,
        `Report reference: ${record.reportReference}`,
        `Generated: ${generated}`,
        "",
        `View your report: ${reportUrl}`,
        "Sign in with the account that purchased this report. This link is not an access token.",
        `Need help? ${supportUrl}`,
      ].join("\n"),
      htmlBody: `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;color:#001b4d"><main><h1>Your company report is ready</h1><p>Your report for</p><h2>${company}</h2><p><strong>${tier} report</strong></p><dl><dt>Report reference</dt><dd>${reference}</dd><dt>Generated</dt><dd>${escapeHtml(generated)}</dd></dl><p><a href="${escapeHtml(reportUrl)}">View your report</a></p><p>Sign in with the account that purchased this report. This link is not an access token and cannot bypass ownership checks.</p><p><a href="${escapeHtml(supportUrl)}">Contact InvoiceGuard support</a> and include the report reference above.</p></main></body></html>`,
    };
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

function displayDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(new Date(value));
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
