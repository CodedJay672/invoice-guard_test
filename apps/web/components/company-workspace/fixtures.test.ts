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

const freeTabs: CompanyWorkspaceTab[] = [
  "overview",
  "filing-history",
  "charges",
  "officers",
  "insolvency",
];

const paidTabs: CompanyWorkspaceTab[] = ["ccj", "fpc", "ai-summary"];

void test("declares every public company workspace tab", () => {
  assert.deepEqual(
    companyWorkspaceTabs.map((tab) => tab.id),
    ["overview", "filing-history", "charges", "officers", "insolvency", "ccj", "fpc", "ai-summary"],
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

  const productionFixture = getCompanyWorkspaceFixture("charges", "populated", "production");
  assert.equal(productionFixture.charges?.length, 0);
  assert.equal(productionFixture.pendingPlaceholder?.title, "Companies House tab data pending");
  assert.doesNotMatch(JSON.stringify(productionFixture), /Example Bank PLC/);
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
