"use client";

import { useState } from "react";
import {
  Bot,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Download,
  FileText,
  ShieldAlert,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";

import type {
  BrowserReportFixture,
  BrowserReportNavigationSection,
  PdfFixtureState,
} from "./fixtures";
import type {
  AiInterpretation,
  PaidReportSection,
  PaidSourceStatus,
} from "../paid-report/fixtures";
import { ReportNotificationStatus } from "../report-notification/ReportNotificationStatus";
import { ReportComplianceBlock } from "../report-compliance/ReportCompliance";

export function BrowserReport({ report }: { report: BrowserReportFixture }) {
  const [activeSection, setActiveSection] = useState(report.navigation[0]?.id ?? "overview");

  if (report.viewState !== "report") return <ReportUnavailableState report={report} />;

  return (
    <article className="min-h-svh bg-page print:bg-surface" aria-labelledby="report-company-name">
      <CompanyMasthead report={report} />

      <div className="border-y border-line bg-surface print:hidden">
        <nav aria-label="Report sections" className="mx-auto hidden max-w-7xl px-6 md:block">
          <div role="tablist" aria-label="Report sections" className="flex overflow-x-auto">
            {report.navigation.map((section) => (
              <button
                key={section.id}
                type="button"
                role="tab"
                id={`tab-${section.id}`}
                aria-controls={`panel-${section.id}`}
                aria-selected={activeSection === section.id}
                tabIndex={activeSection === section.id ? 0 : -1}
                onClick={() => setActiveSection(section.id)}
                onKeyDown={(event) => {
                  const currentIndex = report.navigation.findIndex(
                    ({ id }) => id === activeSection,
                  );
                  const lastIndex = report.navigation.length - 1;
                  const nextIndex =
                    event.key === "ArrowRight"
                      ? currentIndex === lastIndex
                        ? 0
                        : currentIndex + 1
                      : event.key === "ArrowLeft"
                        ? currentIndex === 0
                          ? lastIndex
                          : currentIndex - 1
                        : event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? lastIndex
                            : undefined;
                  if (nextIndex === undefined) return;
                  event.preventDefault();
                  const next = report.navigation[nextIndex];
                  if (!next) return;
                  setActiveSection(next.id);
                  document.getElementById(`tab-${next.id}`)?.focus();
                }}
                className={cn(
                  "flex shrink-0 items-center gap-2 border-b-2 px-5 py-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none",
                  activeSection === section.id
                    ? "border-brand-teal text-brand-navy"
                    : "border-transparent text-content-muted hover:text-content",
                )}
              >
                {section.label}
                {section.count ? <Badge variant="caution">{section.count}</Badge> : null}
              </button>
            ))}
          </div>
        </nav>

        <label className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-sm font-medium text-content md:hidden">
          Report section
          <select
            value={activeSection}
            onChange={(event) => setActiveSection(event.target.value)}
            className="h-11 rounded-md border border-line bg-surface px-3 text-content focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
          >
            {report.navigation.map((section) => (
              <option key={section.id} value={section.id}>
                {section.label}
                {section.count ? ` (${section.count})` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 print:max-w-none print:px-0 print:py-4">
        {report.notification ? (
          <ReportNotificationStatus notification={report.notification} />
        ) : null}
        {report.outcome === "partial" ? (
          <Alert variant="caution" className="mb-6 print:break-inside-avoid">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>Report completed with unavailable source data</AlertTitle>
            <AlertDescription>
              Available facts remain visible. Review source status for the checks that could not be
              completed.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="screen-report-panels">
          {report.navigation.map((section) => (
            <ReportPanel
              key={section.id}
              section={section}
              report={report}
              active={activeSection === section.id}
            />
          ))}
        </div>
      </div>

      <ReportFooter report={report} />
    </article>
  );
}

function CompanyMasthead({ report }: { report: BrowserReportFixture }) {
  const isCritical = report.companyStatus.toLowerCase().includes("liquidation");
  return (
    <header className="bg-surface print:break-inside-avoid">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8 print:max-w-none print:flex-row print:px-0 print:py-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-widest text-content-subtle uppercase">
            Company name
          </p>
          <h1
            id="report-company-name"
            className="mt-2 text-3xl font-semibold tracking-tight text-brand-navy"
          >
            {report.companyName}
          </h1>
          <p className="mt-2 text-sm text-content-muted">
            {report.companyType} · Incorporated {report.incorporated}
          </p>
          <p className="mt-1 text-sm text-content-subtle">{report.registeredAddress}</p>
        </div>
        <div className="flex flex-col items-start gap-3 lg:items-end print:items-end">
          <Badge variant={isCritical ? "critical" : "positive"}>{report.companyStatus}</Badge>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Badge variant="outline">{report.tierLabel} report</Badge>
            <Badge variant={report.outcome === "partial" ? "caution" : "positive"}>
              {report.outcome === "partial" ? "Partial" : "Complete"}
            </Badge>
          </div>
          <p className="text-sm text-content-subtle">{report.industry}</p>
          {report.pdfState ? (
            <PdfAction
              state={report.pdfState}
              href={report.pdfDownloadHref ?? report.pdfPreviewHref}
              preview={Boolean(report.pdfPreviewHref && !report.pdfDownloadHref)}
              reportReference={report.reportReference}
            />
          ) : null}
        </div>
      </div>
      <div className="border-t border-line bg-surface-subtle/40">
        <dl className="mx-auto grid max-w-7xl gap-3 px-4 py-4 text-sm sm:grid-cols-3 sm:px-6 lg:px-8 print:max-w-none print:grid-cols-3 print:px-0">
          <div>
            <dt className="text-xs text-content-subtle uppercase">Company number</dt>
            <dd className="font-mono font-medium text-content">{report.companyNumber}</dd>
          </div>
          <div>
            <dt className="text-xs text-content-subtle uppercase">Report reference</dt>
            <dd className="font-mono font-medium text-content">{report.reportReference}</dd>
          </div>
          <div>
            <dt className="text-xs text-content-subtle uppercase">Generated</dt>
            <dd className="font-medium text-content">{report.generatedAt}</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

function PdfAction({
  state,
  href,
  preview,
  reportReference,
}: {
  state: PdfFixtureState;
  href: string | undefined;
  preview: boolean;
  reportReference: string;
}) {
  const [currentState, setCurrentState] = useState(state);
  const content = {
    available: { label: "PDF queued", icon: FileText, disabled: true },
    generating: { label: "Generating PDF", icon: Clock3, disabled: true },
    ready: { label: "Download PDF", icon: Download, disabled: false },
    failed: { label: "Retry PDF", icon: CircleAlert, disabled: false },
  }[currentState];
  const Icon = content.icon;
  return (
    <div
      className="flex flex-col items-start gap-1 lg:items-end print:hidden"
      role="status"
      aria-live="polite"
    >
      {currentState === "ready" && href ? (
        <Button asChild>
          <a href={href}>
            <Icon data-icon="inline-start" />
            {preview ? "Preview PDF" : "Download PDF"}
          </a>
        </Button>
      ) : (
        <Button
          type="button"
          disabled={content.disabled}
          onClick={() => {
            if (currentState !== "failed") return;
            setCurrentState("generating");
            void fetch(`/api/reports/${encodeURIComponent(reportReference)}/pdf`, {
              method: "POST",
            })
              .then((response) => {
                if (!response.ok) setCurrentState("failed");
              })
              .catch(() => setCurrentState("failed"));
          }}
        >
          <Icon data-icon="inline-start" />
          {content.label}
        </Button>
      )}
      <p className="text-xs text-content-subtle">
        {preview
          ? "Preview only — no PDF request is sent."
          : "Downloads use a short-lived secure link."}
      </p>
    </div>
  );
}

function ReportPanel({
  section,
  report,
  active,
}: {
  section: BrowserReportNavigationSection;
  report: BrowserReportFixture;
  active: boolean;
}) {
  return (
    <section
      role="tabpanel"
      id={`panel-${section.id}`}
      aria-labelledby={`tab-${section.id}`}
      hidden={!active}
      className="report-panel print:block print:break-before-page"
    >
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-brand-navy">{section.label}</h2>
        <p className="mt-1 text-sm text-content-muted">
          Frozen public-record position at {report.generatedAt}
        </p>
      </div>
      {section.id === "overview" ? <SourceStatus sources={report.sources} /> : null}
      {section.id === "interpretation" ? (
        <Interpretation interpretation={report.interpretation} />
      ) : null}
      {section.sections.length ? (
        <div className="grid gap-4 lg:grid-cols-2 print:grid-cols-2">
          {section.sections.map((item) => (
            <FactCard key={`${section.id}-${item.id}`} section={item} />
          ))}
        </div>
      ) : section.id !== "interpretation" ? (
        <Alert>
          <CheckCircle2 aria-hidden="true" />
          <AlertTitle>No record found in this section</AlertTitle>
          <AlertDescription>
            This statement applies only to the sources successfully checked for this report.
          </AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
}

function SourceStatus({ sources }: { sources: PaidSourceStatus[] }) {
  return (
    <section className="mb-6" aria-labelledby="browser-source-status">
      <h3 id="browser-source-status" className="mb-3 text-lg font-semibold text-brand-navy">
        Source status
      </h3>
      <ul className="grid gap-3 md:grid-cols-2 print:grid-cols-2">
        {sources.map((source) => {
          const completed = source.status === "success";
          return (
            <li
              key={source.label}
              className="rounded-lg border border-line bg-surface p-4 print:break-inside-avoid"
            >
              <div className="flex items-start gap-3">
                {completed ? (
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-positive-content"
                  />
                ) : (
                  <CircleAlert
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-caution-content"
                  />
                )}
                <div>
                  <p className="font-medium text-content">{source.label}</p>
                  <p className="mt-1 text-sm text-content-muted">{source.detail}</p>
                  <p className="mt-2 text-xs font-medium text-content-subtle">
                    Status: {source.status.replaceAll("_", " ")}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Interpretation({ interpretation }: { interpretation: AiInterpretation }) {
  return (
    <Card className="border-brand-teal bg-surface print:break-inside-avoid">
      <CardHeader>
        <div className="flex items-center gap-2 text-brand-navy">
          <Bot aria-hidden="true" className="size-5" />
          <p className="text-xs font-semibold tracking-wide uppercase">
            InvoiceGuard interpretation
          </p>
        </div>
        <CardTitle>{interpretation.heading}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {interpretation.status === "loading" ? (
          <div role="status" aria-live="polite" className="flex flex-col gap-3">
            <p>{interpretation.message}</p>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : null}
        {interpretation.status === "ready" || interpretation.status === "partial_source"
          ? interpretation.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-6 text-content">
                {paragraph}
              </p>
            ))
          : null}
        {interpretation.status === "unavailable" || interpretation.status === "safety_fallback" ? (
          <Alert variant="caution">
            <ShieldAlert aria-hidden="true" />
            <AlertTitle>Interpretation unavailable</AlertTitle>
            <AlertDescription>{interpretation.message}</AlertDescription>
          </Alert>
        ) : null}
        <p className="text-xs text-content-subtle">
          Interpretation of checked facts only; not legal or financial advice or a credit decision.
        </p>
      </CardContent>
    </Card>
  );
}

function FactCard({ section }: { section: PaidReportSection }) {
  return (
    <Card className="print:break-inside-avoid">
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
        <p className="text-sm text-content-muted">{section.description}</p>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 sm:grid-cols-2">
          {section.facts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-md border border-line bg-surface-subtle/40 p-3"
            >
              <dt className="text-xs font-medium tracking-wide text-content-subtle uppercase">
                {fact.label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-content">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function ReportUnavailableState({ report }: { report: BrowserReportFixture }) {
  const denied = report.viewState === "access_denied";
  const terminal = report.unavailableReason;
  const badge = terminal ? "Unavailable" : denied ? "Access denied" : "Not ready";
  const title =
    terminal === "refund_required"
      ? "This report requires a refund review"
      : terminal === "refunded"
        ? "This report has been refunded"
        : terminal === "failed"
          ? "This report could not be completed"
          : terminal === "delivery_error"
            ? "This report is temporarily unavailable"
            : denied
              ? "You cannot access this report"
              : "This report is still being prepared";
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-3xl items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <Badge variant={denied || terminal ? "critical" : "caution"}>{badge}</Badge>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant={denied || terminal ? "critical" : "caution"}>
            {denied || terminal ? (
              <ShieldAlert aria-hidden="true" />
            ) : (
              <Clock3 aria-hidden="true" />
            )}
            <AlertTitle>
              {terminal
                ? "No report data was delivered"
                : denied
                  ? "Owner access required"
                  : "Check again shortly"}
            </AlertTitle>
            <AlertDescription>
              {terminal
                ? "No incomplete report data has been exposed. Please use the report reference when contacting InvoiceGuard."
                : denied
                  ? "The signed-in account is not the owner of this report."
                  : "Payment is confirmed, but the frozen report is not ready for delivery."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportFooter({ report }: { report: BrowserReportFixture }) {
  return <ReportComplianceBlock content={report} />;
}
