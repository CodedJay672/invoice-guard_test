import assert from "node:assert/strict";
import test from "node:test";

import { createSignedClientIp, normaliseClientIp, verifySignedClientIp } from "./proxy-identity.js";

const secret = "invoiceguard-test-proxy-secret-1234567890";

void test("normalises the first valid address from a trusted forwarding header", () => {
  assert.equal(normaliseClientIp("203.0.113.10, 10.0.0.1"), "203.0.113.10");
  assert.equal(normaliseClientIp("not-an-ip"), undefined);
});

void test("verifies a fresh signed client IP", () => {
  const signed = createSignedClientIp("203.0.113.10", secret, 1_000);

  assert.equal(verifySignedClientIp(signed, secret, 1_500), "203.0.113.10");
});

void test("rejects forged and expired client IP signatures", () => {
  const signed = createSignedClientIp("203.0.113.10", secret, 1_000);

  assert.equal(
    verifySignedClientIp({ ...signed, clientIp: "203.0.113.11" }, secret, 1_500),
    undefined,
  );
  assert.equal(verifySignedClientIp(signed, secret, 100_000), undefined);
});
