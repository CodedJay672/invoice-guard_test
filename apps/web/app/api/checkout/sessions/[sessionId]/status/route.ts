import { checkoutSessionIdSchema } from "@workspace/validation/checkout";
import type { NextRequest } from "next/server";

import { proxyApiGet } from "@/lib/api-proxy";
import { resolveAuthIdentity } from "@/lib/auth/identity";
import { addTrustedPrincipalHeaders } from "@/lib/auth/trusted-principal";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(request: NextRequest, context: RouteContext): Promise<Response> {
  const { sessionId } = await context.params;
  const parsed = checkoutSessionIdSchema.safeParse(sessionId);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "invalid_checkout_session", message: "Checkout Session ID is invalid." } },
      { status: 400 },
    );
  }
  const identity = await resolveAuthIdentity();
  if (identity.state !== "verified") {
    return Response.json(
      { error: { code: "authentication_required", message: "Sign in with a verified email." } },
      { status: 401 },
    );
  }
  const headers = new Headers();
  addTrustedPrincipalHeaders(headers, identity);
  return proxyApiGet(
    request,
    `/checkout/sessions/${encodeURIComponent(parsed.data)}/status`,
    headers,
  );
}
