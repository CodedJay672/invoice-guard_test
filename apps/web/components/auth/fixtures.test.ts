import assert from "node:assert/strict";
import test from "node:test";

import {
  authFixtureNames,
  authHref,
  isAuthPreviewEnabled,
  parseSafeReturnPath,
  resolveAuthFixtureName,
} from "./fixtures";

void test("resolves every auth fixture outside production", () => {
  for (const fixture of authFixtureNames) {
    assert.equal(resolveAuthFixtureName(fixture, "development"), fixture);
    assert.equal(resolveAuthFixtureName(fixture, "test"), fixture);
  }
});

void test("hides fixture and preview behavior in production", () => {
  assert.equal(resolveAuthFixtureName("signed-in", "production"), undefined);
  assert.equal(isAuthPreviewEnabled("production"), false);
  assert.equal(isAuthPreviewEnabled("development"), true);
});

void test("accepts only current Phase A return paths", () => {
  const accepted = [
    "/",
    "/search?q=ACME#results",
    "/checkout?companyNumber=12345678&tier=basic",
    "/checkout/status?sessionId=cs_test",
    "/reports/RPT_123",
  ];
  for (const path of accepted) assert.equal(parseSafeReturnPath(path), path);
});

void test("rejects external, malformed, admin, and future-phase return paths", () => {
  const rejected = [
    "https://example.com",
    "//example.com/path",
    "/\\example.com",
    "/admin",
    "/dashboard",
    "/watchlists",
    "/invoices",
    "/reports",
    "/reports/access/token/extra",
    "/reports/access/token_123",
    "/%2f%2fexample.com",
    "/search\nmalformed",
  ];
  for (const path of rejected) assert.equal(parseSafeReturnPath(path), "/search");
});

void test("builds auth links from normalized return paths", () => {
  assert.equal(
    authHref("/sign-in", "/checkout?tier=basic"),
    "/sign-in?returnTo=%2Fcheckout%3Ftier%3Dbasic",
  );
  assert.equal(authHref("/sign-up", "https://example.com"), "/sign-up?returnTo=%2Fsearch");
  assert.equal(
    authHref("/sign-up", "/checkout?companyNumber=12345678&tier=premium&q=Example+Limited"),
    "/sign-up?returnTo=%2Fcheckout%3FcompanyNumber%3D12345678%26tier%3Dpremium%26q%3DExample%2BLimited",
  );
});
