import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCheckoutHref,
  resolveCheckoutBuyerFixture,
  resolveCheckoutFixtureName,
  resolveCheckoutSelection,
  resolvePaymentStatusFixtureName,
} from "./fixtures.js";

void test("checkout buyer fixtures preserve guest editing and verified account identity", () => {
  assert.deepEqual(resolveCheckoutBuyerFixture(undefined), {
    mode: "guest",
    initialEmail: "",
    emailReadOnly: false,
  });
  assert.deepEqual(resolveCheckoutBuyerFixture("authenticated-ready"), {
    mode: "authenticated",
    initialEmail: "verified.buyer@example.com",
    emailReadOnly: true,
  });
});

void test("checkout fixture controls are disabled in production", () => {
  assert.equal(resolveCheckoutFixtureName("authenticated-ready", "production"), undefined);
  assert.equal(resolvePaymentStatusFixtureName("failed", "production"), undefined);
});

void test("known checkout fixtures resolve outside production", () => {
  assert.equal(
    resolveCheckoutFixtureName("authenticated-ready", "development"),
    "authenticated-ready",
  );
  assert.equal(resolvePaymentStatusFixtureName("failed", "test"), "failed");
});

void test("checkout href preserves canonical selection without personal data", () => {
  const selection = resolveCheckoutSelection({
    companyNumber: "12345678",
    tier: "premium",
    q: "Example Limited",
  });

  assert.ok(selection);
  assert.equal(
    buildCheckoutHref(selection),
    "/checkout?companyNumber=12345678&tier=premium&q=Example+Limited",
  );
});
