import "server-only";

import { loadWebProxyConfig } from "@workspace/config/web";
import { createSignedPrincipal, proxyIdentityHeaders } from "@workspace/utils/proxy-identity";

import type { AuthIdentity } from "./identity";

export function addTrustedPrincipalHeaders(headers: Headers, identity: AuthIdentity): void {
  if (identity.state !== "verified") return;

  const secret = loadWebProxyConfig().webApiSharedSecret;
  if (!secret) return;

  const principal = createSignedPrincipal(identity.clerkUserId, identity.email, secret);
  headers.set(proxyIdentityHeaders.clerkUserId, principal.clerkUserId);
  headers.set(proxyIdentityHeaders.verifiedEmail, principal.verifiedEmail);
  headers.set(proxyIdentityHeaders.principalSignature, principal.signature);
  headers.set(proxyIdentityHeaders.principalTimestamp, principal.timestamp);
}
