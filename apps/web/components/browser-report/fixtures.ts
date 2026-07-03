import {
  getPaidReportFixture,
  type AiInterpretation,
  type PaidReportFixture,
  type PaidReportSection,
  type PaidReportTier,
  type PaidSourceStatus,
} from "../paid-report/fixtures";
import type { ReportNotificationFixture } from "../report-notification/fixtures";

export const browserReportFixtureNames = [
  "complete",
  "partial",
  "provider-failure",
  "access-denied",
  "not-ready",
  "not-found",
] as const;

export const pdfFixtureStates = ["available", "generating", "ready", "failed"] as const;

export type BrowserReportFixtureName = (typeof browserReportFixtureNames)[number];
export type PdfFixtureState = (typeof pdfFixtureStates)[number];
export type BrowserReportViewState = "report" | "access_denied" | "not_ready";
export type BrowserReportUnavailableReason =
  | "failed"
  | "refund_required"
  | "refunded"
  | "delivery_error";

export interface BrowserReportNavigationSection {
  id: string;
  label: string;
  count?: number;
  sections: PaidReportSection[];
}

export interface BrowserReportFixture {
  viewState: BrowserReportViewState;
  tier: PaidReportTier;
  tierLabel: string;
  companyName: string;
  companyNumber: string;
  companyStatus: string;
  companyType: string;
  incorporated: string;
  registeredAddress: string;
  industry: string;
  reportReference: string;
  generatedAt: string;
  outcome: PaidReportFixture["outcome"];
  sources: PaidSourceStatus[];
  interpretation: AiInterpretation;
  navigation: BrowserReportNavigationSection[];
  disclaimer: string;
  issueHref: string;
  pdfState?: PdfFixtureState;
  unavailableReason?: BrowserReportUnavailableReason;
  notification?: ReportNotificationFixture;
}

const reportReference = "IG-2026-000000000184";

export function resolveBrowserReportFixtureName(
  value: string | undefined,
): BrowserReportFixtureName {
  return browserReportFixtureNames.includes(value as BrowserReportFixtureName)
    ? (value as BrowserReportFixtureName)
    : "complete";
}

export function resolvePdfFixtureState(value: string | undefined): PdfFixtureState {
  return pdfFixtureStates.includes(value as PdfFixtureState)
    ? (value as PdfFixtureState)
    : "available";
}

export function getBrowserReportFixture(
  tier: PaidReportTier,
  fixtureName: BrowserReportFixtureName,
  pdfState: PdfFixtureState,
): BrowserReportFixture {
  const paidFixtureName =
    fixtureName === "partial"
      ? "partial"
      : fixtureName === "provider-failure"
        ? "source-statuses"
        : "complete";
  const paid = getPaidReportFixture(tier, paidFixtureName);
  const viewState =
    fixtureName === "access-denied"
      ? "access_denied"
      : fixtureName === "not-ready"
        ? "not_ready"
        : "report";
  const issueSubject = encodeURIComponent(`Issue with report ${reportReference}`);

  return {
    viewState,
    tier,
    tierLabel: paid.tierLabel,
    companyName: paid.companyName,
    companyNumber: paid.companyNumber,
    companyStatus: fixtureName === "partial" ? "In liquidation" : "Active",
    companyType: "Private limited company",
    incorporated: "12 April 2018",
    registeredAddress: "Manchester, Greater Manchester",
    industry: "SIC 46900 — Non-specialised wholesale trade",
    reportReference,
    generatedAt: paid.generatedAt,
    outcome: fixtureName === "provider-failure" ? "partial" : paid.outcome,
    sources: paid.sources,
    interpretation: paid.interpretation,
    navigation: navigationFor(paid),
    disclaimer:
      "InvoiceGuard reports information found in the sources identified above. It is not legal or financial advice, a credit decision, or a guarantee of future payment. Verify important decisions independently.",
    issueHref: `mailto:hello@invoiceguard.co.uk?subject=${issueSubject}`,
    ...(tier === "premium" ? { pdfState } : {}),
  };
}

function navigationFor(report: PaidReportFixture): BrowserReportNavigationSection[] {
  return navigationForSections(report.tier, report.sections);
}

export function navigationForSections(
  tier: PaidReportTier,
  sections: PaidReportSection[],
): BrowserReportNavigationSection[] {
  const byId = new Map(sections.map((section) => [section.id, section]));
  const section = (...ids: string[]) => ids.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []));
  const courtRecords = section("court-records");
  const charges = section("registered-charges");

  return [
    { id: "overview", label: "Overview", sections: section("company-overview", "address-history") },
    { id: "interpretation", label: "AI interpretation", sections: [] },
    ...(charges.length ? [{ id: "charges", label: "Charges", count: 1, sections: charges }] : []),
    {
      id: "insolvency",
      label: "Insolvency",
      sections: [],
    },
    { id: "officers", label: "Officers", sections: section("directors", "director-depth") },
    { id: "filings", label: "Filing history", sections: section("filing-compliance") },
    ...(courtRecords.length
      ? [{ id: "court-records", label: "CCJs", count: 1, sections: courtRecords }]
      : []),
    ...(tier === "premium"
      ? [
          {
            id: "fair-payment-code",
            label: "Fair Payment Code",
            sections: section("fair-payment-code"),
          },
        ]
      : []),
  ];
}
