import "server-only";

import { headers as nextHeaders } from "next/headers";
import { assertWebProxyProductionConfig, loadWebProxyConfig } from "@workspace/config/web";
import {
  createSignedClientIp,
  normaliseClientIp,
  proxyIdentityHeaders,
} from "@workspace/utils/proxy-identity";
import { apiErrorResponseSchema, freeCompanyTabApiResponseSchema } from "@workspace/validation";
import type { FreeCompanyTab, FreeCompanyTabPayload } from "@workspace/types";

import { resolveAuthIdentity } from "@/lib/auth/identity";
import { addTrustedPrincipalHeaders } from "@/lib/auth/trusted-principal";

export type CompanyTabRequestResult =
  | { status: "success"; tab: FreeCompanyTabPayload }
  | { status: "failed"; message: string; rateLimited: boolean };

export async function requestFreeCompanyTab(
  companyNumber: string,
  tab: FreeCompanyTab,
  page = 1,
  limit = 25,
): Promise<CompanyTabRequestResult> {
  const config = loadWebProxyConfig();
  assertWebProxyProductionConfig(config);
  const url = new URL(
    `/companies/${encodeURIComponent(companyNumber)}/tabs/${tab}`,
    config.apiBaseUrl,
  );
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  const requestHeaders = new Headers({ Accept: "application/json" });
  const incomingHeaders = await nextHeaders();
  const clientIp = normaliseClientIp(incomingHeaders.get(config.trustedClientIpHeader));
  if (clientIp && config.webApiSharedSecret) {
    const signed = createSignedClientIp(clientIp, config.webApiSharedSecret);
    requestHeaders.set(proxyIdentityHeaders.clientIp, signed.clientIp);
    requestHeaders.set(proxyIdentityHeaders.signature, signed.signature);
    requestHeaders.set(proxyIdentityHeaders.timestamp, signed.timestamp);
  }
  addTrustedPrincipalHeaders(requestHeaders, await resolveAuthIdentity());
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), config.timeoutMs);
  try {
    const response = await fetch(url, {
      headers: requestHeaders,
      cache: "no-store",
      signal: abortController.signal,
    });
    const body = (await response.json()) as unknown;
    if (!response.ok) {
      const error = apiErrorResponseSchema.safeParse(body);
      return {
        status: "failed",
        rateLimited: response.status === 429,
        message: error.success
          ? error.data.error.message
          : "Company data could not be retrieved right now.",
      };
    }
    const parsed = freeCompanyTabApiResponseSchema.safeParse(body);
    return parsed.success
      ? { status: "success", tab: parsed.data.data.tab }
      : {
          status: "failed",
          rateLimited: false,
          message: "Company data could not be retrieved right now.",
        };
  } catch {
    return {
      status: "failed",
      rateLimited: false,
      message: "Company data could not be retrieved right now.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
