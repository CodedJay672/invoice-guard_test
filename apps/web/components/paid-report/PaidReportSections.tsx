import {
  Bot,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Database,
  FileWarning,
  ShieldAlert,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { RecoveryAction } from "./RecoveryAction";
import type {
  AiInterpretation,
  PaidReportFixture,
  PaidReportSection,
  PaidSourceStatus,
} from "./fixtures";

type PaidReportSectionsProps = {
  report: PaidReportFixture;
};

export function PaidReportSections({ report }: PaidReportSectionsProps) {
  const outcome = outcomeContent(report.outcome);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">15A preview</Badge>
          <Badge variant="outline">{report.tierLabel} report</Badge>
          <Badge variant={outcome.badgeVariant}>{outcome.badge}</Badge>
        </div>
        <div>
          <p className="font-mono text-xs text-content-muted">{report.reportReference}</p>
          <h1 className="text-3xl font-semibold text-brand-navy">{report.companyName}</h1>
          <p className="text-sm text-content-muted">
            Companies House number <span className="font-mono">{report.companyNumber}</span> ·
            Public record position at {report.generatedAt}
          </p>
        </div>
      </header>

      <Alert variant={outcome.alertVariant}>
        {report.outcome === "complete" ? (
          <CheckCircle2 aria-hidden="true" />
        ) : (
          <CircleAlert aria-hidden="true" />
        )}
        <AlertTitle>{outcome.title}</AlertTitle>
        <AlertDescription>{outcome.description}</AlertDescription>
      </Alert>

      <section aria-labelledby="source-status-heading">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 id="source-status-heading" className="text-xl font-semibold text-brand-navy">
                Source status
              </h2>
            </CardTitle>
            <CardDescription>
              Each source reports its own retrieval state. A missing source is never treated as a
              clean check.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 md:grid-cols-2">
              {report.sources.map((source) => (
                <li key={source.label}>
                  <SourceStatusCard source={source} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {report.recovery ? (
        <Alert variant="caution">
          <FileWarning aria-hidden="true" />
          <AlertTitle>Registry Trust recovery</AlertTitle>
          <AlertDescription>{report.recovery.message}</AlertDescription>
          <div className="col-start-2 mt-3">
            <RecoveryAction recovery={report.recovery} />
          </div>
        </Alert>
      ) : null}

      <AiInterpretationPanel interpretation={report.interpretation} />

      {report.sections.length > 0 ? (
        <section className="flex flex-col gap-4" aria-labelledby="checked-facts-heading">
          <div>
            <h2 id="checked-facts-heading" className="text-xl font-semibold text-brand-navy">
              Checked facts
            </h2>
            <p className="text-sm text-content-muted">
              Sections shown are limited to the {report.tierLabel} report entitlement.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {report.sections.map((section) => (
              <FactSection key={section.id} section={section} />
            ))}
          </div>
        </section>
      ) : (
        <Alert variant="critical">
          <ShieldAlert aria-hidden="true" />
          <AlertTitle>No factual report assembled</AlertTitle>
          <AlertDescription>
            Companies House is foundational. No paid sections or AI interpretation are delivered
            when that source cannot be retrieved.
          </AlertDescription>
        </Alert>
      )}
    </main>
  );
}

function SourceStatusCard({ source }: { source: PaidSourceStatus }) {
  const presentation = sourcePresentation(source.status);
  const Icon = presentation.icon;

  return (
    <div className="flex h-full min-w-0 gap-3 rounded-lg border border-line bg-surface p-4">
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium text-content">{source.label}</h3>
          <Badge variant={presentation.variant}>{presentation.label}</Badge>
        </div>
        <p className="mt-1 text-sm text-content-muted">{source.detail}</p>
        {"checkedAt" in source ? (
          <p className="mt-2 text-xs text-content-muted">Checked {source.checkedAt}</p>
        ) : null}
      </div>
    </div>
  );
}

function AiInterpretationPanel({ interpretation }: { interpretation: AiInterpretation }) {
  const isAttention =
    interpretation.status === "partial_source" ||
    interpretation.status === "unavailable" ||
    interpretation.status === "safety_fallback";

  return (
    <section aria-labelledby="ai-interpretation-heading">
      <Card className="border-brand-teal">
        <CardHeader>
          <div className="flex items-center gap-2 text-brand-navy">
            <Bot aria-hidden="true" className="size-5" />
            <p className="text-xs font-semibold tracking-wide uppercase">AI interpretation</p>
          </div>
          <CardTitle>
            <h2 id="ai-interpretation-heading" className="text-xl font-semibold text-brand-navy">
              {interpretation.heading}
            </h2>
          </CardTitle>
          <CardDescription>
            Interpretation of checked facts, not legal or financial advice or a credit decision.
          </CardDescription>
          <CardAction>
            <Badge variant={isAttention ? "caution" : "outline"}>
              {interpretationStatusLabel(interpretation.status)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {interpretation.status === "loading" ? (
            <div className="flex flex-col gap-3" role="status" aria-live="polite">
              <p className="text-sm text-content-muted">{interpretation.message}</p>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : null}

          {interpretation.status === "ready" || interpretation.status === "partial_source" ? (
            <div className="flex flex-col gap-3">
              {interpretation.status === "partial_source" ? (
                <Alert variant="caution">
                  <CircleAlert aria-hidden="true" />
                  <AlertTitle>Interpretation uses partial sources</AlertTitle>
                  <AlertDescription>
                    Unavailable: {interpretation.unavailableSources.join(", ")}. No conclusion is
                    drawn from those sources.
                  </AlertDescription>
                </Alert>
              ) : null}
              {interpretation.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-6 text-content">
                  {paragraph}
                </p>
              ))}
              <p className="text-xs text-content-muted">Generated {interpretation.generatedAt}</p>
            </div>
          ) : null}

          {interpretation.status === "unavailable" ||
          interpretation.status === "safety_fallback" ? (
            <Alert variant="caution">
              <ShieldAlert aria-hidden="true" />
              <AlertTitle>
                {interpretation.status === "safety_fallback"
                  ? "Generated wording not displayed"
                  : "Interpretation not available"}
              </AlertTitle>
              <AlertDescription>{interpretation.message}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

function FactSection({ section }: { section: PaidReportSection }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          <h3 className="font-semibold text-content">{section.title}</h3>
        </CardTitle>
        <CardDescription>{section.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 sm:grid-cols-2">
          {section.facts.map((fact) => (
            <div key={fact.label} className="rounded-md border border-line bg-surface-subtle p-3">
              <dt className="text-xs font-medium tracking-wide text-content-muted uppercase">
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

function sourcePresentation(status: PaidSourceStatus["status"]) {
  switch (status) {
    case "success":
      return { label: "Completed", variant: "positive" as const, icon: CheckCircle2 };
    case "failed":
      return { label: "Failed", variant: "critical" as const, icon: CircleAlert };
    case "unavailable":
      return { label: "Unavailable", variant: "caution" as const, icon: CircleAlert };
    case "stale":
      return { label: "Stale", variant: "caution" as const, icon: Clock3 };
    case "pending":
      return { label: "Pending", variant: "outline" as const, icon: Clock3 };
    case "not_entitled":
      return { label: "Not included", variant: "outline" as const, icon: Database };
  }
}

function interpretationStatusLabel(status: AiInterpretation["status"]): string {
  switch (status) {
    case "loading":
      return "Preparing";
    case "ready":
      return "Ready";
    case "partial_source":
      return "Limited sources";
    case "unavailable":
      return "Unavailable";
    case "safety_fallback":
      return "Withheld";
  }
}

function outcomeContent(outcome: PaidReportFixture["outcome"]) {
  if (outcome === "complete") {
    return {
      badge: "Complete",
      badgeVariant: "positive" as const,
      alertVariant: "positive" as const,
      title: "All entitled sources completed",
      description: "The report sections below use the sources included in this tier.",
    };
  }
  if (outcome === "partial") {
    return {
      badge: "Partial report",
      badgeVariant: "caution" as const,
      alertVariant: "caution" as const,
      title: "Some source data could not be retrieved",
      description: "Completed sections remain available and failed sources are identified below.",
    };
  }
  return {
    badge: "Refund required",
    badgeVariant: "critical" as const,
    alertVariant: "critical" as const,
    title: "Foundational company data could not be retrieved",
    description: "The report cannot be delivered and enters the automatic refund path.",
  };
}
