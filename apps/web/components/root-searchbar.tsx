"use client";

import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { ArrowRightFromLine } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

export function RootSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submitSearch(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) return;
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  }

  return (
    <form
      onSubmit={submitSearch}
      className="relative flex items-center justify-center gap-3 rounded-lg bg-surface p-2 shadow-xl sm:flex-row"
    >
      <Input
        aria-label="Search by registered company name or Companies House number"
        autoComplete="off"
        className="h-12 w-full border-transparent bg-surface pr-10 text-content shadow-none placeholder:text-content-subtle focus:border-brand-teal focus:ring-brand-teal sm:text-sm"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Company name or number"
        value={query}
      />

      <Button
        type="submit"
        size="lg"
        disabled={query.trim().length < 2}
        className="absolute right-2 h-12 cursor-pointer bg-brand-navy text-content-inverse hover:bg-brand-navy-hover"
      >
        <span className="hidden md:inline-block">Search free</span>
        <ArrowRightFromLine data-icon="inline-start" />
      </Button>
    </form>
  );
}
