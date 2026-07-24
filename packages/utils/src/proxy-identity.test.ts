import assert from "node:assert/strict";
import test from "node:test";

import {
  createSignedClientIp,
  createSignedPrincipal,
  normaliseClientIp,
  verifySignedClientIp,
  verifySignedPrincipal,
} from "./proxy-identity.js";

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

void test("verifies a fresh signed Clerk principal and normalises its email", () => {
  const signed = createSignedPrincipal("user_auth_123", " Owner@Example.com ", secret, 1_000);
  assert.deepEqual(verifySignedPrincipal(signed, secret, 1_500), {
    clerkUserId: "user_auth_123",
    verifiedEmail: "owner@example.com",
  });
});

void test("rejects forged, stale, malformed, and incomplete Clerk principals", () => {
  const signed = createSignedPrincipal("user_auth_123", "owner@example.com", secret, 1_000);
  assert.equal(
    verifySignedPrincipal({ ...signed, verifiedEmail: "attacker@example.com" }, secret, 1_500),
    undefined,
  );
  assert.equal(verifySignedPrincipal(signed, secret, 100_000), undefined);
  assert.equal(
    verifySignedPrincipal({ ...signed, clerkUserId: "not-a-clerk-user" }, secret, 1_500),
    undefined,
  );
  assert.equal(verifySignedPrincipal({ ...signed, signature: "" }, secret, 1_500), undefined);
});
