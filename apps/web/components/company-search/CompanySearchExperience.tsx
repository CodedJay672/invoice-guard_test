import { BotIcon, BuildingIcon, CircleAlert, LucideIcon, ScaleIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import type {
  CompanyAddressPayload,
  CompanySearchMatchPayload,
  FreePreviewPayload,
  ReportProductCode,
} from "@workspace/types";

import { searchCompanies } from "@/lib/data/search-companies";

import { getSearchFixtureState, type SearchFixtureName, type SearchStatus } from "./fixtures";
import SearchPanel from "./search-panel";
import { buildCompanyHref } from "@/lib/purchase-intent";
import { ProviderMetadata } from "@/components/provider-metadata/ProviderMetadata";
import {
  companyTypeLabel,
  formatCompaniesHouseAddress,
  formatCompaniesHouseDate,
  sentenceCase,
} from "@/lib/company-display";

type CompanySearchExperienceProps = {
  fixtureName?: SearchFixtureName | undefined;
  initialQuery?: string | undefined;
  purchaseTier?: ReportProductCode | undefined;
};

export async function CompanySearchExperience({
  fixtureName,
  initialQuery,
  purchaseTier,
}: CompanySearchExperienceProps) {
  const fixtureState = getSearchFixtureState(fixtureName);
  const matches = initialQuery
    ? await searchCompanies(initialQuery)
    : {
      searchStatus: fixtureState.searchStatus,
      matches: fixtureState.matches,
      message: fixtureState.message,
      providerPayload: undefined,
    };

  return (
    <section className="min-h-svh w-full bg-page">
      <div className="border-b border-b-line bg-surface px-7 py-6">
        <div className="mx-auto w-full max-w-240">
          <SearchPanel purchaseTier={purchaseTier} />
        </div>
      </div>
      <section
        aria-label="Company search and free preview"
        className="mx-auto w-full max-w-275 px-6 py-7"
      >
        <SearchFeedback status={matches.searchStatus} message={matches.message} />

        {matches.matches.length > 0 ? (
          <Suspense key={initialQuery} fallback={<PreviewLoading />}>
            <SearchResults
              query={initialQuery ?? ""}
              matches={matches.matches}
              purchaseTier={purchaseTier}
              {...(matches.providerPayload ? { providerPayload: matches.providerPayload } : {})}
            />
          </Suspense>
        ) : null}
      </section>
    </section>
  );
}

type SearchFeedbackProps = {
  status: SearchStatus;
  message: string | undefined;
};

function SearchFeedback({ status, message }: SearchFeedbackProps) {
  if (status === "loading") {
    return (
      <p aria-live="polite" className="text-sm text-content-muted" role="status">
        Searching Companies House...
      </p>
    );
  }

  if (status === "empty") {
    return (
      <Card size="sm">
        <CardHeader>
          <CardTitle>No matching companies found</CardTitle>
          <CardDescription>Check the spelling or try the Companies House number.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (message) {
    return (
      <Alert variant={status === "rate_limited" || status === "invalid" ? "caution" : "critical"}>
        <CircleAlert aria-hidden="true" />
        <AlertTitle>
          {status === "rate_limited" ? "Search limit reached" : "Search needs attention"}
        </AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  }

  return null;
}

type SearchResultsProps = {
  matches: CompanySearchMatchPayload[];
  query: string;
  providerPayload?: import("@workspace/types").ProviderPayload | undefined;
  purchaseTier?: ReportProductCode | undefined;
};

function SearchResults({ matches, query, providerPayload, purchaseTier }: SearchResultsProps) {
  return (
    <section aria-labelledby="search-results-heading" className="mx-auto w-full max-w-240 p-7">
      <h2 id="search-results-heading" className="mb-4 text-xs text-content-subtle">
        Search results: <span className="text-content">{matches.length} found</span> for &quot;
        {query}&quot;. Data from Companies House public register.
      </h2>

      <div className="mb-5 flex flex-wrap items-center justify-center gap-7 rounded-md border border-line bg-surface px-5 py-3.5">
        <SourceTrustItem icon={BuildingIcon} text="Free search uses Companies House data" />
        <SourceTrustItem icon={ScaleIcon} text="Court records checked in paid reports" />
        <SourceTrustItem icon={BotIcon} text="AI interpretation only in paid reports" />
      </div>

      {matches.map((company) => (
        <SearchResultCard
          key={company.companiesHouseNumber}
          {...company}
          purchaseTier={purchaseTier}
        />
      ))}
      <ProviderMetadata payload={providerPayload} />
    </section>
  );
}

type SourceTrustItemProps = {
  icon: LucideIcon;
  text: string;
};

function SourceTrustItem({ icon: Icon, text }: SourceTrustItemProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-content-subtle">
      <Icon aria-hidden="true" className="size-3.5" />
      <span>{text}</span>
    </div>
  );
}

function PreviewLoading() {
  return (
    <Card aria-busy="true">
      <CardHeader>
        <CardTitle>Loading free preview</CardTitle>
        <CardDescription>Checking Companies House.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  );
}

function SearchResultCard({
  purchaseTier,
  ...company
}: CompanySearchMatchPayload & { purchaseTier?: ReportProductCode | undefined }) {
  return (
    <article className="mb-5 overflow-hidden rounded-md border border-line bg-surface">
      <Link href={buildCompanyHref(company.companiesHouseNumber, "overview", purchaseTier)}>
        <div className="flex flex-wrap justify-between gap-4 px-6 py-5">
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 text-lg font-bold text-brand-teal underline underline-offset-2">
              {company.companyName}
            </h3>
            <p className="text-sm text-content-muted">
              <span className="font-medium text-content">{company.companiesHouseNumber}</span>
              {company.incorporationDate ? (
                <> · Incorporated on {formatCompaniesHouseDate(company.incorporationDate)}</>
              ) : null}
            </p>
            <p className="mt-1 text-sm font-medium text-content">
              {formatCompaniesHouseAddress(company.registeredOfficeAddress)}
            </p>
            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-content-muted">
              <div>
                <dt className="inline">Company status: </dt>
                <dd className="inline font-semibold text-content">
                  {sentenceCase(company.companyStatus)}
                </dd>
              </div>
              <div>
                <dt className="inline">Company type: </dt>
                <dd className="inline font-semibold text-content">
                  {companyTypeLabel(company.companyType)}
                </dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={sentenceCase(company.companyStatus)} />
            <span className="text-[10px] text-content-subtle">
              {providerLabel("companies_house")}
            </span>
          </div>        </div>
      </Link>
      <div className="w-full">
        <ProviderMetadata payload={company.providerPayload} />
      </div>
    </article>
  );
}

type StatusBadgeProps = {
  status: string;
};

function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status.trim().toLowerCase() === "active";

  return (
    <Badge
      variant={isActive ? "positive" : "caution"}
      className="rounded-sm px-3.5 py-1.5 text-xs font-extrabold"
    >
      {status}
    </Badge>
  );
}

export function formatAddress(address: CompanyAddressPayload): string {
  return [address.locality, address.region].filter(Boolean).join(", ") || "Area not listed";
}

export function formatDateWithAge(date: string | undefined, age: string | undefined): string {
  if (!date) {
    return "Not listed";
  }

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

  return age ? `${formattedDate} (${age})` : formattedDate;
}

function providerLabel(provider: FreePreviewPayload["sourceStatuses"][number]["provider"]): string {
  const labels = {
    companies_house: "Companies House",
  } as const;

  return labels[provider];
}
