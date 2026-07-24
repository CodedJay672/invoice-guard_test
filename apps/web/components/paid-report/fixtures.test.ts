import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  getPaidReportFixture,
  paidReportFixtureNames,
  paidReportTiers,
  resolvePaidReportFixtureName,
  resolvePaidReportTier,
} from "./fixtures.js";

void test("resolves valid tier and fixture queries with safe defaults", () => {
  assert.equal(resolvePaidReportTier("premium"), "premium");
  assert.equal(resolvePaidReportTier("enterprise"), "basic");
  assert.equal(resolvePaidReportFixtureName("ai-safety-fallback"), "ai-safety-fallback");
  assert.equal(resolvePaidReportFixtureName("unsafe"), "complete");
});

void test("provides complete and partial fixtures for every paid tier", () => {
  for (const tier of paidReportTiers) {
    const complete = getPaidReportFixture(tier, "complete");
    const partial = getPaidReportFixture(tier, "partial");

    assert.equal(complete.outcome, "complete");
    assert.equal(partial.outcome, "partial");
    assert.equal(partial.interpretation.status, "partial_source");
    assert.ok(complete.sections.length > 0);
    assert.equal(
      partial.sections.some((section) => section.id === "court-records"),
      false,
    );
  }
});

void test("keeps tier sections entitlement-safe", () => {
  const basicIds = getPaidReportFixture("basic", "complete").sections.map(({ id }) => id);
  const standardIds = getPaidReportFixture("standard", "complete").sections.map(({ id }) => id);
  const premiumIds = getPaidReportFixture("premium", "complete").sections.map(({ id }) => id);

  assert.equal(basicIds.includes("registered-charges"), false);
  assert.equal(basicIds.includes("fair-payment-code"), false);
  assert.equal(standardIds.includes("registered-charges"), true);
  assert.equal(standardIds.includes("director-depth"), false);
  assert.equal(premiumIds.includes("director-depth"), true);
  assert.equal(premiumIds.includes("fair-payment-code"), true);
  assert.equal(premiumIds.includes("confidence-indicator"), true);
});

void test("covers every source and AI presentation state", () => {
  const statusFixture = getPaidReportFixture("premium", "source-statuses");
  assert.deepEqual(
    new Set(statusFixture.sources.map(({ status }) => status)),
    new Set(["success", "failed", "unavailable", "stale", "pending", "not_entitled"]),
  );

  const expectedAiStates = new Map([
    ["ai-loading", "loading"],
    ["ai-ready", "ready"],
    ["ai-unavailable", "unavailable"],
    ["ai-partial", "partial_source"],
    ["ai-safety-fallback", "safety_fallback"],
  ] as const);

  for (const [fixtureName, status] of expectedAiStates) {
    assert.equal(getPaidReportFixture("standard", fixtureName).interpretation.status, status);
  }
});

void test("represents Companies House failure as refund-required without facts", () => {
  const fixture = getPaidReportFixture("standard", "foundational-failure");
  assert.equal(fixture.outcome, "refund_required");
  assert.equal(fixture.sections.length, 0);
  assert.equal(fixture.sources[0]?.status, "failed");
  assert.equal(fixture.interpretation.status, "unavailable");
});

void test("uses tier-specific Registry Trust recovery", () => {
  const basic = getPaidReportFixture("basic", "registry-recheck");
  const standard = getPaidReportFixture("standard", "registry-recheck");
  const premium = getPaidReportFixture("premium", "registry-escalation");

  assert.equal(basic.recovery?.kind, "free_recheck");
  assert.equal(standard.recovery?.kind, "free_recheck");
  assert.equal(premium.recovery?.kind, "premium_escalation");
});

void test("declares the complete deterministic fixture matrix", () => {
  assert.deepEqual(paidReportFixtureNames, [
    "complete",
    "partial",
    "foundational-failure",
    "source-statuses",
    "registry-recheck",
    "registry-escalation",
    "ai-loading",
    "ai-ready",
    "ai-unavailable",
    "ai-partial",
    "ai-safety-fallback",
  ]);
});

void test("keeps the preview production-gated and the UI semantic and accessible", () => {
  const page = readFileSync(
    new URL("../../app/(landing)/reports/preview/page.tsx", import.meta.url),
    "utf8",
  );
  const component = readFileSync(new URL("./PaidReportSections.tsx", import.meta.url), "utf8");
  const recovery = readFileSync(new URL("./RecoveryAction.tsx", import.meta.url), "utf8");

  assert.match(page, /config\.environment === "production"/);
  assert.match(page, /notFound\(\)/);
  assert.match(page, /focus-visible:ring-2 focus-visible:ring-focus/);
  assert.match(component, /aria-labelledby="source-status-heading"/);
  assert.match(component, /aria-labelledby="ai-interpretation-heading"/);
  assert.match(component, /aria-live="polite"/);
  assert.match(component, /bg-surface/);
  assert.doesNotMatch(component, /(?:bg|text|border)-(?:red|green|blue|slate|amber|purple)-/);
  assert.doesNotMatch(component, /#[0-9a-fA-F]{3,8}/);
  assert.match(recovery, /Preview only — no request was sent/);
});
