import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  companyWorkspaceFixtureNames,
  companyWorkspaceTabs,
  getCompanyWorkspaceFixture,
  resolveCompanyWorkspaceFixtureName,
  type CompanyWorkspaceTab,
} from "./fixtures.js";
import {
  formatFilingDescriptionValue,
  resolveFilingDescription,
} from "../../lib/company-display.js";

const freeTabs: CompanyWorkspaceTab[] = [
  "overview",
  "charges",
  "insolvency",
  "officers",
  "filing-history",
];

const paidTabs: CompanyWorkspaceTab[] = ["ccj", "fpc", "ai-summary"];

void test("declares every public company workspace tab", () => {
  assert.deepEqual(
    companyWorkspaceTabs.map((tab) => tab.id),
    ["overview", "ai-summary", "charges", "insolvency", "officers", "filing-history", "ccj", "fpc"],
  );
});

void test("covers populated, empty, loading, and failed states for every free tab", () => {
  assert.deepEqual(companyWorkspaceFixtureNames, ["populated", "empty", "loading", "failed"]);

  for (const tab of freeTabs) {
    const populated = getCompanyWorkspaceFixture(tab, "populated", "development");
    const empty = getCompanyWorkspaceFixture(tab, "empty", "development");
    const loading = getCompanyWorkspaceFixture(tab, "loading", "development");
    const failed = getCompanyWorkspaceFixture(tab, "failed", "development");

    assert.equal(populated.source.label, "Available from Companies House");
    assert.equal(empty.source.label, "Available from Companies House");
    assert.equal(loading.source.detail, "Loading public record data.");
    assert.equal(failed.source.label, "Data could not be retrieved");
    assert.equal(failed.source.status, "failed");
  }
});

void test("provides deterministic records for Companies House-backed fixture tabs", () => {
  assert.ok((getCompanyWorkspaceFixture("overview", "populated", "test").facts ?? []).length > 0);
  assert.ok(
    (getCompanyWorkspaceFixture("filing-history", "populated", "test").filings ?? []).length > 0,
  );
  assert.ok((getCompanyWorkspaceFixture("charges", "populated", "test").charges ?? []).length > 0);
  assert.ok(
    (getCompanyWorkspaceFixture("officers", "populated", "test").officers ?? []).length > 0,
  );
  assert.ok(
    (getCompanyWorkspaceFixture("insolvency", "populated", "test").insolvencyCases ?? []).length >
      0,
  );
});

void test("provides Companies House-style overview sections and confirmation dates", () => {
  const overview = getCompanyWorkspaceFixture("overview", "populated", "test");
  assert.equal(overview.overviewCompany?.registeredOfficeAddress.addressLine1, "10 Market Street");
  assert.equal(overview.overviewCompany?.confirmationStatement?.nextDue, "2027-04-26");
  assert.equal(overview.overviewCompany?.sicDescriptions?.[0], "Non-specialised wholesale trade");
});

void test("composes Companies House filing descriptions from returned description values", () => {
  assert.equal(
    resolveFilingDescription("confirmation-statement-with-no-updates", {
      made_up_date: "2019-05-25",
    }),
    "Confirmation statement made on 25 May 2019 with no updates",
  );
  assert.equal(
    resolveFilingDescription("accounts-with-accounts-type-micro-entity", {
      made_up_date: "2018-06-30",
    }),
    "Micro company accounts made up to 30 June 2018",
  );
  assert.equal(formatFilingDescriptionValue("made_up_date", "2019-05-25"), "25 May 2019");
});

void test("surfaces design-visible Companies House fixture fields with paid interpretation locked", () => {
  const charges = getCompanyWorkspaceFixture("charges", "populated", "test");
  assert.equal(charges.charges?.[0]?.personsEntitled, "Swishfund LTD");
  assert.equal(charges.charges?.[0]?.deliveredOn, "2021-08-23");
  assert.equal(charges.charges?.[0]?.chargeCode, "1266 2009 0001");
  assert.ok((charges.charges?.[0]?.tags ?? []).includes("Negative pledge"));
  assert.equal(charges.lockedInterpretation?.title, "InvoiceGuard Interpretation");

  const officers = getCompanyWorkspaceFixture("officers", "populated", "test");
  assert.equal(officers.officers?.[0]?.dateOfBirth, "May 1985");
  assert.equal(officers.officers?.[0]?.nationality, "British");
  assert.equal(officers.officers?.[0]?.identityVerificationDueOn, "2025-11-18");
  assert.equal(officers.lockedInterpretation?.title, "InvoiceGuard Interpretation");

  const insolvency = getCompanyWorkspaceFixture("insolvency", "populated", "test");
  assert.equal(insolvency.insolvencyCases?.[0]?.type, "Creditors Voluntary Liquidation");
  assert.equal(insolvency.insolvencyCases?.[0]?.practitioners?.[0]?.appointedOn, "2024-02-26");
  assert.equal(insolvency.lockedInterpretation?.title, "InvoiceGuard Interpretation");
});

void test("keeps CCJ, Fair Payment Code, and AI Summary as paid placeholders", () => {
  for (const tab of paidTabs) {
    const fixture = getCompanyWorkspaceFixture(tab, "populated", "development");

    assert.ok(fixture.paidPlaceholder);
    assert.match(fixture.paidPlaceholder.body, /paid|purchase/i);
    assert.doesNotMatch(fixture.paidPlaceholder.body, /clean|adverse|bad payer|creditworthy/i);
  }

  const aiSummary = getCompanyWorkspaceFixture("ai-summary", "populated", "development");
  assert.equal(aiSummary.source.status, "paid_placeholder");
  assert.ok((aiSummary.paidPlaceholder?.blurredLines ?? []).length > 0);
  assert.match(aiSummary.paidPlaceholder?.body ?? "", /Companies House overview data only/);
});

void test("guards fixture query states in production", () => {
  assert.equal(resolveCompanyWorkspaceFixtureName("failed", "production"), undefined);
  assert.equal(resolveCompanyWorkspaceFixtureName(["failed"], "development"), undefined);
  assert.equal(resolveCompanyWorkspaceFixtureName("failed", "development"), "failed");

  const productionFallback = getCompanyWorkspaceFixture("charges", undefined, "production");
  assert.equal(productionFallback.charges?.length, 0);
  assert.doesNotMatch(JSON.stringify(productionFallback), /Example Bank PLC/);
});

void test("keeps workspace UI accessible, semantic, and fixture-safe", () => {
  const shell = readFileSync(new URL("./CompanyWorkspace.tsx", import.meta.url), "utf8");
  const mobile = readFileSync(new URL("./MobileTabSelect.tsx", import.meta.url), "utf8");
  const fixtures = readFileSync(new URL("./fixtures.ts", import.meta.url), "utf8");
  const route = readFileSync(
    new URL(
      "../../app/(landing)/company/[houseNumber]/company-workspace-route.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(shell, /aria-current=\{isActive \? "page" : undefined\}/);
  assert.match(shell, /hidden overflow-x-auto md:block/);
  assert.match(mobile, /<select/);
  assert.match(mobile, /focus-visible:ring-2 focus-visible:ring-focus/);
  assert.match(route, /resolveCompanyWorkspaceFixtureName\(query\.fixture, environment\)/);
  assert.match(route, /requestFreeCompanyTab/);
  assert.match(route, /isPaidTab \|\| fixtureName/);
  assert.match(fixtures, /Available from Companies House/);
  assert.match(shell, /No records found in checked sources/);
  assert.match(shell, /Data could not be retrieved/);
  assert.match(fixtures, /Source not yet checked/);
  assert.match(shell, /blur-sm select-none/);
  assert.match(shell, /PendingPanel/);
  assert.doesNotMatch(shell, /(?:bg|text|border)-(?:red|green|blue|slate|amber|purple)-/);
  assert.doesNotMatch(mobile, /(?:bg|text|border)-(?:red|green|blue|slate|amber|purple)-/);
  assert.doesNotMatch(shell, /#[0-9a-fA-F]{3,8}/);
  assert.doesNotMatch(mobile, /#[0-9a-fA-F]{3,8}/);
  assert.doesNotMatch(
    shell,
    /clean check|adverse conclusion|bad payer|creditworthy|low risk|high risk/i,
  );
});
