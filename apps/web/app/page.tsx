import { loadWebProxyConfig } from "@workspace/config/web";

import { CompanySearchExperience } from "@/components/company-search/CompanySearchExperience";
import { isSearchFixtureName, type SearchFixtureName } from "@/components/company-search/fixtures";
import { PublicSearchShell } from "@/components/company-search/PublicSearchShell";

type PageProps = {
  searchParams: Promise<{ fixture?: string | string[] }>;
};

export default async function Page({ searchParams }: PageProps) {
  const config = loadWebProxyConfig();
  const requestedFixture = (await searchParams).fixture;
  const fixtureName = resolveFixtureName(requestedFixture, config.environment);

  return (
    <PublicSearchShell>
      <CompanySearchExperience fixtureName={fixtureName} />
    </PublicSearchShell>
  );
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
