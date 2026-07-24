import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  initialReportLifecycleStatus,
  isTerminalReportLifecycleStatus,
  nextReportLifecycleStatus,
  normaliseReportReference,
  reportLifecycleContent,
  reportLifecycleFixtureNames,
  resolveReportLifecycleFixtureName,
} from "./fixtures.js";

void test("every report lifecycle fixture resolves outside production", () => {
  for (const fixture of reportLifecycleFixtureNames) {
    assert.equal(resolveReportLifecycleFixtureName(fixture, "development"), fixture);
  }
});

void test("report lifecycle fixtures are disabled in production", () => {
  assert.equal(resolveReportLifecycleFixtureName("ready", "production"), undefined);
  assert.equal(resolveReportLifecycleFixtureName("unknown", "test"), undefined);
});

void test("report references are canonical and malformed encodings fail closed", () => {
  assert.equal(normaliseReportReference("ig-2026-a1b2c3d4e5f6"), "IG-2026-A1B2C3D4E5F6");
  assert.equal(normaliseReportReference("IG-26-A1B2C3D4E5F6"), undefined);
  assert.equal(normaliseReportReference("%E0%A4%A"), undefined);
});

void test("the lifecycle matrix provides durable text and action contracts", () => {
  assert.deepEqual(
    Object.keys(reportLifecycleContent).sort(),
    [
      "failed",
      "generating",
      "partial",
      "pending",
      "ready",
      "refund_processing",
      "refund_required",
      "refunded",
      "slow_stuck",
    ].sort(),
  );
  assert.equal(reportLifecycleContent.ready.canOpenReport, true);
  assert.equal(reportLifecycleContent.partial.canOpenReport, true);
  assert.equal(reportLifecycleContent.failed.canOpenReport, false);
  assert.match(reportLifecycleContent.partial.alertBody, /sources completed/);
  assert.match(reportLifecycleContent.slow_stuck.alertBody, /not been marked as failed/);
});

void test("deterministic fixture transitions converge on terminal outcomes", () => {
  let readyStatus = initialReportLifecycleStatus("pending-to-ready");
  readyStatus = nextReportLifecycleStatus("pending-to-ready", readyStatus);
  assert.equal(readyStatus, "generating");
  readyStatus = nextReportLifecycleStatus("pending-to-ready", readyStatus);
  assert.equal(readyStatus, "ready");
  assert.equal(nextReportLifecycleStatus("pending-to-ready", readyStatus), "ready");

  const partialStatus = nextReportLifecycleStatus(
    "generating-to-partial",
    initialReportLifecycleStatus("generating-to-partial"),
  );
  assert.equal(partialStatus, "partial");
});

void test("only delivered and final failure outcomes are terminal in the mock lifecycle", () => {
  assert.equal(isTerminalReportLifecycleStatus("ready"), true);
  assert.equal(isTerminalReportLifecycleStatus("partial"), true);
  assert.equal(isTerminalReportLifecycleStatus("failed"), true);
  assert.equal(isTerminalReportLifecycleStatus("refunded"), true);
  assert.equal(isTerminalReportLifecycleStatus("refund_required"), false);
  assert.equal(isTerminalReportLifecycleStatus("refund_processing"), false);
});

void test("the lifecycle panel preserves responsive and accessible status contracts", () => {
  const source = readFileSync(new URL("./ReportLifecyclePanel.tsx", import.meta.url), "utf8");
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /aria-busy=/);
  assert.match(source, /sm:flex-row/);
  assert.match(source, /text-content-muted/);
  assert.doesNotMatch(source, /(?:text|bg|border)-(?:red|green|blue|amber|slate)-/);
});
