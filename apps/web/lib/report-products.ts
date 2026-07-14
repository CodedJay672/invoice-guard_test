import type { ReportProductCode } from "@workspace/types";

export type PublicReportProduct = {
  code: ReportProductCode;
  name: string;
  description: string;
  pricePence: number;
  creditQuantity: number;
  originalPricePence?: number;
  savingsPence?: number;
  featured: boolean;
  features: string[];
  cta: string;
};

export const publicReportProducts: readonly PublicReportProduct[] = [
  {
    code: "single_report",
    name: "Single Report",
    description: "One-off check before you sign or start work",
    pricePence: 2000,
    creditQuantity: 1,
    featured: false,
    features: [
      "All paid data sources",
      "CCJ registry check",
      "Fair Payment Code status",
      "AI interpretation",
      "Instant access",
    ],
    cta: "Buy 1 Report",
  },
  {
    code: "starter_pack",
    name: "Starter Pack",
    description: "For freelancers checking a few new clients a month",
    pricePence: 5400,
    originalPricePence: 6000,
    savingsPence: 600,
    creditQuantity: 3,
    featured: false,
    features: [
      "Everything in Single Report",
      "Credits never expire",
      "Use on any company",
      "Instant access",
    ],
    cta: "Get Starter Pack",
  },
  {
    code: "business_pack",
    name: "Business Pack",
    description: "For SMEs checking customers and suppliers regularly",
    pricePence: 8000,
    originalPricePence: 10000,
    savingsPence: 2000,
    creditQuantity: 5,
    featured: true,
    features: [
      "Everything in Starter Pack",
      "Ideal for monthly checks",
      "Best value under Agency",
      "Priority email support",
    ],
    cta: "Get Business Pack",
  },
  {
    code: "agency_pack",
    name: "Agency Pack",
    description: "For credit controllers, accountants and advisers",
    pricePence: 14000,
    originalPricePence: 20000,
    savingsPence: 6000,
    creditQuantity: 10,
    featured: false,
    features: [
      "Everything in Business Pack",
      "Lowest per-report rate",
      "Use across client checks",
      "Priority email support",
    ],
    cta: "Get Agency Pack",
  },
];

export const publicReportProductsByCode = Object.fromEntries(
  publicReportProducts.map((product) => [product.code, product]),
) as Record<ReportProductCode, PublicReportProduct>;

export function formatProductPrice(pricePence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(pricePence / 100);
}
