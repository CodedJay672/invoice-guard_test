import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCompanyHref,
  buildPurchaseCheckoutHref,
  buildSearchPurchaseHref,
  resolvePurchaseTier,
} from "./purchase-intent.js";

void test("validates public purchase tiers and discards invalid input", () => {
  assert.equal(resolvePurchaseTier("business_pack"), "business_pack");
  assert.equal(resolvePurchaseTier("premium"), undefined);
  assert.equal(resolvePurchaseTier(["single_report"]), undefined);
});

void test("builds canonical search, company review, and checkout links", () => {
  assert.equal(buildSearchPurchaseHref("starter_pack"), "/search?tier=starter_pack");
  assert.equal(
    buildCompanyHref("01234567", "overview", "agency_pack"),
    "/company/01234567/overview?tier=agency_pack",
  );
  assert.equal(
    buildPurchaseCheckoutHref("01234567", "business_pack"),
    "/checkout?companyNumber=01234567&tier=business_pack",
  );
  assert.equal(
    buildPurchaseCheckoutHref("01234567"),
    "/checkout?companyNumber=01234567&tier=single_report",
  );
});
