import "server-only";

import { loadWebProxyConfig } from "@workspace/config/web";
import { creditBalanceSchema, type CreditBalance } from "@workspace/validation";
import { resolveAuthIdentity } from "@/lib/auth/identity";
import { addTrustedPrincipalHeaders } from "@/lib/auth/trusted-principal";

export async function requestCreditBalance(): Promise<CreditBalance | undefined> {
  const identity = await resolveAuthIdentity();
  if (identity.state !== "verified") return undefined;
  const config = loadWebProxyConfig();
  const headers = new Headers({ Accept: "application/json" });
  addTrustedPrincipalHeaders(headers, identity);
  try {
    const response = await fetch(new URL("/credits/balance", config.apiBaseUrl), {
      headers,
      cache: "no-store",
    });
    const body = (await response.json()) as { data?: unknown };
    const parsed = creditBalanceSchema.safeParse(body.data);
    return response.ok && parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}
