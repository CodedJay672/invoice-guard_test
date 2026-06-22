import { assertWebProxyProductionConfig, loadWebProxyConfig } from "@workspace/config/web";
import {
  createSignedClientIp,
  normaliseClientIp,
  proxyIdentityHeaders,
} from "@workspace/utils/proxy-identity";
import type { NextRequest } from "next/server";

const config = loadWebProxyConfig();

export async function proxyApiGet(request: NextRequest, path: string): Promise<Response> {
  assertWebProxyProductionConfig(config);
  const headers = new Headers({ Accept: "application/json" });
  const trustedClientIp = normaliseClientIp(request.headers.get(config.trustedClientIpHeader));

  if (trustedClientIp && config.webApiSharedSecret) {
    const signedIdentity = createSignedClientIp(trustedClientIp, config.webApiSharedSecret);

    headers.set(proxyIdentityHeaders.clientIp, signedIdentity.clientIp);
    headers.set(proxyIdentityHeaders.signature, signedIdentity.signature);
    headers.set(proxyIdentityHeaders.timestamp, signedIdentity.timestamp);
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), config.timeoutMs);

  try {
    const response = await fetch(new URL(path, config.apiBaseUrl), {
      cache: "no-store",
      headers,
      signal: abortController.signal,
    });
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch {
    return Response.json(
      {
        error: {
          code: "api_unavailable",
          message: "Company data could not be retrieved right now.",
        },
      },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
