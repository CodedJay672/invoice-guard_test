import { loadWebProxyConfig } from "@workspace/config/web";

import { CompanySearchExperience } from "@/components/company-search/CompanySearchExperience";
import { isSearchFixtureName, type SearchFixtureName } from "@/components/company-search/fixtures";
import { resolvePurchaseTier } from "@/lib/purchase-intent";

type PageProps = {
  searchParams: Promise<{
    fixture?: string | string[];
    q?: string | string[];
    tier?: string | string[];
    tab?: string | string[];
    page?: string | string[];
    type?: string | string[];
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const config = loadWebProxyConfig();
  const params = await searchParams;
  const requestedFixture = params.fixture;
  const fixtureName = resolveFixtureName(requestedFixture, config.environment);
  const query = singleValue(params.q);
  const purchaseTier = resolvePurchaseTier(params.tier);
  const selectedTab = params.tab === "disqualifications" ? "disqualifications" : "all";
  const requestedPage = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const disqualificationType = params.type === "natural" ? "natural" : "corporate";

  return (
    <CompanySearchExperience
      fixtureName={fixtureName}
      initialQuery={query}
      purchaseTier={purchaseTier}
      selectedTab={selectedTab}
      page={page}
      disqualificationType={disqualificationType}
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
