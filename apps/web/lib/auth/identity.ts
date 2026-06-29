import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

export type AuthIdentity =
  | { state: "signed-out" }
  | { state: "unverified"; clerkUserId: string }
  | { state: "verified"; clerkUserId: string; email: string };

export async function resolveAuthIdentity(): Promise<AuthIdentity> {
  const session = await auth();
  if (!session.userId) return { state: "signed-out" };

  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress;
  if (!primaryEmail || primaryEmail.verification?.status !== "verified") {
    return { state: "unverified", clerkUserId: session.userId };
  }

  return {
    state: "verified",
    clerkUserId: session.userId,
    email: primaryEmail.emailAddress.trim().toLowerCase(),
  };
}

export function isReportOwner(identity: AuthIdentity, reportClerkUserId: string | null): boolean {
  return identity.state === "verified" && identity.clerkUserId === reportClerkUserId;
}

export function isAdminIdentity(identity: AuthIdentity, adminEmail: string | undefined): boolean {
  return (
    identity.state === "verified" &&
    Boolean(adminEmail) &&
    identity.email === adminEmail?.trim().toLowerCase()
  );
}
