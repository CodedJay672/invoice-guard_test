import { createHmac, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";

export const proxyIdentityHeaders = {
  clientIp: "x-invoiceguard-client-ip",
  signature: "x-invoiceguard-client-ip-signature",
  timestamp: "x-invoiceguard-client-ip-timestamp",
  clerkUserId: "x-invoiceguard-clerk-user-id",
  verifiedEmail: "x-invoiceguard-verified-email",
  principalSignature: "x-invoiceguard-principal-signature",
  principalTimestamp: "x-invoiceguard-principal-timestamp",
} as const;

const defaultMaximumAgeMs = 60_000;

export interface SignedClientIp {
  clientIp: string;
  signature: string;
  timestamp: string;
}

export interface SignedPrincipal {
  clerkUserId: string;
  verifiedEmail: string;
  signature: string;
  timestamp: string;
}

export function normaliseClientIp(value: string | null | undefined): string | undefined {
  const candidate = value?.split(",")[0]?.trim();

  return candidate && isIP(candidate) > 0 ? candidate : undefined;
}

export function createSignedClientIp(
  clientIp: string,
  secret: string,
  timestampMs: number = Date.now(),
): SignedClientIp {
  const normalisedIp = normaliseClientIp(clientIp);

  if (!normalisedIp) {
    throw new Error("A valid client IP address is required.");
  }

  const timestamp = String(timestampMs);

  return {
    clientIp: normalisedIp,
    timestamp,
    signature: createSignature(normalisedIp, timestamp, secret),
  };
}

export function verifySignedClientIp(
  input: SignedClientIp,
  secret: string,
  nowMs: number = Date.now(),
  maximumAgeMs: number = defaultMaximumAgeMs,
): string | undefined {
  const clientIp = normaliseClientIp(input.clientIp);
  const timestampMs = Number(input.timestamp);

  if (
    !clientIp ||
    !Number.isSafeInteger(timestampMs) ||
    Math.abs(nowMs - timestampMs) > maximumAgeMs
  ) {
    return undefined;
  }

  const expected = Buffer.from(createSignature(clientIp, input.timestamp, secret), "hex");
  const received = Buffer.from(input.signature, "hex");

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return undefined;
  }

  return clientIp;
}

export function createSignedPrincipal(
  clerkUserId: string,
  verifiedEmail: string,
  secret: string,
  timestampMs: number = Date.now(),
): SignedPrincipal {
  const principal = normalisePrincipal(clerkUserId, verifiedEmail);
  if (!principal) throw new Error("A valid verified principal is required.");

  const timestamp = String(timestampMs);
  return {
    ...principal,
    timestamp,
    signature: createPrincipalSignature(
      principal.clerkUserId,
      principal.verifiedEmail,
      timestamp,
      secret,
    ),
  };
}

export function verifySignedPrincipal(
  input: SignedPrincipal,
  secret: string,
  nowMs: number = Date.now(),
  maximumAgeMs: number = defaultMaximumAgeMs,
): Pick<SignedPrincipal, "clerkUserId" | "verifiedEmail"> | undefined {
  const principal = normalisePrincipal(input.clerkUserId, input.verifiedEmail);
  const timestampMs = Number(input.timestamp);
  if (
    !principal ||
    !Number.isSafeInteger(timestampMs) ||
    Math.abs(nowMs - timestampMs) > maximumAgeMs
  ) {
    return undefined;
  }

  const expected = Buffer.from(
    createPrincipalSignature(
      principal.clerkUserId,
      principal.verifiedEmail,
      input.timestamp,
      secret,
    ),
    "hex",
  );
  const received = Buffer.from(input.signature, "hex");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return undefined;

  return principal;
}

function createSignature(clientIp: string, timestamp: string, secret: string): string {
  if (secret.length < 32) {
    throw new Error("Proxy identity secrets must contain at least 32 characters.");
  }

  return createHmac("sha256", secret).update(`${timestamp}.${clientIp}`).digest("hex");
}

function normalisePrincipal(
  clerkUserId: string,
  verifiedEmail: string,
): Pick<SignedPrincipal, "clerkUserId" | "verifiedEmail"> | undefined {
  const userId = clerkUserId.trim();
  const email = verifiedEmail.trim().toLowerCase();
  if (
    !/^user_[A-Za-z0-9_-]{1,123}$/.test(userId) ||
    email.length > 320 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return undefined;
  }
  return { clerkUserId: userId, verifiedEmail: email };
}

function createPrincipalSignature(
  clerkUserId: string,
  verifiedEmail: string,
  timestamp: string,
  secret: string,
): string {
  if (secret.length < 32) {
    throw new Error("Proxy identity secrets must contain at least 32 characters.");
  }
  return createHmac("sha256", secret)
    .update(`${timestamp}.${clerkUserId}.${verifiedEmail}`)
    .digest("hex");
}
