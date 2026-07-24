"use server";

import { loadWebProxyConfig } from "@workspace/config/web";
import { createCheckoutSessionSchema } from "@workspace/validation/checkout";

import { resolveAuthIdentity } from "@/lib/auth/identity";
import { addTrustedPrincipalHeaders } from "@/lib/auth/trusted-principal";

export type StartCheckoutResult = { ok: true; url: string } | { ok: false; message: string };

export async function startCheckout(input: unknown): Promise<StartCheckoutResult> {
  try {
    const identity = await resolveAuthIdentity();
    if (identity.state === "unverified") {
      return {
        ok: false,
        message: "Verify your account email before continuing to payment.",
      };
    }

    const candidate =
      identity.state === "verified" && typeof input === "object" && input !== null
        ? { ...input, email: identity.email }
        : input;
    const parsed = createCheckoutSessionSchema.safeParse(candidate);
    if (!parsed.success) return { ok: false, message: "Check the report delivery details." };

    const config = loadWebProxyConfig();
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), config.timeoutMs);
    try {
      const headers = new Headers({ "content-type": "application/json" });
      addTrustedPrincipalHeaders(headers, identity);
      const response = await fetch(new URL("/checkout/sessions", config.apiBaseUrl), {
        method: "POST",
        cache: "no-store",
        headers,
        body: JSON.stringify(parsed.data),
        signal: abortController.signal,
      });

      console.log(response);

      if (!response.ok) return { ok: false, message: "Checkout could not be started right now." };
      const payload = (await response.json()) as { data?: { url?: unknown } };
      return typeof payload.data?.url === "string"
        ? { ok: true, url: payload.data.url }
        : { ok: false, message: "Checkout could not be started right now." };
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return { ok: false, message: "Checkout could not be started right now." };
  }
}
