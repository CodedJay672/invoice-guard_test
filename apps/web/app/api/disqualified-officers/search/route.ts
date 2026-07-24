import type { NextRequest } from "next/server";
import { proxyApiGet } from "@/lib/api-proxy";
export function GET(request: NextRequest): Promise<Response> {
  return proxyApiGet(
    request,
    `/disqualified-officers/search?${request.nextUrl.searchParams.toString()}`,
  );
}
