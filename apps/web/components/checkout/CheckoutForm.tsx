"use client";

import React, { useState } from "react";
import { ArrowRight, LoaderCircle, MailCheck } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import { startCheckout } from "@/actions/checkout";

import { resolveCheckoutBuyerFixture, type CheckoutFixtureName } from "./fixtures";

export type CheckoutBuyer =
  | { mode: "authenticated"; initialEmail: string; emailReadOnly: true }
  | { mode: "unverified"; clerkUserId: string };

type CheckoutFormProps = {
  fixtureName?: CheckoutFixtureName | undefined;
  buyer: CheckoutBuyer;
  companyNumber: string;
  tier: "basic" | "standard" | "premium";
  statusHref: string;
  cancelled?: boolean | undefined;
};

export function CheckoutForm({
  fixtureName,
  buyer: liveBuyer,
  companyNumber,
  tier,
  statusHref,
  cancelled,
}: CheckoutFormProps) {
  const buyer = fixtureName ? resolveCheckoutBuyerFixture(fixtureName) : liveBuyer;
  const isUnverified = buyer.mode === "unverified";
  const [error, setError] = useState<string | undefined>();
  const [isRedirecting, setIsRedirecting] = useState(fixtureName === "redirecting");

  async function submitCheckout(event: React.SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isUnverified) {
      setError("Verify your account email before continuing to payment.");
      return;
    }

    setError(undefined);
    setIsRedirecting(true);
    if (fixtureName) {
      window.setTimeout(() => window.location.assign(statusHref), 600);
      return;
    }

    const checkout = await startCheckout({
      companyNumber,
      tier,
      attemptId: window.crypto.randomUUID(),
    });
    if (!checkout.ok) {
      setError(checkout.message);
      setIsRedirecting(false);
      return;
    }
    window.location.assign(checkout.url);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1 id="checkout-heading" className="text-2xl font-semibold text-brand-navy">
            Review and continue to payment
          </h1>
        </CardTitle>
        <CardDescription>
          Your report is tied to the selected Companies House entity and this delivery email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-5"
          noValidate
          onSubmit={(event) => void submitCheckout(event)}
        >
          {cancelled ? (
            <Alert variant="caution">
              <AlertTitle>Checkout cancelled</AlertTitle>
              <AlertDescription>
                No payment was confirmed. Your company and report selection have been preserved.
              </AlertDescription>
            </Alert>
          ) : null}
          {isUnverified ? (
            <Alert variant="caution">
              <AlertTitle>Verify your email before account checkout</AlertTitle>
              <AlertDescription>
                Complete Clerk email verification before continuing. Your company and report
                selection will remain here.
              </AlertDescription>
            </Alert>
          ) : null}
          {buyer.mode === "authenticated" ? (
            <div className="rounded-lg border border-line bg-page p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-content">
                <MailCheck aria-hidden="true" className="size-4" />
                Verified report owner
              </p>
              <p className="mt-2 text-sm text-content-muted">{buyer.initialEmail}</p>
            </div>
          ) : null}
          {error ? (
            <p className="text-sm text-critical" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            variant="authoritative"
            disabled={isRedirecting || isUnverified}
            aria-disabled={isUnverified}
            className="h-11 w-full justify-between"
          >
            {isRedirecting ? (
              <>
                <LoaderCircle data-icon="inline-start" className="animate-spin" />
                Redirecting securely
              </>
            ) : (
              <>
                Continue to payment
                <ArrowRight data-icon="inline-end" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-content-muted">
          Stripe securely hosts payment. InvoiceGuard creates your report only after confirmation.
        </p>
      </CardFooter>
    </Card>
  );
}
