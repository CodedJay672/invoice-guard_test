"use client";

import { useRouter } from "next/navigation";

export default function useQuery() {
  const router = useRouter();

  const handleQuery = (query: string, value: string) => {
    const searchParam = new URLSearchParams({
      query,
      value,
    });
    router.push(`?${searchParam.toString()}`);
  };

  return {
    handleQuery,
  };
}
