import assert from "node:assert/strict";
import test from "node:test";

import {
  checkoutSelectionSchema,
  checkoutSessionIdSchema,
  createCheckoutSessionSchema,
  verifiedEmailSchema,
  reportTierSchema,
} from "./checkout.js";

void test("checkout selection normalises canonical identity and display context", () => {
  const result = checkoutSelectionSchema.parse({
    companyNumber: "sc123456",
    tier: "standard",
    q: "  Example Company Limited  ",
  });

  assert.deepEqual(result, {
    companyNumber: "SC123456",
    tier: "standard",
    q: "Example Company Limited",
  });
});

void test("checkout selection rejects unknown tiers", () => {
  assert.equal(reportTierSchema.safeParse("enterprise").success, false);
});

void test("verified email validation normalises trusted identity email", () => {
  assert.equal(verifiedEmailSchema.safeParse("not-an-email").success, false);
  assert.equal(verifiedEmailSchema.parse("  Buyer@Example.COM "), "buyer@example.com");
});

void test("checkout creation requires a UUID attempt and normalises boundary input", () => {
  assert.deepEqual(
    createCheckoutSessionSchema.parse({
      companyNumber: "sc123456",
      tier: "basic",
      attemptId: "4f90d0e1-6241-45db-995e-b30c3e45aa93",
    }),
    {
      companyNumber: "SC123456",
      tier: "basic",
      attemptId: "4f90d0e1-6241-45db-995e-b30c3e45aa93",
    },
  );
});

void test("checkout status lookup accepts Stripe session IDs only", () => {
  assert.equal(checkoutSessionIdSchema.safeParse("cs_test_12345678").success, true);
  assert.equal(checkoutSessionIdSchema.safeParse("buyer@example.com").success, false);
});
