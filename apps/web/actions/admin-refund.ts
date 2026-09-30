"use server";

import { loadWebProxyConfig } from "@workspace/config/web";
import { refundRequestSchema } from "@workspace/validation";

import { resolveAuthIdentity } from "@/lib/auth/identity";
import { addTrustedPrincipalHeaders } from "@/lib/auth/trusted-principal";

export async function requestAdminRefund(input: unknown) {
  const parsed = refundRequestSchema.safeParse(input);
  const identity = await resolveAuthIdentity();
  if (!parsed.success || identity.state !== "verified") {
    return { ok: false as const, message: "Check the refund details." };
  }
  const config = loadWebProxyConfig();
  const headers = new Headers({ "content-type": "application/json" });
  addTrustedPrincipalHeaders(headers, identity);
  try {
    const response = await fetch(new URL("/admin/refunds", config.apiBaseUrl), {
      method: "POST",
      headers,
      body: JSON.stringify(parsed.data),
      cache: "no-store",
      signal: AbortSignal.timeout(config.timeoutMs),
    });
    const body = (await response.json()) as { data?: { refundRequestId?: unknown } };
    return response.ok && typeof body.data?.refundRequestId === "string"
      ? { ok: true as const, refundRequestId: body.data.refundRequestId }
      : { ok: false as const, message: "The refund could not be queued." };
  } catch {
    return { ok: false as const, message: "The refund could not be queued." };
  }
}
