"use client";

import React from "react";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

function SearchPanel() {
  const params = useSearchParams();
  const query = params.get("q") || "";

  return <SearchPanelForm key={query} initialQuery={query} paramsString={params.toString()} />;
}

type SearchPanelFormProps = {
  initialQuery: string;
  paramsString: string;
};

function SearchPanelForm({ initialQuery, paramsString }: SearchPanelFormProps) {
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
    const searchParams = new URLSearchParams(paramsString);
    searchParams.set("q", trimmedInput);

    router.push(`/search?${searchParams.toString()}`);
    setSearchStatus("idle");
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className="text-content-subtle text-xs font-medium mb-2.5 block" htmlFor="company-search">
        Company name or number
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
            className="flex-1 bg-surface-subtle border border-line rounded-sm py-2.5 pr-4 pl-10 text-content text-sm outline-none transition-colors duration-150 focus:border-brand-navy-hover placeholder:text-content-subtle"
          />
        </div>
        <Button
          type="submit"
          variant="ghost"
          size="lg"
          disabled={searchStatus === "loading"}
          className="bg-brand-navy text-content-inverse text-sm font-semibold rounded-sm py-2.5 px-6 cursor-pointer whitespace-nowrap transition-colors hover:bg-brand-navy-hover"
        >
          <Search data-icon="inline-start" />
          {searchStatus === "loading" ? "Searching" : "Search"}
        </Button>
      </div>
    </form>
  );
}

export default SearchPanel;
