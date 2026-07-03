import { ArrowRight, LockKeyhole, Mail } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

import type { ReportReadyEmailFixture } from "./fixtures";

type Props = {
  email: ReportReadyEmailFixture;
};

export function ReportReadyEmail({ email }: Props) {
  return (
    <main className="min-h-svh bg-page px-4 py-8 sm:px-6" aria-labelledby="email-preview-title">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Alert>
          <Mail aria-hidden="true" />
          <AlertTitle>Development email preview</AlertTitle>
          <AlertDescription>
            Responsive transactional content only; no message has been sent.
          </AlertDescription>
        </Alert>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-line bg-brand-navy text-content-inverse">
            <p className="text-sm font-semibold text-content-inverse">InvoiceGuard</p>
            <CardTitle id="email-preview-title" className="text-content-inverse">
              Your company report is ready
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 p-5 sm:p-8">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-content-muted">Your report for</p>
              <h1 className="text-2xl font-semibold text-brand-navy">{email.companyName}</h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{email.tierLabel} report</Badge>
                <Badge variant="positive">Ready</Badge>
              </div>
            </div>

            <dl className="grid gap-3 rounded-lg border border-line bg-surface-subtle/40 p-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-content-subtle uppercase">Report reference</dt>
                <dd className="font-mono text-sm font-medium text-content">
                  {email.reportReference}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-content-subtle uppercase">Generated</dt>
                <dd className="text-sm font-medium text-content">{email.generatedAt}</dd>
              </div>
            </dl>

            <Button asChild variant="authoritative" size="lg">
              <a href={email.reportHref}>
                View your report
                <ArrowRight data-icon="inline-end" />
              </a>
            </Button>

            <div className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4">
              <LockKeyhole aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-navy" />
              <p className="text-sm text-content-muted">
                Sign in with the account that purchased this report. This link is not an access
                token and cannot bypass ownership checks.
              </p>
            </div>

            <p className="text-sm text-content-muted">
              Need help?{" "}
              <a
                className="font-medium text-brand-navy underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
                href={email.supportHref}
              >
                Contact InvoiceGuard support
              </a>{" "}
              and include the report reference above.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
