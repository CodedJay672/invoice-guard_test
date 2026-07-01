"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";
import { Building2, CircleAlert, Search } from "lucide-react";

import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  apiErrorResponseSchema,
  companySearchApiResponseSchema,
  type CompanySearchMatchPayload,
} from "@workspace/validation/companies";

type SearchState = "idle" | "loading" | "results" | "empty" | "error";

export function RootSearchBar() {
  const router = useRouter();
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<CompanySearchMatchPayload[]>([]);
  const [state, setState] = useState<SearchState>("idle");
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      return;
    }

    const abortController = new AbortController();
    const timeout = window.setTimeout(() => {
      void searchCompanies(trimmedQuery, abortController.signal);
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      abortController.abort();
    };
  }, [query]);

  async function searchCompanies(searchQuery: string, signal?: AbortSignal): Promise<void> {
    setState("loading");
    setMessage(undefined);

    try {
      const response = await fetch(
        `/api/companies/search?q=${encodeURIComponent(searchQuery)}`,
        signal ? { signal } : undefined,
      );
      const body = (await response.json()) as unknown;

      if (!response.ok) {
        const error = apiErrorResponseSchema.safeParse(body);
        setMatches([]);
        setState("error");
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
      setState(parsed.data.data.matches.length > 0 ? "results" : "empty");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      setMatches([]);
      setState("error");
      setMessage("Company data could not be retrieved right now.");
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (query.trim().length >= 2) {
      void searchCompanies(query.trim());
    }
  }

  function selectCompany(company: CompanySearchMatchPayload): void {
    const params = new URLSearchParams({
      companyNumber: company.companiesHouseNumber,
      q: company.companyName,
    });

    router.push(`/search?${params.toString()}`);
  }

  const showDropdown = state !== "idle";

  return (
    <div className="relative max-w-2xl">
      <form
        className="flex flex-col gap-3 rounded-lg bg-surface p-2 shadow-xl sm:flex-row"
        onSubmit={submitSearch}
      >
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-content-muted"
          />
          <Input
            aria-autocomplete="list"
            aria-controls={showDropdown ? listboxId : undefined}
            aria-expanded={showDropdown}
            aria-label="Search by registered company name or Companies House number"
            autoComplete="off"
            className="h-12 border-transparent bg-surface pr-4 pl-10 text-content shadow-none"
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);

              if (nextQuery.trim().length < 2) {
                setMatches([]);
                setState("idle");
                setMessage(undefined);
              }
            }}
            placeholder="Company name or number"
            role="combobox"
            value={query}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 px-5"
          disabled={query.trim().length < 2 || state === "loading"}
        >
          <Search data-icon="inline-start" />
          {state === "loading" ? "Searching" : "Search"}
        </Button>
      </form>

      {showDropdown ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Company suggestions"
          className="absolute top-full right-0 left-0 z-10 mt-2 overflow-hidden rounded-lg border border-line bg-surface text-content shadow-xl"
        >
          {state === "loading" ? (
            <div className="flex flex-col gap-3 p-4" role="status">
              <span className="text-sm text-content-muted">Searching Companies House…</span>
              <Skeleton className="h-12 w-full" />
            </div>
          ) : null}

          {state === "empty" ? (
            <p className="p-4 text-sm text-content-muted">No matching companies found.</p>
          ) : null}

          {state === "error" ? (
            <Alert variant="caution" className="rounded-none border-0">
              <CircleAlert aria-hidden="true" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}

          {state === "results" ? (
            <ul className="max-h-80 overflow-y-auto">
              {matches.map((company) => (
                <li key={company.companiesHouseNumber} role="option" aria-selected="false">
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-start gap-3 border-b border-line p-4 text-left last:border-b-0 hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none focus-visible:ring-inset"
                    onClick={() => selectCompany(company)}
                  >
                    <Building2
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-brand-teal"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-brand-navy">
                        {company.companyName}
                      </span>
                      <span className="mt-1 block font-mono text-xs text-content-muted">
                        {company.companiesHouseNumber} · {company.companyStatus}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
