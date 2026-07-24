import type { NextRequest } from "next/server";
import { proxyApiGet } from "@/lib/api-proxy";
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ officerId: string }> },
): Promise<Response> {
  const { officerId } = await context.params;
  return proxyApiGet(request, `/disqualified-officers/corporate/${encodeURIComponent(officerId)}`);
}
