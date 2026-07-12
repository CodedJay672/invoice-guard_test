import { loadWebProxyConfig } from "@workspace/config/web";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import {
  buildCheckoutHref,
  reportProductFixtures,
  resolveCheckoutBuyerFixture,
  resolveCheckoutFixtureName,
  resolveCheckoutSelection,
} from "@/components/checkout/fixtures";
import { authHref } from "@/components/auth/fixtures";
import { resolveAuthIdentity } from "@/lib/auth/identity";
import { requestFreePreview } from "@/lib/data/free-company-prev";
import { requestCreditBalance } from "@/lib/data/credit-balance";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const config = loadWebProxyConfig();
  const params = await searchParams;
  const fixtureName = resolveCheckoutFixtureName(singleValue(params.fixture), config.environment);
  const selection = resolveCheckoutSelection({
    companyNumber: singleValue(params.companyNumber),
    tier: fixtureName === "invalid-product" ? "invalid" : singleValue(params.tier),
    q: singleValue(params.q),
  });

  if (!selection) return <InvalidCheckout />;

  const product = reportProductFixtures[selection.tier];
  if (fixtureName === "inactive-product" || !product.active) {
    return <UnavailableProduct />;
  }

  const identity = await resolveAuthIdentity();
  if (!fixtureName && identity.state === "signed-out") {
    redirect(authHref("/sign-up", buildCheckoutHref(selection)));
  }
  const buyer = fixtureName
    ? resolveCheckoutBuyerFixture(fixtureName)
    : identity.state === "verified"
      ? {
          mode: "authenticated" as const,
          initialEmail: identity.email,
          emailReadOnly: true as const,
        }
      : identity.state === "unverified"
        ? { mode: "unverified" as const, clerkUserId: identity.clerkUserId }
        : resolveCheckoutBuyerFixture("unverified-email");

  if (!fixtureName && singleValue(params.purchase) !== "1") {
    const balance = await requestCreditBalance();
    if (balance && balance.redeemableCredits > 0) {
      redirect(`/credits/redeem?companyNumber=${encodeURIComponent(selection.companyNumber)}`);
    }
  }

  const previewResult = await requestFreePreview(selection.companyNumber);
  const preview = previewResult.status === "success" ? previewResult.preview : undefined;
  if (previewResult.status === "failed" && !fixtureName) {
    return <UnavailableCompany message={previewResult.message} />;
  }

  const products =
    preview?.tierCards ??
    Object.values(reportProductFixtures).map((item) => ({ ...item, cta: `Buy ${item.name}` }));
  const companyName = preview?.company.companyName ?? selection.q ?? "Selected UK company";
  if (!fixtureName && !preview?.tierCards.some((item) => item.tier === selection.tier)) {
    return <UnavailableProduct />;
  }

  const statusParams = new URLSearchParams({
    companyNumber: selection.companyNumber,
    tier: selection.tier,
  });
  if (selection.q) statusParams.set("q", selection.q);

  return (
    <CheckoutForm
      fixtureName={fixtureName}
      buyer={buyer}
      companyName={companyName}
      companyNumber={selection.companyNumber}
      tier={selection.tier}
      products={products}
      statusHref={`/checkout/status?${statusParams.toString()}`}
      cancelled={singleValue(params.cancelled) === "1"}
    />
  );
}

function UnavailableCompany({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <Alert variant="caution">
        <AlertTitle>Payment page temporarily unavailable</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}

function InvalidCheckout() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl text-brand-navy">Checkout selection unavailable</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="critical">
            <AlertTitle>Choose a valid report</AlertTitle>
            <AlertDescription>
              The company number or report tier is missing or invalid.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button asChild variant="authoritative">
            <Link href="/search">Return to company search</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function UnavailableProduct() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl text-brand-navy">Report temporarily unavailable</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="caution">
            <AlertTitle>This product is not active</AlertTitle>
            <AlertDescription>No payment can be started for this report tier.</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline">
            <Link href="/search">Compare report options</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function singleValue(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}
