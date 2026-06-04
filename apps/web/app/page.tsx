"use client";

import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  FileLock2,
  LockKeyhole,
  Search,
  ShieldAlert,
  Users,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";

interface CompanyAddressPayload {
  locality?: string;
  region?: string;
  country?: string;
}

interface CompanySearchMatchPayload {
  companiesHouseNumber: string;
  companyName: string;
  companyStatus: string;
  companyType?: string;
  incorporationDate?: string;
  registeredOfficeAddress: CompanyAddressPayload;
  sicCodes: string[];
}

interface CompanyPayload extends CompanySearchMatchPayload {
  industryLabel?: string;
  activeDirectorCount?: number;
  lastFetchedAt?: string;
}

interface FreePreviewPayload {
  company: CompanyPayload;
  companyAge?: string;
  previewPath: "adverse" | "clean" | "standard";
  freeSourceFlags: {
    insolvencyFlag: boolean;
    disqualifiedDirectorsFlag: boolean;
    gazetteStrikeoffFlag: boolean;
    gazetteWindingupFlag: boolean;
  };
  adverseBanners: Array<{ flag: string; message: string }>;
  cleanReassurance?: string;
  courtRecordsPrompt: {
    label: string;
    heading: string;
    body: string;
    questionLine: string;
    button: string;
    smallText: string;
  };
  curiosityCards: Array<{
    kind: "director_network" | "recent_activity" | "full_clearance";
    heading?: string;
    question?: string;
    blurredAnswer?: string;
    lockTag?: string;
    body: string;
    button?: string;
    smallText?: string;
  }>;
  tierCards: Array<{
    tier: "basic" | "standard" | "premium";
    name: string;
    price: string;
    includesPdf: boolean;
    includedItems: string[];
    cta: string;
  }>;
}

type LoadState = "idle" | "loading" | "error";

export default function Page() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<CompanySearchMatchPayload[]>([]);
  const [preview, setPreview] = useState<FreePreviewPayload | undefined>();
  const [searchState, setSearchState] = useState<LoadState>("idle");
  const [previewState, setPreviewState] = useState<LoadState>("idle");
  const [message, setMessage] = useState<string | undefined>();

  async function searchCompanies() {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setMessage("Enter at least 2 characters.");
      return;
    }

    setSearchState("loading");
    setMessage(undefined);
    setPreview(undefined);

    try {
      const response = await fetch(`/api/companies/search?q=${encodeURIComponent(trimmedQuery)}`);
      const body = (await response.json()) as {
        data?: { matches: CompanySearchMatchPayload[] };
        error?: { message: string };
      };

      if (!response.ok) {
        throw new Error(body.error?.message ?? "Company search failed.");
      }

      setMatches(body.data?.matches ?? []);
      setSearchState("idle");
    } catch (error) {
      setSearchState("error");
      setMatches([]);
      setMessage(error instanceof Error ? error.message : "Company search failed.");
    }
  }

  async function loadPreview(companyNumber: string) {
    setPreviewState("loading");
    setMessage(undefined);

    try {
      const response = await fetch(
        `/api/companies/${encodeURIComponent(companyNumber)}/free-preview`,
      );
      const body = (await response.json()) as {
        data?: { preview: FreePreviewPayload };
        error?: { message: string };
      };

      if (!response.ok) {
        throw new Error(body.error?.message ?? "Free preview could not be retrieved.");
      }

      setPreview(body.data?.preview);
      setPreviewState("idle");
    } catch (error) {
      setPreviewState("error");
      setMessage(error instanceof Error ? error.message : "Free preview could not be retrieved.");
    }
  }

  return (
    <main className="min-h-svh bg-(--color-bg) text-(--color-text)">
      <nav className="border-b border-(--color-border) bg-(--color-surface)">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-semibold text-(--color-navy)">
            <Building2 className="size-5 text-(--color-teal-dark)" />
            InvoiceGuard
          </div>
          <a className="text-sm font-medium text-[var(--color-muted)]" href="/admin">
            Admin
          </a>
        </div>
      </nav>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <section className="min-w-0 space-y-6">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="company-search">
                Search Companies House
              </label>
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--color-muted)]" />
                <input
                  id="company-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void searchCompanies();
                    }
                  }}
                  className="h-11 w-full rounded-md border border-[var(--color-border)] bg-white pr-3 pl-9 text-sm ring-[var(--color-teal)] transition outline-none focus:ring-2"
                  placeholder="Search by company name or number"
                />
              </div>
              <Button
                type="button"
                onClick={() => void searchCompanies()}
                disabled={searchState === "loading"}
                className="h-11 bg-[var(--color-teal)] px-4 text-[var(--color-navy)] hover:bg-[var(--color-teal-dark)]"
              >
                <Search />
                {searchState === "loading" ? "Searching" : "Search"}
              </Button>
            </div>
            {message ? <p className="mt-3 text-sm text-[var(--color-danger)]">{message}</p> : null}
          </div>

          {matches.length > 0 ? (
            <div className="grid gap-3">
              {matches.map((company) => (
                <button
                  key={company.companiesHouseNumber}
                  type="button"
                  onClick={() => void loadPreview(company.companiesHouseNumber)}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left shadow-sm transition hover:border-[var(--color-teal)] hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-[var(--color-navy)]">
                        {company.companyName}
                      </h2>
                      <p className="mt-1 font-mono text-xs text-[var(--color-muted)]">
                        {company.companiesHouseNumber}
                      </p>
                    </div>
                    <StatusBadge status={company.companyStatus} />
                  </div>
                  <p className="mt-3 text-sm text-[var(--color-muted)]">
                    {formatAddress(company.registeredOfficeAddress)}
                  </p>
                </button>
              ))}
            </div>
          ) : null}

          {previewState === "loading" ? (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-muted)] shadow-sm">
              Loading free preview
            </div>
          ) : null}

          {preview ? <FreePreview preview={preview} /> : null}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {(preview?.tierCards ?? fallbackTierCards).map((tier) => (
            <TierCard key={tier.tier} tier={tier} />
          ))}
        </aside>
      </div>
    </main>
  );
}

function FreePreview({ preview }: { preview: FreePreviewPayload }) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-muted)]">Home / Company Search</p>
            <h1 className="mt-2 text-2xl font-semibold text-[var(--color-navy)]">
              {preview.company.companyName}
            </h1>
            <p className="mt-2 font-mono text-sm text-[var(--color-muted)]">
              {preview.company.companiesHouseNumber}
            </p>
          </div>
          <StatusBadge status={preview.company.companyStatus} />
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          <Fact
            icon={<CalendarDays />}
            label="Incorporated"
            value={formatDateWithAge(preview.company.incorporationDate, preview.companyAge)}
          />
          <Fact
            icon={<Building2 />}
            label="Registered area"
            value={formatAddress(preview.company.registeredOfficeAddress)}
          />
          <Fact
            icon={<Users />}
            label="Active directors"
            value={String(preview.company.activeDirectorCount ?? "Not listed")}
          />
        </dl>
      </div>

      {preview.adverseBanners.map((banner) => (
        <div
          key={banner.flag}
          className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900"
        >
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
          <p>{banner.message}</p>
        </div>
      ))}

      {preview.cleanReassurance ? (
        <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          <BadgeCheck className="mt-0.5 size-5 shrink-0" />
          <p>{preview.cleanReassurance}</p>
        </div>
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

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--color-border)] p-3">
      <dt className="flex items-center gap-2 text-xs font-medium text-[var(--color-muted)] uppercase">
        <span className="[&_svg]:size-4">{icon}</span>
        {label}
      </dt>
      <dd className="mt-2 text-sm font-medium text-[var(--color-text)]">{value}</dd>
    </div>
  );
}

function CourtRecordsCard({ prompt }: { prompt: FreePreviewPayload["courtRecordsPrompt"] }) {
  return (
    <section className="rounded-lg bg-[var(--color-navy)] p-5 text-white shadow-sm">
      <p className="text-xs font-semibold tracking-wider text-[var(--color-teal)] uppercase">
        {prompt.label}
      </p>
      <h2 className="mt-3 text-xl font-semibold">{prompt.heading}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-200">{prompt.body}</p>
      <p className="mt-4 text-sm font-semibold">{prompt.questionLine}</p>
      <Button
        type="button"
        disabled
        title="Checkout available in the payments sprint"
        className="mt-4 h-11 w-full bg-[var(--color-teal)] text-[var(--color-navy)] hover:bg-[var(--color-teal-dark)]"
      >
        <LockKeyhole />
        {prompt.button}
      </Button>
      <p className="mt-3 text-xs text-slate-300">{prompt.smallText}</p>
    </section>
  );
}

function CuriosityCard({ card }: { card: FreePreviewPayload["curiosityCards"][number] }) {
  const isFullClearance = card.kind === "full_clearance";

  return (
    <article
      className={
        isFullClearance
          ? "rounded-lg border border-l-4 border-green-200 border-l-[var(--color-success)] bg-green-50 p-4 text-green-950 md:col-span-2"
          : "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm"
      }
    >
      {card.heading ? <h3 className="text-base font-semibold">{card.heading}</h3> : null}
      {card.question ? <h3 className="text-base font-semibold">{card.question}</h3> : null}
      {card.blurredAnswer ? (
        <div className="mt-3 rounded-md border border-dashed border-[var(--color-border)] bg-slate-50 px-3 py-2 text-sm font-semibold text-[var(--color-muted)] blur-[1px]">
          {card.blurredAnswer}
        </div>
      ) : null}
      {card.lockTag ? (
        <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-[var(--color-navy)]">
          <LockKeyhole className="size-3" />
          {card.lockTag}
        </p>
      ) : null}
      <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{card.body}</p>
      {card.button ? (
        <Button
          type="button"
          disabled
          title="Checkout available in the payments sprint"
          className="mt-4 bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]"
        >
          <FileLock2 />
          {card.button}
        </Button>
      ) : null}
      {card.smallText ? <p className="mt-2 text-xs text-green-800">{card.smallText}</p> : null}
    </article>
  );
}

function TierCard({ tier }: { tier: FreePreviewPayload["tierCards"][number] }) {
  return (
    <article className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-navy)]">{tier.name}</h2>
          <p className="mt-1 text-2xl font-semibold">{tier.price}</p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-[var(--color-muted)]">
          {tier.includesPdf ? "PDF" : "No PDF"}
        </span>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
        {tier.includedItems.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--color-teal)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        disabled
        title="Checkout available in the payments sprint"
        className="mt-4 h-10 w-full justify-between bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-soft)]"
      >
        {tier.cta}
        <ArrowRight />
      </Button>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status.trim().toLowerCase() === "active";

  return (
    <span
      className={
        isActive
          ? "rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700"
          : "rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700"
      }
    >
      {status}
    </span>
  );
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

const fallbackTierCards: FreePreviewPayload["tierCards"] = [
  {
    tier: "basic",
    name: "Basic",
    price: "£7.99",
    includesPdf: false,
    includedItems: [
      "Court records check",
      "Director names and appointment dates",
      "Registered address history",
    ],
    cta: "Unlock Basic Report",
  },
  {
    tier: "standard",
    name: "Standard",
    price: "£14.99",
    includesPdf: false,
    includedItems: [
      "Everything in Basic",
      "CCJ amounts and satisfaction status",
      "Recent filings and registered charges",
    ],
    cta: "Unlock Standard Report",
  },
  {
    tier: "premium",
    name: "Premium",
    price: "£27.00",
    includesPdf: true,
    includedItems: [
      "Everything in Standard",
      "Director and insolvency depth checks",
      "Branded PDF and timestamped reference",
    ],
    cta: "Unlock Premium Report",
  },
];
