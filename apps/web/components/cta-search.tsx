"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

function CTASearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="roundedxl mx-auto flex max-w-125 items-center rounded-full border border-line bg-page p-1.5 transition-colors duration-200 focus-within:border-content focus-within:shadow-lg">
      <SearchIcon size={24} />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search a company name or number..."
        className="flex-1 border-none bg-none px-4 py-2.5 text-sm text-content outline-none placeholder:text-content-subtle"
      />
      <button
        onClick={() => router.push(`/search?q=${searchQuery}`)}
        className="cursor-pointer rounded-full border-none bg-brand-navy px-5 py-2.5 text-sm font-bold whitespace-nowrap text-content-inverse transition-all hover:bg-surface-subtle"
      >
        Search Free →
      </button>
    </div>
  );
}

export default CTASearch;
