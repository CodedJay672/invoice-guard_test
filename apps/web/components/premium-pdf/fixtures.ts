import { getBrowserReportFixture, type BrowserReportFixture } from "../browser-report/fixtures";

export const premiumPdfFixtureNames = [
  "complete",
  "long-content",
  "partial-source",
  "flag-summary",
] as const;

export type PremiumPdfFixtureName = (typeof premiumPdfFixtureNames)[number];

export interface PremiumPdfFixture {
  name: PremiumPdfFixtureName;
  report: BrowserReportFixture;
  flagSummary: { enabled: false } | { enabled: true; heading: string; paragraphs: string[] };
  appendix: string[];
}

export function resolvePremiumPdfFixtureName(value: string | undefined): PremiumPdfFixtureName {
  return premiumPdfFixtureNames.includes(value as PremiumPdfFixtureName)
    ? (value as PremiumPdfFixtureName)
    : "complete";
}

export function getPremiumPdfFixture(name: PremiumPdfFixtureName): PremiumPdfFixture {
  const report = getBrowserReportFixture(
    "premium",
    name === "partial-source" ? "provider-failure" : "complete",
    "ready",
  );
  const longContent = name === "long-content";

  return {
    name,
    report,
    flagSummary:
      name === "flag-summary"
        ? {
            enabled: true,
            heading: "Template flag summary — fixture copy",
            paragraphs: [
              "This non-production fixture demonstrates where approved template wording will appear when the separately controlled feature is enabled.",
              "It is not an AI interpretation, a risk score, a credit decision, or approved production copy.",
            ],
          }
        : { enabled: false },
    appendix: longContent
      ? Array.from(
          { length: 8 },
          (_, index) =>
            `Evidence note ${index + 1}: fixture-only supporting detail exercises long-content flow and page-break protection without changing the frozen report facts.`,
        )
      : [],
  };
}
