"use client";

import { useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
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
import { redeemCredit } from "@/actions/credits";

export function CreditRedemptionForm(props: {
  companyName: string;
  companyNumber: string;
  availableCredits: number;
  purchaseHref: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  async function submit() {
    setPending(true);
    setError(undefined);
    const result = await redeemCredit({
      companyNumber: props.companyNumber,
      idempotencyKey: crypto.randomUUID(),
    });
    if (!result.ok) {
      setError(result.message);
      setPending(false);
      return;
    }
    window.location.assign(result.lifecycleUrl);
  }
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <Badge variant="positive" className="w-fit">
            Credit available
          </Badge>
          <CardTitle>
            <h1 className="text-2xl text-brand-navy">Use 1 report credit</h1>
          </CardTitle>
          <CardDescription>Review the selected company before creating the report.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="rounded-md border border-line bg-surface-subtle p-4">
            <p className="font-semibold text-brand-navy">{props.companyName}</p>
            <p className="mt-1 font-mono text-sm text-content-muted">{props.companyNumber}</p>
          </div>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-content-muted">Current balance</dt>
              <dd className="font-medium text-content">{props.availableCredits}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-content-muted">This report</dt>
              <dd className="font-medium text-content">−1 credit</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3">
              <dt className="font-semibold text-brand-navy">Balance after</dt>
              <dd className="font-semibold text-content">{props.availableCredits - 1}</dd>
            </div>
          </dl>
          {error ? (
            <Alert variant="critical">
              <AlertTitle>Credit not used</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button
            type="button"
            size="lg"
            variant="authoritative"
            disabled={pending}
            onClick={() => void submit()}
          >
            {pending ? (
              <>
                <LoaderCircle data-icon="inline-start" className="animate-spin" />
                Creating report
              </>
            ) : (
              <>
                Use 1 credit
                <ArrowRight data-icon="inline-end" />
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline">
            <a href={props.purchaseHref}>Buy another credit pack</a>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
