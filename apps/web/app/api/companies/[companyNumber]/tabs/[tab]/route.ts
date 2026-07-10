import type { NextRequest } from "next/server";

import { proxyApiGet } from "@/lib/api-proxy";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ companyNumber: string; tab: string }> },
): Promise<Response> {
  const { companyNumber, tab } = await context.params;
  const target = new URL(
    `/companies/${encodeURIComponent(companyNumber)}/tabs/${encodeURIComponent(tab)}`,
    "http://internal",
  );
  target.search = request.nextUrl.search;
  return proxyApiGet(request, `${target.pathname}${target.search}`);
}
