import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { resolveClerkIdentity } from "../../lib/auth/identity-classification.js";

void test("recognises an authenticated Clerk user without treating verification as sign-out", () => {
  assert.deepEqual(resolveClerkIdentity("user_pending", undefined), {
    state: "unverified",
    clerkUserId: "user_pending",
  });
});

void test("requires a verified primary email and normalises its address", () => {
  assert.deepEqual(
    resolveClerkIdentity("user_verified", {
      emailAddress: " Buyer@Example.COM ",
      verification: { status: "verified" },
    }),
    {
      state: "verified",
      clerkUserId: "user_verified",
      email: "buyer@example.com",
    },
  );
  assert.deepEqual(
    resolveClerkIdentity("user_unverified", {
      emailAddress: "buyer@example.com",
      verification: { status: "unverified" },
    }),
    { state: "unverified", clerkUserId: "user_unverified" },
  );
});

void test("Clerk server auth keeps pending sessions visible to the identity resolver", () => {
  const source = readFileSync(new URL("../../lib/auth/identity.ts", import.meta.url), "utf8");
  assert.match(source, /auth\(\{ treatPendingAsSignedOut: false \}\)/);
});
