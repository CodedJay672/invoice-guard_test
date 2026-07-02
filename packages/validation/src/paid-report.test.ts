import assert from "node:assert/strict";
import test from "node:test";

import { entitlementsForTier } from "./paid-report.js";

void test("canonical paid entitlements increase only through the approved tier matrix", () => {
  const basic = entitlementsForTier("basic");
  const standard = entitlementsForTier("standard");
  const premium = entitlementsForTier("premium");

  assert.equal(basic.registryTrust.includeAmounts, false);
  assert.equal(standard.registryTrust.includeAmounts, true);
  assert.equal(standard.companiesHouse.charges, true);
  assert.equal(premium.fairPaymentCode, true);
  assert.equal(premium.londonGazette, true);
  assert.equal(premium.relatedCompanies, false);
});
