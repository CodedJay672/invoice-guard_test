import {
  checkoutSelectionSchema,
  type CheckoutSelection,
  type ReportTier,
} from "@workspace/validation/checkout";

export const checkoutFixtureNames = [
  "guest-ready",
  "authenticated-ready",
  "invalid-product",
  "inactive-product",
  "validation-error",
  "redirecting",
] as const;

export type CheckoutFixtureName = (typeof checkoutFixtureNames)[number];

export const paymentStatusFixtureNames = [
  "confirming",
  "paid-pending",
  "delayed-confirmation",
  "cancelled",
  "failed",
  "duplicate-refresh",
] as const;

export type PaymentStatusFixtureName = (typeof paymentStatusFixtureNames)[number];

export interface ReportProductFixture {
  tier: ReportTier;
  name: string;
  price: string;
  includesPdf: boolean;
  includedItems: string[];
  active: boolean;
}

export const reportProductFixtures: Record<ReportTier, ReportProductFixture> = {
  basic: {
    tier: "basic",
    name: "Basic",
    price: "£7.99",
    includesPdf: false,
    includedItems: [
      "Court records check",
      "Director names and appointment dates",
      "Registered address history",
    ],
    active: true,
  },
  standard: {
    tier: "standard",
    name: "Standard",
    price: "£14.99",
    includesPdf: false,
    includedItems: [
      "Everything in Basic",
      "CCJ amounts and satisfaction status",
      "Recent filings and registered charges",
    ],
    active: true,
  },
  premium: {
    tier: "premium",
    name: "Premium",
    price: "£27.00",
    includesPdf: true,
    includedItems: [
      "Everything in Standard",
      "Director and insolvency depth checks",
      "Branded PDF and timestamped reference",
    ],
    active: true,
  },
};

export function resolveCheckoutSelection(input: {
  companyNumber: string | undefined;
  tier: string | undefined;
  q: string | undefined;
}): CheckoutSelection | undefined {
  const result = checkoutSelectionSchema.safeParse(input);
  return result.success ? result.data : undefined;
}

export function resolveCheckoutFixtureName(
  value: string | undefined,
  environment: "development" | "test" | "production",
): CheckoutFixtureName | undefined {
  const isKnown = checkoutFixtureNames.some((name) => name === value);
  return environment !== "production" && isKnown ? (value as CheckoutFixtureName) : undefined;
}

export function resolvePaymentStatusFixtureName(
  value: string | undefined,
  environment: "development" | "test" | "production",
): PaymentStatusFixtureName | undefined {
  const isKnown = paymentStatusFixtureNames.some((name) => name === value);
  return environment !== "production" && isKnown ? (value as PaymentStatusFixtureName) : undefined;
}

export function buildCheckoutHref(selection: CheckoutSelection): string {
  const params = new URLSearchParams({
    companyNumber: selection.companyNumber,
    tier: selection.tier,
  });
  if (selection.q) params.set("q", selection.q);
  return `/checkout?${params.toString()}`;
}
