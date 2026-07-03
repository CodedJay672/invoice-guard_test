/* eslint-disable @typescript-eslint/require-await */
import assert from "node:assert/strict";
import test from "node:test";

import { ClerkOwnerEmailResolver } from "./clerk-resolver.js";
import { OwnerEmailResolutionError } from "./types.js";

void test("Clerk resolver returns only the verified primary email", async () => {
  const resolver = new ClerkOwnerEmailResolver("secret", {
    async getUser() {
      return {
        primaryEmailAddress: {
          emailAddress: "owner@example.com",
          verification: { status: "verified" },
        },
      };
    },
  });
  assert.equal(await resolver.resolveVerifiedPrimaryEmail("user_1"), "owner@example.com");
});

void test("Clerk resolver distinguishes permanent owner state from transient lookup failure", async () => {
  const unverified = new ClerkOwnerEmailResolver("secret", {
    async getUser() {
      return {
        primaryEmailAddress: {
          emailAddress: "owner@example.com",
          verification: { status: "unverified" },
        },
      };
    },
  });
  await assert.rejects(
    unverified.resolveVerifiedPrimaryEmail("user_1"),
    (error: unknown) => error instanceof OwnerEmailResolutionError && !error.retryable,
  );

  const unavailable = new ClerkOwnerEmailResolver("secret", {
    async getUser() {
      throw new Error("network");
    },
  });
  await assert.rejects(
    unavailable.resolveVerifiedPrimaryEmail("user_1"),
    (error: unknown) => error instanceof OwnerEmailResolutionError && error.retryable,
  );
});
