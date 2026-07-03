import { Flag, ShieldCheck } from "lucide-react";

export interface ReportComplianceContent {
  disclaimer: string;
  issueHref: string;
  issueDisplayUrl: string;
  reportReference: string;
  generatedAt: string;
}

export function ReportComplianceBlock({
  content,
  variant = "browser",
}: {
  content: ReportComplianceContent;
  variant?: "browser" | "document";
}) {
  if (variant === "document") {
    return (
      <section
        aria-labelledby="document-disclaimer"
        className="rounded-lg border border-line bg-surface-subtle/40 p-4 print:break-inside-avoid"
      >
        <div className="flex items-start gap-3">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-navy" />
          <div className="space-y-2">
            <h2 id="document-disclaimer" className="text-sm font-semibold text-brand-navy">
              Important information
            </h2>
            <p className="text-xs leading-5 text-content-muted">{content.disclaimer}</p>
            <p className="text-xs text-content">
              Report an issue: <span className="font-medium">{content.issueDisplayUrl}</span>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <footer className="border-t border-line bg-brand-navy text-content-inverse print:mt-6 print:bg-surface print:text-content">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-xs sm:px-6 lg:px-8 print:max-w-none print:px-0">
        <p>{content.disclaimer}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p>
            InvoiceGuard · {content.reportReference} · Generated {content.generatedAt}
          </p>
          <a
            href={content.issueHref}
            className="inline-flex items-center gap-2 font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
          >
            <Flag aria-hidden="true" className="size-4" />
            Report an issue
          </a>
        </div>
      </div>
    </footer>
  );
}
