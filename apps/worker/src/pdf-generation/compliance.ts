import type { ComplianceContent } from "./types.js";

const FIXTURE_COPY: ComplianceContent = {
  version: "fixture-v1",
  disclaimer:
    "InvoiceGuard reports information found in the identified sources. It is not legal or financial advice, a credit decision, or a guarantee of future payment. Verify important decisions independently.",
  issueUrl: "https://invoiceguard.co.uk/report-an-issue",
};

export function resolveComplianceContent(input: {
  environment: "development" | "test" | "production";
  version: string | undefined;
  enableFlagSummary: boolean;
}): ComplianceContent | undefined {
  if (input.environment === "production") return undefined;
  if (input.version && input.version !== FIXTURE_COPY.version) return undefined;
  return input.enableFlagSummary
    ? {
        ...FIXTURE_COPY,
        flagSummary: {
          heading: "Template flag summary — fixture copy",
          paragraphs: [
            "This non-production fixture demonstrates where separately approved template wording will appear.",
          ],
        },
      }
    : FIXTURE_COPY;
}

export const PDF_TEMPLATE_VERSION = "premium-pdf-v1";
