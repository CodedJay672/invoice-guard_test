import { createHash } from "node:crypto";

import type { Request } from "express";

export interface RequestIdentity {
  clerkUserId: string | undefined;
  ipHash: string | undefined;
}

export function getRequestIdentity(request: Request): RequestIdentity {
  const clientIp = getClientIp(request);

  return {
    clerkUserId: request.clerkUserId,
    ipHash: clientIp ? hashIpAddress(clientIp) : undefined,
  };
}

export function hashIpAddress(ipAddress: string): string {
  return createHash("sha256").update(ipAddress).digest("hex").slice(0, 32);
}

function getClientIp(request: Request): string | undefined {
  const forwardedFor = request.get("x-forwarded-for");
  const firstForwardedAddress = forwardedFor?.split(",")[0]?.trim();

  return firstForwardedAddress || request.ip || request.socket.remoteAddress;
}
