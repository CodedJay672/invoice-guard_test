import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { paidReportTiers } from "../paid-report/fixtures.js";
import {
  browserReportFixtureNames,
  getBrowserReportFixture,
  pdfFixtureStates,
  resolveBrowserReportFixtureName,
  resolvePdfFixtureState,
} from "./fixtures.js";

void test("builds complete and partial browser reports for every tier", () => {
  for (const tier of paidReportTiers) {
    const complete = getBrowserReportFixture(tier, "complete", "available");
    const partial = getBrowserReportFixture(tier, "partial", "available");
    assert.equal(complete.outcome, "complete");
    assert.equal(partial.outcome, "partial");
    assert.ok(complete.navigation.some(({ id }) => id === "overview"));
    assert.ok(complete.navigation.some(({ id }) => id === "interpretation"));
  }
});

void test("keeps report navigation within tier entitlements", () => {
  const basic = getBrowserReportFixture("basic", "complete", "available");
  const standard = getBrowserReportFixture("standard", "complete", "available");
  const premium = getBrowserReportFixture("premium", "complete", "available");

  assert.equal(
    basic.navigation.some(({ id }) => id === "charges"),
    false,
  );
  assert.equal(
    basic.navigation.some(({ id }) => id === "fair-payment-code"),
    false,
  );
  assert.equal(
    standard.navigation.some(({ id }) => id === "charges"),
    true,
  );
  assert.equal(
    standard.navigation.some(({ id }) => id === "fair-payment-code"),
    false,
  );
  assert.equal(
    premium.navigation.some(({ id }) => id === "fair-payment-code"),
    true,
  );
});

void test("limits PDF states to Premium reports", () => {
  for (const state of pdfFixtureStates) {
    assert.equal(getBrowserReportFixture("premium", "complete", state).pdfState, state);
  }
  assert.equal(getBrowserReportFixture("basic", "complete", "ready").pdfState, undefined);
  assert.equal(getBrowserReportFixture("standard", "complete", "failed").pdfState, undefined);
});

void test("covers access, readiness, provider failure, and not-found fixture decisions", () => {
  assert.deepEqual(browserReportFixtureNames, [
    "complete",
    "partial",
    "provider-failure",
    "access-denied",
    "not-ready",
    "not-found",
  ]);
  assert.equal(
    getBrowserReportFixture("basic", "access-denied", "available").viewState,
    "access_denied",
  );
  assert.equal(getBrowserReportFixture("basic", "not-ready", "available").viewState, "not_ready");
  assert.equal(
    getBrowserReportFixture("premium", "provider-failure", "available").outcome,
    "partial",
  );
  assert.equal(resolveBrowserReportFixtureName("unknown"), "complete");
  assert.equal(resolvePdfFixtureState("unknown"), "available");
});

void test("provides provisional compliance and issue-reporting content", () => {
  const report = getBrowserReportFixture("premium", "complete", "available");
  assert.match(report.disclaimer, /not legal or financial advice/);
  assert.match(report.disclaimer, /not.*credit decision/);
  assert.match(report.issueHref, /^mailto:hello@invoiceguard\.co\.uk/);
  assert.match(report.issueHref, /IG-2026-000000000184/);
});

void test("implements accessible screen, mobile, print, and secure delivery contracts", () => {
  const component = readFileSync(new URL("./BrowserReport.tsx", import.meta.url), "utf8");
  const page = readFileSync(
    new URL("../../app/(landing)/reports/[reportReference]/page.tsx", import.meta.url),
    "utf8",
  );
  const styles = readFileSync(
    new URL("../../../../packages/ui/src/styles/globals.css", import.meta.url),
    "utf8",
  );
  const dataAccess = readFileSync(
    new URL("../../lib/data/report-delivery.ts", import.meta.url),
    "utf8",
  );

  assert.match(component, /role="tablist"/);
  assert.match(component, /role="tab"/);
  assert.match(component, /aria-selected=/);
  assert.match(component, /<select/);
  assert.match(component, /aria-live="polite"/);
  assert.match(component, /ReportNotificationStatus/);
  assert.match(component, /print:hidden/);
  assert.match(component, /print:block/);
  assert.match(styles, /\.report-panel\[hidden\]/);
  assert.match(page, /resolveAuthIdentity\(\)/);
  assert.match(page, /redirect\(authHref/);
  assert.match(page, /loadOwnedReport/);
  assert.match(page, /config\.environment !== "production"/);
  assert.match(page, /notFound\(\)/);
  assert.match(dataAccess, /cache: "no-store"/);
  assert.match(dataAccess, /addTrustedPrincipalHeaders/);
  assert.match(dataAccess, /reportDeliveryResponseSchema\.safeParse/);
  assert.doesNotMatch(component, /(?:bg|text|border)-(?:red|green|blue|slate|amber|purple)-/);
  assert.doesNotMatch(component, /#[0-9a-fA-F]{3,8}/);
});
