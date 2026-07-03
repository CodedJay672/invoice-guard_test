import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  getPremiumPdfFixture,
  premiumPdfFixtureNames,
  resolvePremiumPdfFixtureName,
} from "./fixtures.js";

void test("covers the complete 18A Premium document state matrix", () => {
  assert.deepEqual(premiumPdfFixtureNames, [
    "complete",
    "long-content",
    "partial-source",
    "flag-summary",
  ]);
  assert.equal(resolvePremiumPdfFixtureName("unknown"), "complete");

  for (const name of premiumPdfFixtureNames) {
    const fixture = getPremiumPdfFixture(name);
    assert.equal(fixture.report.tier, "premium");
    assert.equal(fixture.report.pdfState, "ready");
    assert.match(fixture.report.issueDisplayUrl, /^https:\/\/invoiceguard\.co\.uk\//);
  }
});

void test("keeps the flag summary disabled except for the explicit non-production fixture", () => {
  assert.deepEqual(getPremiumPdfFixture("complete").flagSummary, { enabled: false });
  assert.deepEqual(getPremiumPdfFixture("partial-source").flagSummary, { enabled: false });
  const enabled = getPremiumPdfFixture("flag-summary").flagSummary;
  assert.equal(enabled.enabled, true);
  if (enabled.enabled) assert.match(enabled.paragraphs.join(" "), /non-production fixture/i);

  const appConfig = readFileSync(
    new URL("../../../../packages/config/src/app.ts", import.meta.url),
    "utf8",
  );
  assert.match(
    appConfig,
    /enableFlagSummary: readBooleanFlag\(parsed\.ENABLE_FLAG_SUMMARY, false\)/,
  );
});

void test("provides long and partial fixtures without changing the report entitlement", () => {
  const long = getPremiumPdfFixture("long-content");
  const partial = getPremiumPdfFixture("partial-source");
  assert.ok(long.appendix.length >= 8);
  assert.equal(partial.report.outcome, "partial");
  assert.ok(partial.report.sources.some(({ status }) => status !== "success"));
  assert.ok(partial.report.navigation.some(({ id }) => id === "fair-payment-code"));
});

void test("implements document, compliance, print, and production-guard contracts", () => {
  const document = readFileSync(new URL("./PremiumPdfDocument.tsx", import.meta.url), "utf8");
  const compliance = readFileSync(
    new URL("../report-compliance/ReportCompliance.tsx", import.meta.url),
    "utf8",
  );
  const page = readFileSync(
    new URL("../../app/(landing)/reports/preview/pdf/page.tsx", import.meta.url),
    "utf8",
  );
  const styles = readFileSync(
    new URL("../../../../packages/ui/src/styles/globals.css", import.meta.url),
    "utf8",
  );
  const sharedRenderer = readFileSync(
    new URL("../../../../packages/report-document/src/index.ts", import.meta.url),
    "utf8",
  );

  assert.match(document, /renderPremiumDocumentHtml/);
  assert.match(document, /srcDoc={sharedDocument}/);
  assert.match(sharedRenderer, /premium-pdf-page-one/);
  assert.match(sharedRenderer, /Source status/);
  assert.match(sharedRenderer, /AI interpretation/);
  assert.match(sharedRenderer, /Report an issue:/);
  assert.match(compliance, /Report an issue:/);
  assert.match(styles, /\.premium-pdf-page/);
  assert.match(styles, /break-after: page/);
  assert.match(page, /environment === "production"/);
  assert.match(page, /notFound\(\)/);
  assert.doesNotMatch(
    document + compliance + page + sharedRenderer,
    /(?:bg|text|border)-(?:red|green|blue|slate|amber|purple)-/,
  );
  assert.doesNotMatch(document + compliance + page + sharedRenderer, /#[0-9a-fA-F]{3,8}/);
});
