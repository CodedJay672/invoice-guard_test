"use client";

import React, { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle, LockKeyhole, MailCheck } from "lucide-react";

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
import type { FreePreviewTierCardPayload, ReportProductCode } from "@workspace/types";

import { startCheckout } from "@/actions/checkout";
import { cn } from "@workspace/ui/lib/utils";
import { resolveCheckoutBuyerFixture, type CheckoutFixtureName } from "./fixtures";

export type CheckoutBuyer =
  | { mode: "authenticated"; initialEmail: string; emailReadOnly: true }
  | { mode: "unverified"; clerkUserId: string };

type CheckoutFormProps = {
  fixtureName?: CheckoutFixtureName | undefined;
  buyer: CheckoutBuyer;
  companyName: string;
  companyNumber: string;
  tier: ReportProductCode;
  products: FreePreviewTierCardPayload[];
  statusHref: string;
  cancelled?: boolean;
};

export function CheckoutForm(props: CheckoutFormProps) {
  const buyer = props.fixtureName ? resolveCheckoutBuyerFixture(props.fixtureName) : props.buyer;
  const [tier, setTier] = useState(props.tier);
  const [error, setError] = useState<string>();
  const [isRedirecting, setIsRedirecting] = useState(props.fixtureName === "redirecting");
  const product = useMemo(
    () => props.products.find((item) => item.tier === tier) ?? props.products[0],
    [props.products, tier],
  );
  if (!product) return null;
  const remainingCredits = product.creditQuantity - 1;

  function selectTier(nextTier: ReportProductCode) {
    setTier(nextTier);
    const params = new URLSearchParams(window.location.search);
    params.set("tier", nextTier);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }

  async function submitCheckout(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (buyer.mode === "unverified")
      return setError("Verify your account email before continuing to payment.");
    setError(undefined);
    setIsRedirecting(true);
    if (props.fixtureName)
      return void window.setTimeout(() => window.location.assign(props.statusHref), 600);
    const checkout = await startCheckout({
      companyNumber: props.companyNumber,
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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-2">
        <Badge className="w-fit" variant="outline">
          Secure report unlock
        </Badge>
        <h1 id="checkout-heading" className="text-3xl font-semibold text-brand-navy">
          Unlock the full report
        </h1>
        <p className="max-w-3xl text-content-muted">
          Choose how many report credits you need. Every tier unlocks the same complete report for{" "}
          {props.companyName}; only the number of reusable credits changes.
        </p>
      </div>

      <form
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
        onSubmit={(event) => void submitCheckout(event)}
      >
        <section className="flex min-w-0 flex-col gap-6" aria-labelledby="tier-heading">
          {props.cancelled ? (
            <Alert variant="caution">
              <AlertTitle>Checkout cancelled</AlertTitle>
              <AlertDescription>
                No payment was confirmed. Your company and tier selection have been preserved.
              </AlertDescription>
            </Alert>
          ) : null}
          {buyer.mode === "unverified" ? (
            <Alert variant="caution">
              <AlertTitle>Verify your email before payment</AlertTitle>
              <AlertDescription>
                Complete Clerk email verification to continue. Your selection will remain here.
              </AlertDescription>
            </Alert>
          ) : null}

          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend id="tier-heading" className="mb-3 text-lg font-semibold text-brand-navy">
              Select a payment tier
            </legend>
            {props.products.map((item) => {
              const selected = item.tier === tier;
              return (
                <label
                  key={item.tier}
                  className={cn(
                    "cursor-pointer rounded-lg border bg-surface p-4 shadow-sm transition-colors focus-within:ring-2 focus-within:ring-focus",
                    selected ? "border-brand-teal" : "border-line hover:border-brand-teal",
                  )}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="tier"
                    value={item.tier}
                    checked={selected}
                    onChange={() => selectTier(item.tier)}
                  />
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block font-semibold text-brand-navy">{item.name}</span>
                      <span className="mt-1 block text-sm text-content-muted">
                        {item.creditQuantity}{" "}
                        {item.creditQuantity === 1 ? "report credit" : "report credits"}
                      </span>
                    </span>
                    {item.tier === "business_pack" ? (
                      <Badge variant="positive">Popular</Badge>
                    ) : null}
                  </span>
                  <span className="mt-4 block text-2xl font-semibold text-content">
                    {formatMoney(item.pricePence)}
                  </span>
                  <span className="mt-1 block text-sm text-content-muted">
                    {formatMoney(item.pricePence / item.creditQuantity)} per report
                  </span>
                </label>
              );
            })}
          </fieldset>

          <Card>
            <CardHeader>
              <CardTitle>Included in every full report</CardTitle>
              <CardDescription>
                Fresh checks are run after Stripe confirms payment. A source failure is shown
                clearly and never presented as a clean result.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 text-sm text-content-muted sm:grid-cols-2">
                {[
                  "Companies House company facts",
                  "CCJ Registry Trust check",
                  "Fair Payment Code status",
                  "AI interpretation of report facts",
                  "Source status and checked times",
                  "Owner-only browser report access",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-brand-teal-hover"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start" aria-label="Order summary">
          <Card>
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
              <CardDescription>{props.companyName}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="rounded-md border border-line bg-surface-subtle p-4">
                <p className="font-semibold text-brand-navy">{props.companyName}</p>
                <p className="mt-1 font-mono text-sm text-content-muted">{props.companyNumber}</p>
              </div>
              <dl className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-content-muted">Selected tier</dt>
                  <dd className="font-medium text-content">{product.name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-content-muted">Report unlocked now</dt>
                  <dd className="font-medium text-content">1 credit</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-content-muted">Credits retained</dt>
                  <dd className="font-medium text-content">{remainingCredits}</dd>
                </div>
                <div className="flex items-end justify-between gap-4 border-t border-line pt-4">
                  <dt className="font-semibold text-brand-navy">Total</dt>
                  <dd className="text-2xl font-semibold text-content">
                    {formatMoney(product.pricePence)}
                  </dd>
                </div>
              </dl>
              {buyer.mode === "authenticated" ? (
                <div className="rounded-md border border-line bg-page p-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-content">
                    <MailCheck aria-hidden="true" className="size-4" />
                    Verified report owner
                  </p>
                  <p className="mt-1 text-sm text-content-muted">{buyer.initialEmail}</p>
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
                disabled={isRedirecting || buyer.mode === "unverified"}
                className="h-11 w-full justify-between"
              >
                {isRedirecting ? (
                  <>
                    <LoaderCircle data-icon="inline-start" className="animate-spin" />
                    Redirecting securely
                  </>
                ) : (
                  <>
                    Continue to Stripe
                    <ArrowRight data-icon="inline-end" />
                  </>
                )}
              </Button>
            </CardContent>
            <CardFooter>
              <p className="flex gap-2 text-xs text-content-muted">
                <LockKeyhole aria-hidden="true" className="size-4 shrink-0" />
                Stripe securely hosts payment. Credits and the report are created only after signed
                payment confirmation.
              </p>
            </CardFooter>
          </Card>
        </aside>
      </form>
    </main>
  );
}

function formatMoney(pricePence: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(pricePence / 100);
}
