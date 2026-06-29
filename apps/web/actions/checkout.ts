"use server";

import { loadWebProxyConfig } from "@workspace/config/web";
import { createCheckoutSessionSchema } from "@workspace/validation/checkout";

export type StartCheckoutResult = { ok: true; url: string } | { ok: false; message: string };

export async function startCheckout(input: unknown): Promise<StartCheckoutResult> {
  try {
    const parsed = createCheckoutSessionSchema.safeParse(input);
    if (!parsed.success) return { ok: false, message: "Check the report delivery details." };

    const config = loadWebProxyConfig();
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), config.timeoutMs);
    try {
      const response = await fetch(new URL("/checkout/sessions", config.apiBaseUrl), {
        method: "POST",
        cache: "no-store",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: abortController.signal,
      });
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
