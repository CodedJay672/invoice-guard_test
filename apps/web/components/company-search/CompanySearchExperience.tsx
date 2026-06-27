"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CircleAlert,
  FileLock2,
  LockKeyhole,
  Search,
  ShieldAlert,
  Users,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import {
  apiErrorResponseSchema,
  companySearchApiResponseSchema,
  freePreviewApiResponseSchema,
  type CompanyAddressPayload,
  type CompanySearchMatchPayload,
  type FreePreviewPayload,
} from "@workspace/validation/companies";

import {
  fallbackTierCards,
  getSearchFixtureState,
  type PreviewStatus,
  type SearchFixtureName,
  type SearchStatus,
} from "./fixtures";

type CompanySearchExperienceProps = {
  fixtureName?: SearchFixtureName | undefined;
  initialCompanyNumber?: string | undefined;
  initialQuery?: string | undefined;
};

export function CompanySearchExperience({
  fixtureName,
  initialCompanyNumber,
  initialQuery,
}: CompanySearchExperienceProps) {
  const initialState = getSearchFixtureState(fixtureName);
  const [query, setQuery] = useState(initialQuery ?? initialState.query);
  const [matches, setMatches] = useState(initialState.matches);
  const [preview, setPreview] = useState(initialState.preview);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>(initialState.searchStatus);
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>(
    initialCompanyNumber && !fixtureName ? "loading" : initialState.previewStatus,
  );
  const [message, setMessage] = useState(initialState.message);
  const [tierMessage, setTierMessage] = useState<string>();

  async function searchCompanies(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setSearchStatus("invalid");
      setMessage("Enter at least 2 characters.");
      return;
    }

    setSearchStatus("loading");
    setMessage(undefined);
    setPreview(undefined);
    setPreviewStatus("idle");

    try {
      const response = await fetch(`/api/companies/search?q=${encodeURIComponent(trimmedQuery)}`);
      const body = (await response.json()) as unknown;

      if (!response.ok) {
        const error = apiErrorResponseSchema.safeParse(body);
        const code = error.success ? error.data.error.code : "company_search_failed";

        setSearchStatus(code === "anonymous_search_rate_limited" ? "rate_limited" : "error");
        setMatches([]);
        setMessage(
          error.success
            ? error.data.error.message
            : "Company data could not be retrieved right now.",
        );
        return;
      }

      const parsed = companySearchApiResponseSchema.safeParse(body);

      if (!parsed.success) {
        throw new Error("Company search returned an invalid response.");
      }

      setMatches(parsed.data.data.matches);
      setSearchStatus(parsed.data.data.matches.length > 0 ? "results" : "empty");
    } catch {
      setSearchStatus("error");
      setMatches([]);
      setMessage("Company data could not be retrieved right now.");
    }
  }

  const applyPreviewResult = useCallback((result: PreviewRequestResult): void => {
    if (result.status === "failed") {
      setPreviewStatus("error");
      setMessage(result.message);
      return;
    }

    setPreview(result.preview);
    setPreviewStatus("ready");
  }, []);

  const loadPreview = useCallback(
    async (companyNumber: string): Promise<void> => {
      setPreviewStatus("loading");
      setMessage(undefined);
      applyPreviewResult(await requestFreePreview(companyNumber));
    },
    [applyPreviewResult],
  );

  useEffect(() => {
    if (initialCompanyNumber && !fixtureName) {
      void requestFreePreview(initialCompanyNumber).then(applyPreviewResult);
    }
  }, [applyPreviewResult, fixtureName, initialCompanyNumber]);

  const tierCards = preview?.tierCards ?? fallbackTierCards;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
      <section aria-label="Company search and free preview" className="flex min-w-0 flex-col gap-6">
        <SearchPanel
          query={query}
          searchStatus={searchStatus}
          onQueryChange={(value) => {
            setQuery(value);
            setSearchStatus(value.length > 0 ? "typing" : "idle");
            setMessage(undefined);
          }}
          onSubmit={(event) => void searchCompanies(event)}
        />

        <SearchFeedback status={searchStatus} message={message} />

        {matches.length > 0 ? <SearchResults matches={matches} onSelect={loadPreview} /> : null}

        {previewStatus === "loading" ? <PreviewLoading /> : null}

        {previewStatus === "error" && message ? (
          <Alert variant="critical">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>Free preview unavailable</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}

        {preview ? <FreePreview preview={preview} /> : null}
      </section>

      <aside
        aria-label="Report options"
        className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6 lg:self-start"
      >
        {tierCards.map((tier) => (
          <TierCard
            key={tier.tier}
            tier={tier}
            ready={initialState.tierCtasReady}
            onSelect={() => setTierMessage(`${tier.name} checkout mock selected.`)}
          />
        ))}
        <p aria-live="polite" className="text-sm text-content-muted">
          {tierMessage ??
            (initialState.tierCtasReady
              ? "Mock checkout actions are ready for physical verification."
              : "Checkout becomes available in the payment phase.")}
        </p>
      </aside>
    </div>
  );
}

type SearchPanelProps = {
  query: string;
  searchStatus: SearchStatus;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function SearchPanel({ query, searchStatus, onQueryChange, onSubmit }: SearchPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Find a UK company</h2>
        </CardTitle>
        <CardDescription>
          Search by registered company name or Companies House number.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <label className="text-sm font-medium text-content" htmlFor="company-search">
            Company name or number
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-content-muted"
              />
              <Input
                id="company-search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                aria-invalid={searchStatus === "invalid"}
                className="pl-9"
                placeholder="For example, ACME or 12345678"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={searchStatus === "loading"}
              className="h-11 px-4"
            >
              <Search data-icon="inline-start" />
              {searchStatus === "loading" ? "Searching" : "Search"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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
        Searching Companies House…
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
  onSelect: (companyNumber: string) => Promise<void>;
};

function SearchResults({ matches, onSelect }: SearchResultsProps) {
  return (
    <section aria-labelledby="search-results-heading" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="search-results-heading" className="text-xl font-semibold text-content">
          Search results
        </h2>
        <p className="text-sm text-content-muted">{matches.length} found</p>
      </div>
      {matches.map((company) => (
        <button
          key={company.companiesHouseNumber}
          type="button"
          onClick={() => void onSelect(company.companiesHouseNumber)}
          className="min-h-11 rounded-lg border border-line bg-surface p-4 text-left shadow-sm transition hover:border-brand-teal focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-brand-navy">
                {company.companyName}
              </h3>
              <p className="mt-1 font-mono text-xs text-content-muted">
                {company.companiesHouseNumber}
              </p>
            </div>
            <StatusBadge status={company.companyStatus} />
          </div>
          <p className="mt-3 text-sm text-content-muted">
            {formatAddress(company.registeredOfficeAddress)}
          </p>
        </button>
      ))}
    </section>
  );
}

function PreviewLoading() {
  return (
    <Card aria-busy="true">
      <CardHeader>
        <CardTitle>Loading free preview</CardTitle>
        <CardDescription>Checking the three approved free sources.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  );
}

type FreePreviewProps = {
  preview: FreePreviewPayload;
};

function FreePreview({ preview }: FreePreviewProps) {
  const failedSources = preview.sourceStatuses.filter((source) => source.status === "failed");

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-content-muted">Company snapshot</p>
              <CardTitle>
                <h2 className="mt-2 text-2xl font-semibold text-brand-navy">
                  {preview.company.companyName}
                </h2>
              </CardTitle>
              <p className="mt-2 font-mono text-sm text-content-muted">
                {preview.company.companiesHouseNumber}
              </p>
            </div>
            <StatusBadge status={preview.company.companyStatus} />
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-3">
            <Fact
              icon={CalendarDays}
              label="Incorporated"
              value={formatDateWithAge(preview.company.incorporationDate, preview.companyAge)}
            />
            <Fact
              icon={Building2}
              label="Registered area"
              value={formatAddress(preview.company.registeredOfficeAddress)}
            />
            <Fact
              icon={Users}
              label="Active directors"
              value={String(preview.company.activeDirectorCount ?? "Not listed")}
            />
          </dl>
        </CardContent>
      </Card>

      <SourceStatusList statuses={preview.sourceStatuses} />

      {failedSources.length > 0 ? (
        <Alert variant="caution">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Some source data could not be retrieved</AlertTitle>
          <AlertDescription>
            No clean conclusion has been made. Available source results remain visible below.
          </AlertDescription>
        </Alert>
      ) : null}

      {preview.adverseBanners.map((banner) => (
        <Alert key={banner.flag} variant="critical">
          <ShieldAlert aria-hidden="true" />
          <AlertTitle>Records found</AlertTitle>
          <AlertDescription>{banner.message}</AlertDescription>
        </Alert>
      ))}

      {preview.cleanReassurance ? (
        <Alert variant="positive">
          <BadgeCheck aria-hidden="true" />
          <AlertTitle>No records found in checked sources</AlertTitle>
          <AlertDescription>{preview.cleanReassurance}</AlertDescription>
        </Alert>
      ) : null}

      {preview.previewPath === "standard" ? (
        <Alert variant="caution">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Registered company status: {preview.company.companyStatus}</AlertTitle>
          <AlertDescription>
            Review the factual company status and checked-source details before continuing.
          </AlertDescription>
        </Alert>
      ) : null}

      <CourtRecordsCard prompt={preview.courtRecordsPrompt} />

      {preview.curiosityCards.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {preview.curiosityCards.map((card) => (
            <CuriosityCard key={card.kind} card={card} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

type FactProps = {
  icon: typeof CalendarDays;
  label: string;
  value: string;
};

function Fact({ icon: Icon, label, value }: FactProps) {
  return (
    <div className="rounded-md border border-line bg-surface p-3">
      <dt className="flex items-center gap-2 text-xs font-medium text-content-muted uppercase">
        <Icon aria-hidden="true" className="size-4" />
        {label}
      </dt>
      <dd className="mt-2 text-sm font-medium text-content">{value}</dd>
    </div>
  );
}

type SourceStatusListProps = {
  statuses: FreePreviewPayload["sourceStatuses"];
};

function SourceStatusList({ statuses }: SourceStatusListProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          <h2>Checked sources</h2>
        </CardTitle>
        <CardDescription>Each status reflects this free preview only.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {statuses.map((source) => (
            <li
              key={source.provider}
              className="flex flex-col gap-1 border-b border-line pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-content">{providerLabel(source.provider)}</p>
                <p className="text-xs text-content-muted">
                  Checked {formatCheckedAt(source.checkedAt)}
                </p>
              </div>
              <Badge variant={source.status === "success" ? "positive" : "caution"}>
                {source.status === "success" ? "Checked" : source.message}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

type CourtRecordsCardProps = {
  prompt: FreePreviewPayload["courtRecordsPrompt"];
};

function CourtRecordsCard({ prompt }: CourtRecordsCardProps) {
  return (
    <Card tone="navy">
      <CardHeader>
        <p className="text-xs font-semibold tracking-wider text-brand-teal uppercase">
          {prompt.label}
        </p>
        <CardTitle>
          <h2 className="text-xl font-semibold">{prompt.heading}</h2>
        </CardTitle>
        <CardDescription>{prompt.body}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-semibold">{prompt.questionLine}</p>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3">
        <Button type="button" disabled size="lg" className="h-11 w-full">
          <LockKeyhole data-icon="inline-start" />
          {prompt.button}
        </Button>
        <p className="text-xs text-content-inverse/70">{prompt.smallText}</p>
      </CardFooter>
    </Card>
  );
}

type CuriosityCardProps = {
  card: FreePreviewPayload["curiosityCards"][number];
};

function CuriosityCard({ card }: CuriosityCardProps) {
  const isPositive = card.kind === "full_clearance";

  return (
    <Card
      className={cn(isPositive && "md:col-span-2")}
      size="sm"
      tone={isPositive ? "positive" : "default"}
    >
      <CardHeader>
        <CardTitle>
          <h3>{card.heading ?? card.question}</h3>
        </CardTitle>
        <CardDescription>{card.body}</CardDescription>
      </CardHeader>
      {card.blurredAnswer || card.lockTag ? (
        <CardContent className="flex flex-col gap-3">
          {card.blurredAnswer ? (
            <p className="rounded-md border border-dashed border-line bg-surface-subtle px-3 py-2 text-sm font-semibold text-content-muted blur-[1px]">
              {card.blurredAnswer}
            </p>
          ) : null}
          {card.lockTag ? (
            <Badge variant="outline">
              <LockKeyhole aria-hidden="true" />
              {card.lockTag}
            </Badge>
          ) : null}
        </CardContent>
      ) : null}
      {card.button ? (
        <CardFooter className="flex-col items-start gap-2">
          <Button type="button" disabled variant="authoritative">
            <FileLock2 data-icon="inline-start" />
            {card.button}
          </Button>
          {card.smallText ? <p className="text-xs opacity-80">{card.smallText}</p> : null}
        </CardFooter>
      ) : null}
    </Card>
  );
}

type TierCardProps = {
  tier: FreePreviewPayload["tierCards"][number];
  ready: boolean;
  onSelect: () => void;
};

function TierCard({ tier, ready, onSelect }: TierCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          <h2>{tier.name}</h2>
        </CardTitle>
        <CardDescription>One-off company report</CardDescription>
        <CardAction>
          <Badge variant="outline">{tier.includesPdf ? "PDF included" : "No PDF"}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-2xl font-semibold text-content">{tier.price}</p>
        <ul className="flex flex-col gap-2 text-sm text-content-muted">
          {tier.includedItems.map((item) => (
            <li key={item} className="flex gap-2">
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-teal"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          variant="authoritative"
          disabled={!ready}
          onClick={onSelect}
          className="h-10 w-full justify-between"
        >
          {tier.cta}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  );
}

type StatusBadgeProps = {
  status: string;
};

function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status.trim().toLowerCase() === "active";

  return <Badge variant={isActive ? "positive" : "caution"}>{status}</Badge>;
}

function formatAddress(address: CompanyAddressPayload): string {
  return [address.locality, address.region].filter(Boolean).join(", ") || "Area not listed";
}

function formatDateWithAge(date: string | undefined, age: string | undefined): string {
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

function formatCheckedAt(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "time unavailable"
    : new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function providerLabel(provider: FreePreviewPayload["sourceStatuses"][number]["provider"]): string {
  const labels = {
    companies_house: "Companies House",
    insolvency_disqualified_officers: "Insolvency and disqualified officers",
    london_gazette: "London Gazette",
  } as const;

  return labels[provider];
}

type PreviewRequestResult =
  | { status: "success"; preview: FreePreviewPayload }
  | { status: "failed"; message: string };

async function requestFreePreview(companyNumber: string): Promise<PreviewRequestResult> {
  try {
    const response = await fetch(
      `/api/companies/${encodeURIComponent(companyNumber)}/free-preview`,
    );
    const body = (await response.json()) as unknown;

    if (!response.ok) {
      const error = apiErrorResponseSchema.safeParse(body);

      return {
        status: "failed",
        message: error.success
          ? error.data.error.message
          : "Free preview could not be retrieved right now.",
      };
    }

    const parsed = freePreviewApiResponseSchema.safeParse(body);

    return parsed.success
      ? { status: "success", preview: parsed.data.data.preview }
      : { status: "failed", message: "Free preview could not be retrieved right now." };
  } catch {
    return { status: "failed", message: "Free preview could not be retrieved right now." };
  }
}
