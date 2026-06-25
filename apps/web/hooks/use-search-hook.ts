"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useSearchHook() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const search = useCallback((searchTerm: string) => {
    const query = new URLSearchParams(searchParams.toString());

    if (!searchTerm) {
      return;
    }

    query.set("q", searchTerm);
    router.replace(`?${query.toString()}`);
  }, []);

  return { search };
}
