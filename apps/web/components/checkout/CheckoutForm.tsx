"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle, Mail } from "lucide-react";

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
import { Input } from "@workspace/ui/components/input";
import { guestEmailSchema } from "@workspace/validation/checkout";

import { startCheckout } from "@/actions/checkout";

import type { CheckoutFixtureName } from "./fixtures";

type CheckoutFormProps = {
  fixtureName?: CheckoutFixtureName | undefined;
  companyNumber: string;
  tier: "basic" | "standard" | "premium";
  statusHref: string;
  cancelled?: boolean | undefined;
};

export function CheckoutForm({
  fixtureName,
  companyNumber,
  tier,
  statusHref,
  cancelled,
}: CheckoutFormProps) {
  const isAuthenticated = fixtureName === "authenticated-ready";
  const [email, setEmail] = useState(
    isAuthenticated
      ? "verified.buyer@example.com"
      : fixtureName === "validation-error"
        ? "invalid"
        : "",
  );
  const [error, setError] = useState(
    fixtureName === "validation-error" ? "Enter a valid email address." : undefined,
  );
  const [isRedirecting, setIsRedirecting] = useState(fixtureName === "redirecting");

  async function submitCheckout(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const result = guestEmailSchema.safeParse(email);

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Enter a valid email address.");
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
      email: result.data,
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
          <div className="flex flex-col gap-2" data-invalid={error ? true : undefined}>
            <label className="text-sm font-medium text-content" htmlFor="checkout-email">
              Report delivery email
            </label>
            <div className="relative">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-content-muted"
              />
              <Input
                id="checkout-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                readOnly={isAuthenticated}
                disabled={isRedirecting}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "checkout-email-error" : "checkout-email-help"}
                className="pl-9"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError(undefined);
                }}
              />
            </div>
            {error ? (
              <p id="checkout-email-error" className="text-sm text-critical" role="alert">
                {error}
              </p>
            ) : (
              <p id="checkout-email-help" className="text-sm text-content-muted">
                {isAuthenticated
                  ? "This verified account email will receive report updates."
                  : "We will use this address for secure report delivery."}
              </p>
            )}
          </div>

          <Alert variant="caution">
            <AlertTitle>Payment is not confirmed by the return page</AlertTitle>
            <AlertDescription>
              In the live flow, InvoiceGuard waits for Stripe&apos;s signed webhook before creating
              a report.
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            size="lg"
            variant="authoritative"
            disabled={isRedirecting}
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
