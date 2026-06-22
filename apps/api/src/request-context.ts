import { createHmac, randomBytes } from "node:crypto";

import { proxyIdentityHeaders, verifySignedClientIp, type SignedClientIp } from "@workspace/utils";
import type { Request } from "express";

export interface RequestIdentity {
  clerkUserId: string | undefined;
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

    return {
      clerkUserId: request.clerkUserId,
      ipHash: clientIp ? hashIpAddress(clientIp, searchIpHashSecret) : undefined,
    };
  };
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
