export type AuthIdentity =
  | { state: "signed-out" }
  | { state: "unverified"; clerkUserId: string }
  | { state: "verified"; clerkUserId: string; email: string };

export function resolveClerkIdentity(
  clerkUserId: string | undefined,
  primaryEmail:
    | { emailAddress: string; verification?: { status?: string | null } | null }
    | null
    | undefined,
): AuthIdentity {
  if (!clerkUserId) return { state: "signed-out" };

  if (!primaryEmail || primaryEmail.verification?.status !== "verified") {
    return { state: "unverified", clerkUserId };
  }

  return {
    state: "verified",
    clerkUserId,
    email: primaryEmail.emailAddress.trim().toLowerCase(),
  };
}
