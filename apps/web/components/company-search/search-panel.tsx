"use client";

import React from "react";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import type { ReportProductCode } from "@workspace/types";

function SearchPanel({ purchaseTier }: { purchaseTier?: ReportProductCode | undefined }) {
  const params = useSearchParams();
  const query = params.get("q") || "";
  const tab = params.get("tab");
  const type = params.get("type");

  return (
    <SearchPanelForm
      key={query}
      initialQuery={query}
      purchaseTier={purchaseTier}
      tab={tab === "disqualifications" ? tab : "all"}
      disqualificationType={type === "natural" ? "natural" : "corporate"}
    />
  );
}

type SearchPanelFormProps = {
  initialQuery: string;
  purchaseTier?: ReportProductCode | undefined;
  tab: "all" | "disqualifications";
  disqualificationType: "corporate" | "natural";
};

function SearchPanelForm({
  initialQuery,
  purchaseTier,
  tab,
  disqualificationType,
}: SearchPanelFormProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = React.useState(initialQuery);
  const [searchStatus, setSearchStatus] = React.useState<"idle" | "loading" | "invalid">("idle");

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedInput = searchInput.trim();

    if (trimmedInput.length < 2) {
      setSearchStatus("invalid");
      return;
    }

    setSearchStatus("loading");
    const searchParams = new URLSearchParams({ q: trimmedInput });
    if (purchaseTier) searchParams.set("tier", purchaseTier);
    if (tab === "disqualifications") searchParams.set("tab", tab);
    if (tab === "disqualifications") searchParams.set("type", disqualificationType);

    router.push(`/search?${searchParams.toString()}`);
    setSearchStatus("idle");
  };

  return (
    <form onSubmit={handleSubmit}>
      <label
        className="mb-2.5 block text-xs font-medium text-content-subtle"
        htmlFor="company-search"
      >
        {tab === "disqualifications"
          ? disqualificationType === "natural"
            ? "Person name"
            : "Corporate officer name"
          : "Company name or number"}
      </label>
      <div className="flex gap-2.5">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-content-muted"
          />
          <Input
            id="company-search"
            name="q"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              if (searchStatus === "invalid") setSearchStatus("idle");
            }}
            aria-invalid={searchStatus === "invalid"}
            placeholder="For example, ACME or 12345678"
            className="flex-1 rounded-sm border border-line bg-surface-subtle py-2.5 pr-4 pl-10 text-sm text-content transition-colors duration-150 outline-none placeholder:text-content-subtle focus:border-brand-navy-hover"
          />
        </div>
        <Button
          type="submit"
          variant="ghost"
          size="lg"
          disabled={searchStatus === "loading"}
          className="cursor-pointer rounded-sm bg-brand-navy px-6 py-2.5 text-sm font-semibold whitespace-nowrap text-content-inverse transition-colors hover:bg-brand-navy-hover"
        >
          <Search data-icon="inline-start" />
          {searchStatus === "loading" ? "Searching" : "Search"}
        </Button>
      </div>
    </form>
  );
}

export default SearchPanel;
