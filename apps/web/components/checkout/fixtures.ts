import {
  checkoutSelectionSchema,
  type CheckoutSelection,
  type ReportTier,
} from "@workspace/validation/checkout";

export const checkoutFixtureNames = [
  "authenticated-ready",
  "unverified-email",
  "invalid-product",
  "inactive-product",
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

export type CheckoutBuyerFixture =
  | { mode: "authenticated"; initialEmail: string; emailReadOnly: true }
  | { mode: "unverified"; clerkUserId: string };

export interface ReportProductFixture {
  tier: ReportTier;
  name: string;
  price: string;
  pricePence: number;
  creditQuantity: number;
  includesPdf: boolean;
  includedItems: string[];
  active: boolean;
}

export const reportProductFixtures: Record<ReportTier, ReportProductFixture> = {
  single_report: {
    tier: "single_report",
    name: "Single Report",
    price: "GBP 20",
    pricePence: 2000,
    creditQuantity: 1,
    includesPdf: false,
    includedItems: [
      "All 6 data sources",
      "CCJ registry check",
      "Fair Payment Code status",
      "Full written summary",
      "Instant access",
    ],
    active: true,
  },
  starter_pack: {
    tier: "starter_pack",
    name: "Starter Pack",
    price: "GBP 54",
    pricePence: 5400,
    creditQuantity: 3,
    includesPdf: false,
    includedItems: [
      "Everything in Single Report",
      "Credits never expire",
      "Use on any companies",
      "Instant access",
    ],
    active: true,
  },
  business_pack: {
    tier: "business_pack",
    name: "Business Pack",
    price: "GBP 80",
    pricePence: 8000,
    creditQuantity: 5,
    includesPdf: false,
    includedItems: [
      "Everything in Starter Pack",
      "Ideal for monthly checks",
      "Best value under Agency",
      "Priority email support",
    ],
    active: true,
  },
  agency_pack: {
    tier: "agency_pack",
    name: "Agency Pack",
    price: "GBP 140",
    pricePence: 14000,
    creditQuantity: 10,
    includesPdf: false,
    includedItems: [
      "Everything in Business Pack",
      "Lowest per-report rate",
      "Team access coming soon",
      "Priority email support",
    ],
    active: true,
  },
};

export function resolveCheckoutBuyerFixture(
  fixtureName: CheckoutFixtureName | undefined,
): CheckoutBuyerFixture {
  if (fixtureName === "authenticated-ready") {
    return {
      mode: "authenticated",
      initialEmail: "verified.buyer@example.com",
      emailReadOnly: true,
    };
  }
  return {
    mode: "unverified",
    clerkUserId: "user_unverified_fixture",
  };
}

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
