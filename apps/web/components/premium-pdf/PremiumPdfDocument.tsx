import { Bot, CheckCircle2, CircleAlert, FileText, ShieldAlert } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";

import { ReportComplianceBlock } from "../report-compliance/ReportCompliance";
import type { PremiumPdfFixture } from "./fixtures";

export function PremiumPdfDocument({ fixture }: { fixture: PremiumPdfFixture }) {
  const { report } = fixture;
  const sections = report.navigation.flatMap((group) => group.sections);

  return (
    <main className="premium-pdf-preview bg-page px-4 py-8 print:bg-surface print:p-0">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 print:max-w-none print:gap-0">
        <DocumentPage page={1} total={3} className="premium-pdf-page-one">
          <header className="border-b border-line pb-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase">
                  InvoiceGuard
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-brand-navy">
                  Premium company report
                </h1>
                <p className="mt-2 text-lg font-medium text-content">{report.companyName}</p>
              </div>
              <Badge>Premium</Badge>
            </div>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
              <Identity label="Company number" value={report.companyNumber} mono />
              <Identity label="Report reference" value={report.reportReference} mono />
              <Identity label="Generated" value={report.generatedAt} />
            </dl>
          </header>

          <section aria-labelledby="pdf-source-status" className="mt-6">
            <h2 id="pdf-source-status" className="text-lg font-semibold text-brand-navy">
              Source status
            </h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {report.sources.map((source) => {
                const success = source.status === "success";
                const Icon = success ? CheckCircle2 : CircleAlert;
                return (
                  <li
                    key={source.label}
                    className="rounded-lg border border-line bg-surface p-3 print:break-inside-avoid"
                  >
                    <div className="flex items-start gap-2">
                      <Icon
                        aria-hidden="true"
                        className={`mt-0.5 size-4 shrink-0 ${success ? "text-positive-content" : "text-caution-content"}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-content">{source.label}</p>
                        <p className="mt-1 text-xs text-content-muted">{source.detail}</p>
                        <p className="mt-1 text-xs font-medium text-content-subtle">
                          Status: {source.status.replaceAll("_", " ")}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="mt-auto pt-6">
            <ReportComplianceBlock content={report} variant="document" />
          </div>
        </DocumentPage>

        <DocumentPage page={2} total={3}>
          <section aria-labelledby="pdf-interpretation">
            <div className="flex items-center gap-2 text-brand-navy">
              <Bot aria-hidden="true" className="size-5" />
              <h2 id="pdf-interpretation" className="text-xl font-semibold">
                AI interpretation
              </h2>
            </div>
            {report.interpretation.status === "ready" ||
            report.interpretation.status === "partial_source" ? (
              <div className="mt-4 space-y-3">
                {report.interpretation.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-6 text-content">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex gap-2 rounded-lg border border-line bg-surface-subtle/40 p-4">
                <ShieldAlert aria-hidden="true" className="size-5 shrink-0 text-caution-content" />
                <p className="text-sm text-content-muted">
                  Interpretation unavailable for this fixture.
                </p>
              </div>
            )}
            <p className="mt-4 text-xs text-content-subtle">
              Interpretation of checked facts only; not legal or financial advice or a credit
              decision.
            </p>
          </section>

          {fixture.flagSummary.enabled ? (
            <section
              className="mt-6 rounded-lg border border-line bg-surface-subtle/40 p-4 print:break-inside-avoid"
              aria-labelledby="flag-summary-heading"
            >
              <div className="flex items-center gap-2 text-brand-navy">
                <FileText aria-hidden="true" className="size-5" />
                <h2 id="flag-summary-heading" className="text-lg font-semibold">
                  {fixture.flagSummary.heading}
                </h2>
              </div>
              <div className="mt-3 space-y-2">
                {fixture.flagSummary.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm text-content-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {sections.slice(0, 4).map((section) => (
              <DocumentSection key={section.id} section={section} />
            ))}
          </div>
        </DocumentPage>

        <DocumentPage page={3} total={3}>
          <h2 className="text-xl font-semibold text-brand-navy">Report details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {sections.slice(4).map((section) => (
              <DocumentSection key={section.id} section={section} />
            ))}
          </div>
          {fixture.appendix.length ? (
            <section className="mt-7" aria-labelledby="fixture-appendix">
              <h2 id="fixture-appendix" className="text-lg font-semibold text-brand-navy">
                Long-content fixture appendix
              </h2>
              <ol className="mt-3 space-y-3">
                {fixture.appendix.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-line bg-surface p-3 text-sm leading-6 text-content print:break-inside-avoid"
                  >
                    {item}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
          <p className="mt-auto border-t border-line pt-4 text-xs text-content-subtle">
            Report an issue: {report.issueDisplayUrl}
          </p>
        </DocumentPage>
      </div>
    </main>
  );
}

function DocumentPage({
  page,
  total,
  children,
  className = "",
}: {
  page: number;
  total: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      data-document-page={page}
      className={`premium-pdf-page flex min-h-[1120px] flex-col rounded-lg border border-line bg-surface p-8 shadow-sm print:min-h-0 print:rounded-none print:border-0 print:p-0 print:shadow-none ${className}`}
    >
      {children}
      <p className="mt-auto pt-6 text-right text-xs text-content-subtle print:pt-4">
        Page {page} of {total}
      </p>
    </article>
  );
}

function Identity({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-content-subtle uppercase">{label}</dt>
      <dd className={`mt-1 font-medium text-content ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

function DocumentSection({
  section,
}: {
  section: PremiumPdfFixture["report"]["navigation"][number]["sections"][number];
}) {
  return (
    <section className="rounded-lg border border-line bg-surface p-4 print:break-inside-avoid">
      <h3 className="font-semibold text-brand-navy">{section.title}</h3>
      <p className="mt-1 text-xs text-content-muted">{section.description}</p>
      <dl className="mt-3 space-y-2">
        {section.facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-xs text-content-subtle">{fact.label}</dt>
            <dd className="text-sm font-medium text-content">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
