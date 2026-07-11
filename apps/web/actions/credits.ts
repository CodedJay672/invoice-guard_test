"use server";

import { loadWebProxyConfig } from "@workspace/config/web";
import { redeemCreditInputSchema, redeemCreditResultSchema } from "@workspace/validation";
import { resolveAuthIdentity } from "@/lib/auth/identity";
import { addTrustedPrincipalHeaders } from "@/lib/auth/trusted-principal";

export async function redeemCredit(input: unknown) {
  const parsed = redeemCreditInputSchema.safeParse(input);
  const identity = await resolveAuthIdentity();
  if (!parsed.success || identity.state !== "verified")
    return { ok: false as const, message: "Credit redemption could not be started." };
  const config = loadWebProxyConfig();
  const headers = new Headers({ "content-type": "application/json" });
  addTrustedPrincipalHeaders(headers, identity);
  try {
    const response = await fetch(new URL("/credits/redemptions", config.apiBaseUrl), {
      method: "POST",
      headers,
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
    const body = (await response.json()) as { data?: unknown };
    const result = redeemCreditResultSchema.safeParse(body.data);
    return response.ok && result.success
      ? { ok: true as const, ...result.data }
      : { ok: false as const, message: "A report credit could not be used right now." };
  } catch {
    return { ok: false as const, message: "A report credit could not be used right now." };
  }
}
