"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

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

import type { CheckoutFixtureName } from "./fixtures";

type CheckoutFormProps = {
  fixtureName?: CheckoutFixtureName | undefined;
  statusHref: string;
};

export function CheckoutForm({ fixtureName, statusHref }: CheckoutFormProps) {
  const router = useRouter();
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

  function submitCheckout(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const result = guestEmailSchema.safeParse(email);

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }

    setError(undefined);
    setIsRedirecting(true);
    window.setTimeout(() => router.push(statusHref), 600);
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
        <form className="flex flex-col gap-5" noValidate onSubmit={submitCheckout}>
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
          This is a UI verification flow. No payment will be taken in Phase 13A.
        </p>
      </CardFooter>
    </Card>
  );
}
