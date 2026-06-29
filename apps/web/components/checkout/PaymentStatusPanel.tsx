"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Clock3,
  LoaderCircle,
  RefreshCw,
  XCircle,
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
import type { CheckoutStatus } from "@workspace/validation/checkout";

import type { PaymentStatusFixtureName } from "./fixtures";

type PaymentState =
  | { status: "confirming"; attempt: number }
  | { status: "paid_pending" }
  | { status: "delayed"; attempt: number }
  | { status: "cancelled" }
  | { status: "failed" }
  | { status: "duplicate_refresh" };

type PaymentStatusPanelProps = {
  checkoutHref: string;
  fixtureName?: PaymentStatusFixtureName | undefined;
  sessionId?: string | undefined;
};

export function PaymentStatusPanel({
  checkoutHref,
  fixtureName,
  sessionId,
}: PaymentStatusPanelProps) {
  const [state, setState] = useState<PaymentState>(() => initialState(fixtureName));

  useEffect(() => {
    if (state.status !== "confirming") return;

    const timer = window.setTimeout(() => {
      if (fixtureName === "confirming" || fixtureName === "delayed-confirmation") {
        setState(
          state.attempt >= 3
            ? { status: "delayed", attempt: state.attempt }
            : { status: "confirming", attempt: state.attempt + 1 },
        );
        return;
      }

      if (fixtureName) {
        setState(
          state.attempt >= 2 ? { status: "paid_pending" } : { status: "confirming", attempt: 2 },
        );
        return;
      }

      if (!sessionId) {
        setState({ status: "failed" });
        return;
      }

      void fetch(`/api/checkout/sessions/${encodeURIComponent(sessionId)}/status`, {
        cache: "no-store",
      })
        .then(async (response) => {
          if (!response.ok) return { status: "failed" as CheckoutStatus };
          const payload = (await response.json()) as { data?: { status?: CheckoutStatus } };
          return { status: payload.data?.status ?? "failed" };
        })
        .then((result) => {
          if (result.status === "paid_pending") setState({ status: "paid_pending" });
          else if (result.status === "failed") setState({ status: "failed" });
          else if (result.status === "cancelled") setState({ status: "cancelled" });
          else if (result.status === "delayed" || state.attempt >= 3) {
            setState({ status: "delayed", attempt: state.attempt });
          } else {
            setState({ status: "confirming", attempt: state.attempt + 1 });
          }
        })
        .catch(() => setState({ status: "failed" }));
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [fixtureName, sessionId, state]);

  const content = statusContent(state);
  const StatusIcon = content.icon;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <Card aria-busy={state.status === "confirming"}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle>
                <h1 className="text-2xl font-semibold text-brand-navy">{content.heading}</h1>
              </CardTitle>
              <CardDescription>{content.description}</CardDescription>
            </div>
            <Badge variant={content.badgeVariant}>{content.badge}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Alert variant={content.alertVariant}>
            <StatusIcon aria-hidden="true" />
            <AlertTitle>{content.alertTitle}</AlertTitle>
            <AlertDescription>{content.alertBody}</AlertDescription>
          </Alert>

          {state.status === "confirming" ? (
            <div
              className="flex items-center gap-3 text-sm text-content-muted"
              role="status"
              aria-live="polite"
            >
              <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
              Checking confirmation with Stripe — attempt {state.attempt} of 3.
            </div>
          ) : null}

          {state.status === "delayed" ? (
            <p className="text-sm text-content-muted">
              Checking again is safe. It does not start another checkout or create another charge.
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3 sm:flex-row">
          {state.status === "delayed" ? (
            <Button
              type="button"
              variant="authoritative"
              onClick={() => setState({ status: "confirming", attempt: 1 })}
            >
              <RefreshCw data-icon="inline-start" />
              Check again
            </Button>
          ) : null}
          {state.status === "cancelled" || state.status === "failed" ? (
            <Button asChild variant="authoritative">
              <Link href={checkoutHref}>Return to checkout</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/search">
              <ArrowLeft data-icon="inline-start" />
              Back to company search
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function initialState(fixtureName: PaymentStatusFixtureName | undefined): PaymentState {
  switch (fixtureName) {
    case "paid-pending":
      return { status: "paid_pending" };
    case "delayed-confirmation":
    case "confirming":
      return { status: "confirming", attempt: 1 };
    case "cancelled":
      return { status: "cancelled" };
    case "failed":
      return { status: "failed" };
    case "duplicate-refresh":
      return { status: "duplicate_refresh" };
    default:
      return { status: "confirming", attempt: 1 };
  }
}

function statusContent(state: PaymentState) {
  switch (state.status) {
    case "confirming":
      return {
        heading: "Confirming your payment",
        description: "Keep this page open while InvoiceGuard waits for Stripe.",
        badge: "Checking",
        badgeVariant: "outline" as const,
        alertVariant: "caution" as const,
        alertTitle: "Payment confirmation is pending",
        alertBody:
          "Returning from checkout does not prove payment. The signed webhook is the authority.",
        icon: Clock3,
      };
    case "paid_pending":
      return {
        heading: "Payment confirmed",
        description: "Your report is now waiting to be prepared.",
        badge: "Report pending",
        badgeVariant: "positive" as const,
        alertVariant: "positive" as const,
        alertTitle: "Stripe confirmed this payment",
        alertBody:
          "Your pending report was created once from Stripe's signed payment confirmation.",
        icon: CheckCircle2,
      };
    case "delayed":
      return {
        heading: "Confirmation is taking longer",
        description: "This does not mean the payment failed or that you should pay again.",
        badge: "Delayed",
        badgeVariant: "caution" as const,
        alertVariant: "caution" as const,
        alertTitle: "We have not received confirmation yet",
        alertBody:
          "Wait a moment, then check again. Do not start another checkout while confirmation is pending.",
        icon: Clock3,
      };
    case "cancelled":
      return {
        heading: "Checkout cancelled",
        description: "Your company and report selection are ready if you want to try again.",
        badge: "Cancelled",
        badgeVariant: "outline" as const,
        alertVariant: "caution" as const,
        alertTitle: "No payment was taken",
        alertBody:
          "You left Stripe Checkout before completing payment. No report has been created.",
        icon: XCircle,
      };
    case "failed":
      return {
        heading: "Payment status unavailable",
        description: "InvoiceGuard could not confirm the outcome of this checkout.",
        badge: "Needs attention",
        badgeVariant: "critical" as const,
        alertVariant: "critical" as const,
        alertTitle: "Do not pay again yet",
        alertBody: "Return to checkout only if Stripe confirms that no payment was completed.",
        icon: CircleAlert,
      };
    case "duplicate_refresh":
      return {
        heading: "Payment already confirmed",
        description: "Refreshing this page has not created another purchase.",
        badge: "Report pending",
        badgeVariant: "positive" as const,
        alertVariant: "positive" as const,
        alertTitle: "This is the same purchase",
        alertBody: "Duplicate visits converge on the existing payment and pending report state.",
        icon: CheckCircle2,
      };
  }
}
