import {
  BuildingIcon,
  CheckIcon,
  DatabaseSearchIcon,
  InfinityIcon,
  LockIcon,
  SparkleIcon,
} from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

interface PricingPlan {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  reports: string;
  savings?: string;
  isFeatured: boolean;
  features: string[];
  ctaText: string;
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Single Report",
    description: "One-off check before you sign or start work",
    price: 20,
    reports: "1 full report",
    isFeatured: false,
    features: [
      "All 6 data sources",
      "CCJ registry check",
      "Fair Payment Code status",
      "Full written summary",
      "Instant access",
    ],
    ctaText: "Buy 1 Report",
  },
  {
    name: "Starter Pack",
    description: "For freelancers checking a few new clients a month",
    price: 54,
    originalPrice: 60,
    reports: "3 reports",
    savings: "Save GBP 6",
    isFeatured: false,
    features: [
      "Everything in Single Report",
      "Credits never expire",
      "Use on any company",
      "Instant access",
    ],
    ctaText: "Get Starter Pack",
  },
  {
    name: "Business Pack",
    description: "For SMEs checking customers and suppliers regularly",
    price: 80,
    originalPrice: 100,
    reports: "5 reports",
    savings: "Save GBP 20",
    isFeatured: true,
    features: [
      "Everything in Starter Pack",
      "Ideal for monthly checks",
      "Best value under Agency",
      "Priority email support",
    ],
    ctaText: "Get Business Pack",
  },
  {
    name: "Agency Pack",
    description: "For credit controllers, accountants and advisers",
    price: 140,
    originalPrice: 200,
    reports: "10 reports",
    savings: "Save GBP 60",
    isFeatured: false,
    features: [
      "Everything in Business Pack",
      "Lowest per-report rate",
      "Use across client checks",
      "Priority email support",
    ],
    ctaText: "Get Agency Pack",
  },
];

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
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
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

function PricingCard({ ...props }: PricingPlan) {
  return (
    <div
      className={cn(
        "reveal d1 relative flex flex-col rounded-lg border border-line bg-background px-5.5 py-6.5 transition-all duration-150 hover:-translate-y-3 hover:shadow-md",
        props.isFeatured && "border-content",
      )}
    >
      {props.isFeatured && (
        <span className="absolute -top-2.75 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-navy px-3.5 py-1 text-xs font-bold text-content-inverse transition-transform">
          Most Popular
        </span>
      )}
      <p className="mb-1 text-sm font-bold text-content">{props.name}</p>
      <p className="mb-5 min-h-8.5 text-xs text-surface-muted">{props.description}</p>
      <div className="flex items-baseline gap-1.75">
        <span className="text-4xl font-black tracking-tight text-content">
          {props.price.toLocaleString("en-GB", {
            style: "currency",
            currency: "GBP",
            maximumFractionDigits: 0,
          })}
        </span>
        {props.originalPrice ? (
          <span className="text-sm text-content-subtle line-through">
            {props.originalPrice.toLocaleString("en-GB", {
              style: "currency",
              currency: "GBP",
              maximumFractionDigits: 0,
            })}
          </span>
        ) : null}
      </div>
      <p className="mb-2 text-xs font-bold text-content">{props.reports}</p>
      {props.savings ? (
        <span className="mb-5 inline-block w-max rounded-full border border-positive bg-positive-surface px-2.25 py-1 text-xs font-bold text-positive">
          {props.savings}
        </span>
      ) : null}
      <div className="h-6" />
      <div className="my-4 h-px bg-line" />
      <div className="mb-5.5 flex grow flex-col gap-2.25">
        {props.features.map((item) => (
          <div key={item} className="flex gap-2 text-xs text-content-muted">
            <CheckIcon aria-hidden="true" className="size-4 shrink-0 text-positive" />
            {item}
          </div>
        ))}
      </div>
      <button
        className={cn(
          "borderline w-full cursor-pointer rounded-full border p-3 text-sm font-bold transition-all",
          props.isFeatured
            ? "bg-brand-navy text-content-inverse hover:bg-brand-navy-hover"
            : "border-line bg-content-inverse hover:bg-surface-subtle",
        )}
      >
        {props.ctaText}
      </button>
    </div>
  );
}
