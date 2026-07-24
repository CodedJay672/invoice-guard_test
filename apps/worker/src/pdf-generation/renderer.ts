import { chromium, type Browser } from "playwright";

import { renderPremiumDocumentHtml } from "@workspace/report-document";
import type { FrozenPaidReport, FrozenProviderStatuses } from "@workspace/validation";

import type { ComplianceContent, PdfRenderer } from "./types.js";

export class PlaywrightPdfRenderer implements PdfRenderer {
  async render(input: {
    report: FrozenPaidReport;
    statuses: FrozenProviderStatuses;
    compliance: ComplianceContent;
  }): Promise<Buffer> {
    let browser: Browser | undefined;
    try {
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(
        renderPremiumDocumentHtml({
          companyName: input.report.companyName,
          companyNumber: input.report.companyNumber,
          reportReference: input.report.reportReference,
          generatedAt: input.report.generatedAt,
          sources: input.statuses.checked.map((source) => ({
            label: source.provider.replaceAll("_", " "),
            status: source.status,
            detail: `Checked ${source.checkedAt}`,
          })),
          sections: Object.entries(input.report.facts).map(([title, value]) => ({
            title: title.replaceAll("_", " "),
            body: JSON.stringify(value, null, 2),
          })),
          interpretation:
            input.report.interpretation?.status === "ready"
              ? input.report.interpretation.output.summary
              : "Interpretation unavailable. Frozen source facts remain available.",
          disclaimer: input.compliance.disclaimer,
          issueUrl: input.compliance.issueUrl,
          complianceVersion: input.compliance.version,
          ...(input.compliance.flagSummary ? { flagSummary: input.compliance.flagSummary } : {}),
        }),
        { waitUntil: "load" },
      );
      return await page.pdf({
        format: "A4",
        preferCSSPageSize: true,
        printBackground: true,
        tagged: true,
        outline: true,
      });
    } finally {
      await browser?.close();
    }
  }
}
