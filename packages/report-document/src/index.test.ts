import assert from "node:assert/strict";
import test from "node:test";

import { renderPremiumDocumentHtml } from "./index.js";

void test("renders deterministic identity, source, compliance, and escaped factual content", () => {
  const html = renderPremiumDocumentHtml({
    companyName: "Example & Sons <Limited>",
    companyNumber: "01234567",
    reportReference: "IG-2026-ABCDEF123456",
    generatedAt: "2026-07-03T10:00:00.000Z",
    sources: [{ label: "Companies House", status: "success", detail: "Checked at generation" }],
    sections: [{ title: "Overview", body: "No invented facts" }],
    interpretation: "Interpretation of frozen facts only.",
    disclaimer: "Not legal or financial advice.",
    issueUrl: "https://invoiceguard.co.uk/report-an-issue",
    complianceVersion: "fixture-v1",
  });
  assert.match(html, /premium-pdf-page-one/);
  assert.match(html, /Not legal or financial advice/);
  assert.match(html, /Report an issue:/);
  assert.match(html, /Example &amp; Sons &lt;Limited&gt;/);
  assert.doesNotMatch(html, /<Limited>/);
});
