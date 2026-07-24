import { notFound, redirect } from "next/navigation";

import { loadWebProxyConfig } from "@workspace/config/web";
import type { BrowserReportPayload } from "@workspace/validation/report-delivery";

import { authHref } from "@/components/auth/fixtures";
import { BrowserReport } from "@/components/browser-report/BrowserReport";
import {
  browserReportFixtureNames,
  getBrowserReportFixture,
  navigationForSections,
  pdfFixtureStates,
  resolveBrowserReportFixtureName,
  resolvePdfFixtureState,
  type BrowserReportFixture,
  type BrowserReportUnavailableReason,
} from "@/components/browser-report/fixtures";
import { paidReportTiers, resolvePaidReportTier } from "@/components/paid-report/fixtures";
import { normaliseReportReference } from "@/components/report-lifecycle/fixtures";
import {
  getReportNotificationFixture,
  reportNotificationStates,
  resolveReportNotificationState,
} from "@/components/report-notification/fixtures";
import { resolveAuthIdentity } from "@/lib/auth/identity";
import { loadOwnedReport } from "@/lib/data/report-delivery";

type PageProps = {
  params: Promise<{ reportReference: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const config = loadWebProxyConfig();
  const [{ reportReference: routeReference }, query] = await Promise.all([params, searchParams]);
  const reportReference = normaliseReportReference(routeReference);
  if (!reportReference) notFound();

  if (config.environment !== "production" && hasFixtureQuery(query)) {
    return renderFixture(reportReference, query);
  }

  const identity = await resolveAuthIdentity();
  if (identity.state !== "verified") {
    redirect(authHref("/sign-in", `/reports/${encodeURIComponent(reportReference)}`));
  }

  const result = await loadOwnedReport(reportReference, identity);
  if (result.kind === "not_found") notFound();
  if (result.kind === "access_denied") {
    return <BrowserReport report={unavailableFixture(reportReference, "access_denied")} />;
  }
  if (result.kind === "unavailable") {
    return <BrowserReport report={unavailableFixture(reportReference, "delivery_error")} />;
  }
  if (result.data.state === "not_ready") {
    return <BrowserReport report={unavailableFixture(reportReference, "not_ready")} />;
  }
  if (result.data.state === "unavailable") {
    return <BrowserReport report={unavailableFixture(reportReference, result.data.status)} />;
  }
  return <BrowserReport report={toBrowserReport(result.data.report)} />;
}

function toBrowserReport(report: BrowserReportPayload): BrowserReportFixture {
  const { notification, pdfState, pdfDownloadHref, ...payload } = report;
  return {
    viewState: "report",
    ...payload,
    issueDisplayUrl: `https://invoiceguard.co.uk/report-an-issue?reference=${encodeURIComponent(report.reportReference)}`,
    navigation: navigationForSections(report.tier, report.sections),
    ...(pdfState ? { pdfState } : {}),
    ...(pdfDownloadHref ? { pdfDownloadHref } : {}),
    ...(notification ? { notification } : {}),
  };
}

function unavailableFixture(
  reportReference: string,
  state: "access_denied" | "not_ready" | BrowserReportUnavailableReason,
): BrowserReportFixture {
  const fixture = getBrowserReportFixture(
    "basic",
    state === "access_denied" ? "access-denied" : "not-ready",
    "available",
  );
  return {
    ...fixture,
    reportReference,
    ...(state === "access_denied" || state === "not_ready" ? {} : { unavailableReason: state }),
  };
}

function renderFixture(
  reportReference: string,
  query: Record<string, string | string[] | undefined>,
) {
  const fixtureName = resolveBrowserReportFixtureName(singleValue(query.fixture));
  if (fixtureName === "not-found") notFound();
  const tier = resolvePaidReportTier(singleValue(query.tier));
  const pdfState = resolvePdfFixtureState(singleValue(query.pdf));
  const notificationState = resolveReportNotificationState(singleValue(query.notification));
  const report = getBrowserReportFixture(tier, fixtureName, pdfState);
  const notification =
    report.viewState === "report" ? getReportNotificationFixture(notificationState) : undefined;
  return (
    <>
      <PreviewFixtureNav
        reportReference={reportReference}
        tier={tier}
        fixture={fixtureName}
        pdf={pdfState}
        notification={notificationState}
      />
      <BrowserReport
        report={{ ...report, reportReference, ...(notification ? { notification } : {}) }}
      />
    </>
  );
}

function hasFixtureQuery(query: Record<string, string | string[] | undefined>): boolean {
  return Boolean(
    singleValue(query.fixture) ||
    singleValue(query.tier) ||
    singleValue(query.pdf) ||
    singleValue(query.notification),
  );
}

function PreviewFixtureNav({
  reportReference,
  tier,
  fixture,
  pdf,
  notification,
}: {
  reportReference: string;
  tier: string;
  fixture: string;
  pdf: string;
  notification: string;
}) {
  const basePath = `/reports/${encodeURIComponent(reportReference)}`;
  return (
    <nav
      aria-label="Browser report preview fixtures"
      className="border-b border-line bg-surface print:hidden"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-content">16A development fixtures</p>
        <div className="flex flex-wrap gap-2">
          {paidReportTiers.map((candidate) => (
            <a
              key={candidate}
              href={`${basePath}?tier=${candidate}&fixture=${fixture}&pdf=${pdf}&notification=${notification}`}
              aria-current={candidate === tier ? "page" : undefined}
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-content hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
            >
              {titleCase(candidate)}
            </a>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {browserReportFixtureNames.map((candidate) => (
            <a
              key={candidate}
              href={`${basePath}?tier=${tier}&fixture=${candidate}&pdf=${pdf}&notification=${notification}`}
              aria-current={candidate === fixture ? "page" : undefined}
              className="rounded-md border border-line bg-surface px-3 py-2 text-xs text-content-muted hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
            >
              {candidate.replaceAll("-", " ")}
            </a>
          ))}
        </div>
        {tier === "premium" ? (
          <div className="flex flex-wrap gap-2">
            {pdfFixtureStates.map((candidate) => (
              <a
                key={candidate}
                href={`${basePath}?tier=${tier}&fixture=${fixture}&pdf=${candidate}&notification=${notification}`}
                aria-current={candidate === pdf ? "page" : undefined}
                className="rounded-md border border-line bg-surface px-3 py-2 text-xs text-content-muted hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
              >
                PDF: {candidate}
              </a>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {reportNotificationStates.map((candidate) => (
            <a
              key={candidate}
              href={`${basePath}?tier=${tier}&fixture=${fixture}&pdf=${pdf}&notification=${candidate}`}
              aria-current={candidate === notification ? "page" : undefined}
              className="rounded-md border border-line bg-surface px-3 py-2 text-xs text-content-muted hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
            >
              Email: {candidate}
            </a>
          ))}
          <a
            href="/reports/preview/email"
            className="rounded-md border border-line bg-surface px-3 py-2 text-xs font-medium text-content hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
          >
            Preview report-ready email
          </a>
        </div>
      </div>
    </nav>
  );
}

function singleValue(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
