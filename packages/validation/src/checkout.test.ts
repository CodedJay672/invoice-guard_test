import assert from "node:assert/strict";
import test from "node:test";

import { checkoutSelectionSchema, guestEmailSchema, reportTierSchema } from "./checkout.js";

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

void test("guest email is required, valid, and normalised", () => {
  assert.equal(guestEmailSchema.safeParse("not-an-email").success, false);
  assert.equal(guestEmailSchema.parse("  Buyer@Example.COM "), "buyer@example.com");
});
