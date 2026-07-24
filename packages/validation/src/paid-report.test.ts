import assert from "node:assert/strict";
import test from "node:test";

import { entitlementsForTier } from "./paid-report.js";

const productCodes = ["single_report", "starter_pack", "business_pack", "agency_pack"] as const;

void test("approved credit-pack products grant the full report source entitlement", () => {
  for (const productCode of productCodes) {
    const entitlements = entitlementsForTier(productCode);

    assert.equal(entitlements.registryTrust.includeAmounts, true);
    assert.equal(entitlements.registryTrust.includeSatisfaction, true);
    assert.equal(entitlements.companiesHouse.charges, true);
    assert.equal(entitlements.companiesHouse.insolvency, true);
    assert.equal(entitlements.fairPaymentCode, true);
    assert.equal(entitlements.londonGazette, true);
    assert.equal(entitlements.insolvencyDisqualifiedOfficers, true);
    assert.equal(entitlements.relatedCompanies, false);
    assert.equal(entitlements.aiInterpretation, true);
  }
});
