import { loadWebProxyConfig } from "@workspace/config/web";

import { CompanySearchExperience } from "@/components/company-search/CompanySearchExperience";
import { isSearchFixtureName, type SearchFixtureName } from "@/components/company-search/fixtures";
import { PublicSearchShell } from "@/components/company-search/PublicSearchShell";

type PageProps = {
  searchParams: Promise<{
    companyNumber?: string | string[];
    fixture?: string | string[];
    q?: string | string[];
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const config = loadWebProxyConfig();
  const params = await searchParams;
  const requestedFixture = params.fixture;
  const fixtureName = resolveFixtureName(requestedFixture, config.environment);
  const companyNumber = singleValue(params.companyNumber);
  const query = singleValue(params.q);

  return (
    <PublicSearchShell>
      <CompanySearchExperience
        fixtureName={fixtureName}
        initialCompanyNumber={companyNumber}
        initialQuery={query}
      />
    </PublicSearchShell>
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
