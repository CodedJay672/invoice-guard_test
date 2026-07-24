import { loadWebProxyConfig } from "@workspace/config/web";

import { PaymentStatusPanel } from "@/components/checkout/PaymentStatusPanel";
import {
  buildCheckoutHref,
  resolveCheckoutSelection,
  resolvePaymentStatusFixtureName,
} from "@/components/checkout/fixtures";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const config = loadWebProxyConfig();
  const params = await searchParams;
  const fixtureName = resolvePaymentStatusFixtureName(
    singleValue(params.fixture),
    config.environment,
  );
  const selection = resolveCheckoutSelection({
    companyNumber: singleValue(params.companyNumber) ?? (fixtureName ? "12345678" : undefined),
    tier: singleValue(params.tier) ?? (fixtureName ? "single_report" : undefined),
    q: singleValue(params.q),
  });
  const sessionId = singleValue(params.sessionId);

  return (
    <PaymentStatusPanel
      checkoutHref={selection ? buildCheckoutHref(selection) : "/search"}
      fixtureName={fixtureName}
      sessionId={sessionId}
    />
  );
}

function singleValue(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}
