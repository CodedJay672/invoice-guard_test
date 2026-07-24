import type { NextRequest } from "next/server";

import { proxyApiGet } from "@/lib/api-proxy";

export function GET(request: NextRequest): Promise<Response> {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  return proxyApiGet(request, `/companies/search?q=${encodeURIComponent(query)}`);
}
