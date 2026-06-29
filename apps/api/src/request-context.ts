import { createHmac, randomBytes } from "node:crypto";

import {
  proxyIdentityHeaders,
  verifySignedClientIp,
  verifySignedPrincipal,
  type SignedClientIp,
  type SignedPrincipal,
} from "@workspace/utils";
import type { Request } from "express";

export interface RequestIdentity {
  clerkUserId: string | undefined;
  verifiedEmail: string | undefined;
  ipHash: string | undefined;
}

export interface RequestIdentityResolverOptions {
  webApiSharedSecret?: string | undefined;
  searchIpHashSecret?: string | undefined;
}

export type RequestIdentityResolver = (request: Request) => RequestIdentity;

export function createRequestIdentityResolver(
  options: RequestIdentityResolverOptions = {},
): RequestIdentityResolver {
  const searchIpHashSecret = options.searchIpHashSecret ?? randomBytes(32).toString("hex");

  return (request: Request): RequestIdentity => {
    const clientIp = getClientIp(request, options.webApiSharedSecret);
    const principal = getPrincipal(request, options.webApiSharedSecret);

    return {
      clerkUserId: principal?.clerkUserId ?? request.clerkUserId,
      verifiedEmail: principal?.verifiedEmail,
      ipHash: clientIp ? hashIpAddress(clientIp, searchIpHashSecret) : undefined,
    };
  };
}

function getPrincipal(
  request: Request,
  webApiSharedSecret: string | undefined,
): Pick<SignedPrincipal, "clerkUserId" | "verifiedEmail"> | undefined {
  if (!webApiSharedSecret) return undefined;
  const signedPrincipal = readSignedPrincipal(request);
  return signedPrincipal ? verifySignedPrincipal(signedPrincipal, webApiSharedSecret) : undefined;
}

export function hashIpAddress(ipAddress: string, secret: string): string {
  return createHmac("sha256", secret).update(ipAddress).digest("hex");
}

function getClientIp(request: Request, webApiSharedSecret: string | undefined): string | undefined {
  if (webApiSharedSecret) {
    const signedIdentity = readSignedIdentity(request);
    const verifiedIp = signedIdentity
      ? verifySignedClientIp(signedIdentity, webApiSharedSecret)
      : undefined;

    if (verifiedIp) {
      return verifiedIp;
    }
  }

  return request.socket.remoteAddress ?? request.ip;
}

function readSignedIdentity(request: Request): SignedClientIp | undefined {
  const clientIp = request.get(proxyIdentityHeaders.clientIp);
  const signature = request.get(proxyIdentityHeaders.signature);
  const timestamp = request.get(proxyIdentityHeaders.timestamp);

  return clientIp && signature && timestamp ? { clientIp, signature, timestamp } : undefined;
}

function readSignedPrincipal(request: Request): SignedPrincipal | undefined {
  const clerkUserId = request.get(proxyIdentityHeaders.clerkUserId);
  const verifiedEmail = request.get(proxyIdentityHeaders.verifiedEmail);
  const signature = request.get(proxyIdentityHeaders.principalSignature);
  const timestamp = request.get(proxyIdentityHeaders.principalTimestamp);

  return clerkUserId && verifiedEmail && signature && timestamp
    ? { clerkUserId, verifiedEmail, signature, timestamp }
    : undefined;
}
