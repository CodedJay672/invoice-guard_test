import {
  BuildingIcon,
  CheckIcon,
  DatabaseSearchIcon,
  InfinityIcon,
  LockIcon,
  SparkleIcon,
} from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

import { buildSearchPurchaseHref } from "@/lib/purchase-intent";
import {
  formatProductPrice,
  publicReportProducts,
  type PublicReportProduct,
} from "@/lib/report-products";

function PricingSection() {
  return (
    <section className="border-t border-t-line bg-page px-12 py-18" id="pricing">
      <div className="mx-auto w-full max-w-275">
        <div className="reveal mb-10 text-center">
          <h2 className="mb-3 text-4xl font-extrabold tracking-tighter text-brand-navy">
            Pay once. No subscription.
            <br />
            Credits never expire.
          </h2>
          <p className="mx-auto max-w-110 text-base text-content-subtle">
            Buy a single report or stock up with a bundle. Use your credits whenever you need them,
            no time limit.
          </p>
        </div>
        <div className="mb-4 grid grid-cols-4 gap-3">
          {publicReportProducts.map((plan) => (
            <PricingCard key={plan.code} product={plan} />
          ))}
        </div>
        <div className="reveal flex flex-wrap items-center justify-between gap-5 rounded-md border border-line bg-content-inverse px-7 py-6">
          <div>
            <p className="mb-1 flex items-center gap-2 text-base font-bold text-content">
              <BuildingIcon aria-hidden="true" />
              Organisation Pricing
            </p>
            <p className="text-base text-content-muted">
              Need more than 10 reports? Custom volume pricing for lenders, legal firms, and large
              teams.
            </p>
          </div>
          <a href="mailto:hello@invoiceguard.co.uk" className="btn-primary">
            Contact us
          </a>
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-7 border-t border-t-line pt-6">
          <div className="flex items-center gap-1.5 text-xs text-content-subtle">
            <LockIcon aria-hidden="true" size={16} /> Secure checkout via Stripe
          </div>
          <div className="flex items-center gap-1.5 text-xs text-content-subtle">
            <InfinityIcon aria-hidden="true" size={16} /> Credits never expire
          </div>
          <div className="flex items-center gap-1.5 text-xs text-content-subtle">
            <SparkleIcon aria-hidden="true" size={16} /> Instant access
          </div>
          <div className="flex items-center gap-1.5 text-xs text-content-subtle">
            <DatabaseSearchIcon aria-hidden="true" size={16} /> Live official data sources
          </div>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;

function PricingCard({ product }: { product: PublicReportProduct }) {
  return (
    <div
      className={cn(
        "reveal d1 relative flex flex-col rounded-lg border border-line bg-background px-5.5 py-6.5 transition-all duration-150 hover:-translate-y-3 hover:shadow-md",
        product.featured && "border-content",
      )}
    >
      {product.featured && (
        <span className="absolute -top-2.75 left-1/2 -translate-x-1/2 rounded-full bg-brand-navy px-3.5 py-1 text-xs font-bold whitespace-nowrap text-content-inverse transition-transform">
          Most Popular
        </span>
      )}
      <p className="mb-1 text-sm font-bold text-content">{product.name}</p>
      <p className="text-surface-muted mb-5 min-h-8.5 text-xs">{product.description}</p>
      <div className="flex items-baseline gap-1.75">
        <span className="text-4xl font-black tracking-tight text-content">
          {formatProductPrice(product.pricePence)}
        </span>
        {product.originalPricePence ? (
          <span className="text-sm text-content-subtle line-through">
            {formatProductPrice(product.originalPricePence)}
          </span>
        ) : null}
      </div>
      <p className="mb-2 text-xs font-bold text-content">
        {product.creditQuantity} {product.creditQuantity === 1 ? "full report" : "reports"}
      </p>
      {product.savingsPence ? (
        <span className="mb-5 inline-block w-max rounded-full border border-positive bg-positive-surface px-2.25 py-1 text-xs font-bold text-positive">
          Save {formatProductPrice(product.savingsPence)}
        </span>
      ) : null}
      <div className="h-6" />
      <div className="my-4 h-px bg-line" />
      <div className="mb-5.5 flex grow flex-col gap-2.25">
        {product.features.map((item) => (
          <div key={item} className="flex gap-2 text-xs text-content-muted">
            <CheckIcon aria-hidden="true" className="size-4 shrink-0 text-positive" />
            {item}
          </div>
        ))}
      </div>
      <Button asChild variant={product.featured ? "authoritative" : "outline"} className="w-full">
        <Link href={buildSearchPurchaseHref(product.code)}>{product.cta}</Link>
      </Button>
    </div>
  );
}
