import type { NextRequest } from "next/server";

import { proxyApiGet } from "@/lib/api-proxy";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ companyNumber: string }> },
): Promise<Response> {
  const { companyNumber } = await context.params;

  return proxyApiGet(request, `/companies/${encodeURIComponent(companyNumber)}/free-preview`);
}
