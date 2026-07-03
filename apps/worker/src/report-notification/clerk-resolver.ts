import { createClerkClient } from "@clerk/backend";

import { OwnerEmailResolutionError, type OwnerEmailResolver } from "./types.js";

interface ClerkUsersClient {
  getUser(userId: string): Promise<{
    primaryEmailAddress: { emailAddress: string; verification: { status: string } | null } | null;
  }>;
}

export class ClerkOwnerEmailResolver implements OwnerEmailResolver {
  private readonly users: ClerkUsersClient;

  constructor(secretKey: string, users?: ClerkUsersClient) {
    this.users = users ?? createClerkClient({ secretKey }).users;
  }

  async resolveVerifiedPrimaryEmail(clerkUserId: string): Promise<string> {
    try {
      const user = await this.users.getUser(clerkUserId);
      const primary = user.primaryEmailAddress;
      if (!primary || primary.verification?.status !== "verified") {
        throw new OwnerEmailResolutionError(
          "The report owner has no verified primary email.",
          false,
          "owner_email_unverified",
        );
      }
      return primary.emailAddress;
    } catch (error) {
      if (error instanceof OwnerEmailResolutionError) throw error;
      const status = statusCode(error);
      if (status === 404) {
        throw new OwnerEmailResolutionError(
          "The report owner no longer exists.",
          false,
          "owner_missing",
        );
      }
      throw new OwnerEmailResolutionError("Clerk owner lookup failed.", true, "clerk_unavailable");
    }
  }
}

function statusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const value = (error as Record<string, unknown>)["status"];
  return typeof value === "number" ? value : undefined;
}
