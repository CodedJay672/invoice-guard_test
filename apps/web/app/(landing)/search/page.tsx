import { loadWebProxyConfig } from "@workspace/config/web";

import { CompanySearchExperience } from "@/components/company-search/CompanySearchExperience";
import { isSearchFixtureName, type SearchFixtureName } from "@/components/company-search/fixtures";
import { resolvePurchaseTier } from "@/lib/purchase-intent";

type PageProps = {
  searchParams: Promise<{
    fixture?: string | string[];
    q?: string | string[];
    tier?: string | string[];
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const config = loadWebProxyConfig();
  const params = await searchParams;
  const requestedFixture = params.fixture;
  const fixtureName = resolveFixtureName(requestedFixture, config.environment);
  const query = singleValue(params.q);
  const purchaseTier = resolvePurchaseTier(params.tier);

  return (
    <CompanySearchExperience
      fixtureName={fixtureName}
      initialQuery={query}
      purchaseTier={purchaseTier}
    />
  );
}

function singleValue(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function resolveFixtureName(
  value: string | string[] | undefined,
  environment: "development" | "test" | "production",
): SearchFixtureName | undefined {
  if (environment === "production" || Array.isArray(value) || !isSearchFixtureName(value)) {
    return undefined;
  }

  return value;
}
