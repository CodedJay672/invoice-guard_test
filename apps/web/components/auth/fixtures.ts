export const authFixtureNames = [
  "signed-out",
  "sign-in",
  "sign-up",
  "callback-loading",
  "auth-error",
  "signed-in",
  "signing-out",
  "unverified-email",
  "owner-access",
  "non-owner-access",
  "guest-access",
] as const;

export type AuthFixtureName = (typeof authFixtureNames)[number];

export type AuthIdentityState = "signed-out" | "signed-in" | "unverified-email";
export type ReportAccessOutcome = "owner" | "non-owner" | "guest";

const reportPathPattern = /^\/reports\/(?:access\/)?[A-Za-z0-9_-]+\/?$/;
const currentPhasePaths = new Set(["/", "/search", "/checkout", "/checkout/status"]);

export function resolveAuthFixtureName(
  value: string | undefined,
  environment: "development" | "test" | "production",
): AuthFixtureName | undefined {
  if (environment === "production") return undefined;
  return authFixtureNames.some((name) => name === value) ? (value as AuthFixtureName) : undefined;
}

export function isAuthPreviewEnabled(environment: "development" | "test" | "production") {
  return environment !== "production";
}

export function parseSafeReturnPath(value: string | undefined, fallback = "/search"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\") || hasControlCharacter(value)) return fallback;

  try {
    const parsed = new URL(value, "https://invoiceguard.local");
    if (parsed.origin !== "https://invoiceguard.local") return fallback;
    if (!currentPhasePaths.has(parsed.pathname) && !reportPathPattern.test(parsed.pathname)) {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

function hasControlCharacter(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code <= 31 || code === 127;
  });
}

export function authHref(path: "/sign-in" | "/sign-up", returnTo: string): string {
  const params = new URLSearchParams({ returnTo: parseSafeReturnPath(returnTo) });
  return `${path}?${params.toString()}`;
}
