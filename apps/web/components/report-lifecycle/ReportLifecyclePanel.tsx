"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileCheck2,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import {
  initialReportLifecycleStatus,
  isTerminalReportLifecycleStatus,
  nextReportLifecycleStatus,
  reportLifecycleContent,
  type ReportLifecycleFixtureName,
  type ReportLifecycleStatus,
} from "./fixtures";

type ReportLifecyclePanelProps = {
  reportReference: string;
  fixtureName?: ReportLifecycleFixtureName | undefined;
};

export function ReportLifecyclePanel({ reportReference, fixtureName }: ReportLifecyclePanelProps) {
  const [status, setStatus] = useState<ReportLifecycleStatus>(() =>
    initialReportLifecycleStatus(fixtureName),
  );
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    if (!fixtureName || isTerminalReportLifecycleStatus(status)) return;
    if (fixtureName !== "pending-to-ready" && fixtureName !== "generating-to-partial") return;

    const timer = window.setTimeout(() => {
      setStatus((current) => nextReportLifecycleStatus(fixtureName, current));
      setCheckCount((current) => current + 1);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [fixtureName, status]);

  const content = reportLifecycleContent[status];
  const badgeVariant = content.tone === "default" ? "outline" : content.tone;
  const alertVariant = content.tone === "default" ? "default" : content.tone;

  function checkAgain(): void {
    setCheckCount((current) => current + 1);
    setStatus((current) => nextReportLifecycleStatus(fixtureName, current));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Card aria-busy={content.isBusy}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-2 font-mono text-xs text-content-muted">{reportReference}</p>
              <CardTitle>
                <h1 className="text-2xl font-semibold text-brand-navy">{content.heading}</h1>
              </CardTitle>
              <CardDescription>{content.description}</CardDescription>
            </div>
            <Badge variant={badgeVariant}>{content.badge}</Badge>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <Alert variant={alertVariant}>
            {renderStatusIcon(status)}
            <AlertTitle>{content.alertTitle}</AlertTitle>
            <AlertDescription>{content.alertBody}</AlertDescription>
          </Alert>

          <div className="rounded-lg border border-line bg-surface-subtle p-4">
            <div className="flex items-center gap-3" role="status" aria-live="polite">
              {content.isBusy ? (
                <LoaderCircle aria-hidden="true" className="size-5 shrink-0 animate-spin" />
              ) : (
                renderStatusIcon(status, "size-5 shrink-0")
              )}
              <div>
                <p className="font-medium text-content">{content.progressLabel}</p>
                <p className="text-sm text-content-muted">
                  Status checks do not create a new purchase or duplicate this report.
                </p>
              </div>
            </div>
          </div>

          {checkCount > 0 ? (
            <p className="text-sm text-content-muted" aria-live="polite">
              Status checked {checkCount} {checkCount === 1 ? "time" : "times"} on this visit.
            </p>
          ) : null}
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-3 sm:flex-row">
          {content.canOpenReport ? (
            <Button asChild variant="authoritative">
              <Link href={`/reports/${encodeURIComponent(reportReference)}`}>
                <FileCheck2 data-icon="inline-start" />
                Open report
              </Link>
            </Button>
          ) : null}
          {content.canRefresh ? (
            <Button type="button" variant="authoritative" onClick={checkAgain}>
              <RefreshCw data-icon="inline-start" />
              Check again
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/search">
              <RotateCcw data-icon="inline-start" />
              Search another company
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function renderStatusIcon(status: ReportLifecycleStatus, className?: string) {
  if (status === "ready" || status === "refunded") {
    return <CheckCircle2 aria-hidden="true" className={className} />;
  }
  if (status === "partial") return <FileCheck2 aria-hidden="true" className={className} />;
  if (status === "failed" || status === "refund_required") {
    return <CircleAlert aria-hidden="true" className={className} />;
  }
  return <Clock3 aria-hidden="true" className={className} />;
}
