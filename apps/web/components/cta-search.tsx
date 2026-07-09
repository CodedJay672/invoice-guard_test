"use client";

import { SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

function CTASearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex items-center max-w-125 mx-auto bg-page  border border-line roundedxl p-1.5 transition-colors duration-200 focus-within:border-content focus-within:shadow-lg rounded-full">
      <SearchIcon size={24} />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search a company name or number..."
        className="flex-1 bg-none border-none outline-none text-content text-sm py-2.5 px-4 placeholder:text-content-subtle"
      />
      <button
        onClick={() => router.push(`/search?q=${searchQuery}`)}
        className="bg-brand-navy text-content-inverse text-sm font-bold border-none rounded-full py-2.5 px-5 cursor-pointer transition-all whitespace-nowrap hover:bg-surface-subtle">Search Free →</button>
    </div>
  )
}

export default CTASearch