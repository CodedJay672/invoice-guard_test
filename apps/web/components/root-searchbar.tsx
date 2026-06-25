"use client";

import { useSearchHook } from '@/hooks/use-search-hook';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Search } from 'lucide-react';
import React, { useState } from 'react'


export function RootSearchBarSkeleton() {
  return (
    <div className='w-full h-15 rounded-3xl border border-line' />
  )
}

function RootSearchBar() {
  const { search } = useSearchHook();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSearch = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!searchTerm) return;
    search(searchTerm);
  }

  return (
    <form onSubmit={handleSearch} className='w-full h-15 rounded-3xl border border-line overflow-hidden relative flex justify-between items-center'>
      <Search className='size-4 sm:size-6 text-content-muted absolute left-2.5' />
      <Input aria-label='search query' placeholder='Search by company name...' value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className='w-full h-full border-none pl-10 pr-14 sm:pr-28 placeholder:truncate' />
      <Button variant="ghost" className='bg-brand-teal hover:bg-brand-teal/80 text-content-inverse absolute right-2 cursor-pointer'>
        <Search className='text-content-inverse text-xs md:text-sm' />
        <span className='hidden sm:flex'>Search</span>
      </Button>
    </form>
  )
}

export default RootSearchBar