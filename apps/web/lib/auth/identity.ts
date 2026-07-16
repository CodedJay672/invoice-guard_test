import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import { resolveClerkIdentity, type AuthIdentity } from "./identity-classification";

export type { AuthIdentity } from "./identity-classification";

export async function resolveAuthIdentity(): Promise<AuthIdentity> {
  const session = await auth({ treatPendingAsSignedOut: false });
  if (!session.userId) return resolveClerkIdentity(undefined, undefined);

  const user = await currentUser();
  return resolveClerkIdentity(session.userId, user?.primaryEmailAddress);
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
