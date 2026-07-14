import type { ReportProductCode } from "@workspace/types";

export const reportProductCodes = [
  "single_report",
  "starter_pack",
  "business_pack",
  "agency_pack",
] as const satisfies readonly ReportProductCode[];

export function resolvePurchaseTier(
  value: string | string[] | undefined,
): ReportProductCode | undefined {
  if (typeof value !== "string") return undefined;
  return reportProductCodes.find((tier) => tier === value);
}

export function buildSearchPurchaseHref(tier: ReportProductCode): string {
  return `/search?tier=${encodeURIComponent(tier)}`;
}

export function buildCompanyHref(
  companyNumber: string,
  tab: string,
  tier?: ReportProductCode,
): string {
  const path = `/company/${encodeURIComponent(companyNumber)}/${tab}`;
  return tier ? `${path}?tier=${encodeURIComponent(tier)}` : path;
}

export function buildPurchaseCheckoutHref(
  companyNumber: string,
  tier: ReportProductCode = "single_report",
): string {
  const params = new URLSearchParams({ companyNumber, tier });
  return `/checkout?${params.toString()}`;
}
