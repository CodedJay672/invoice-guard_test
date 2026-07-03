import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { paidReportTiers } from "../paid-report/fixtures.js";
import { getBrowserReportFixture } from "../browser-report/fixtures.js";
import {
  getReportNotificationFixture,
  getReportReadyEmailFixture,
  reportNotificationStates,
  resolveReportNotificationState,
} from "./fixtures.js";

void test("covers every report notification outcome on complete and partial reports", () => {
  for (const tier of paidReportTiers) {
    for (const outcome of ["complete", "partial"] as const) {
      const report = getBrowserReportFixture(tier, outcome, "available");
      for (const state of reportNotificationStates) {
        const notification = getReportNotificationFixture(state);
        assert.equal(notification.state, state);
        assert.equal(report.outcome, outcome);
        assert.ok(report.navigation.length > 0);
      }
    }
  }
});

void test("resolves unknown notification fixture states safely", () => {
  assert.equal(resolveReportNotificationState("sending"), "sending");
  assert.equal(resolveReportNotificationState("unknown"), "sent");
  assert.deepEqual(reportNotificationStates, ["sending", "sent", "delayed", "failed"]);
});

void test("builds an owner-safe email link without credentials or report findings", () => {
  const email = getReportReadyEmailFixture();
  assert.equal(email.reportHref, `/reports/${email.reportReference}`);
  assert.doesNotMatch(email.reportHref, /\?/);
  assert.doesNotMatch(email.reportHref, /token|email|owner|user/i);
  assert.deepEqual(Object.keys(email).sort(), [
    "companyName",
    "generatedAt",
    "reportHref",
    "reportReference",
    "supportHref",
    "tierLabel",
  ]);
});

void test("keeps notification outcomes accessible and independent from report delivery", () => {
  const status = readFileSync(new URL("./ReportNotificationStatus.tsx", import.meta.url), "utf8");
  const email = readFileSync(new URL("./ReportReadyEmail.tsx", import.meta.url), "utf8");
  const previewPage = readFileSync(
    new URL("../../app/(landing)/reports/preview/email/page.tsx", import.meta.url),
    "utf8",
  );
  const reportPage = readFileSync(
    new URL("../../app/(landing)/reports/[reportReference]/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(status, /aria-live="polite"/);
  assert.match(status, /report remains available here/i);
  assert.match(status, /no need to purchase it again/i);
  assert.doesNotMatch(status, /regenerate|purchase again/i);
  assert.match(email, /sm:p-8/);
  assert.match(email, /sm:grid-cols-2/);
  assert.match(email, /not an access\s+token/i);
  assert.match(email, /cannot bypass ownership checks/i);
  assert.match(previewPage, /config\.environment === "production"/);
  assert.match(previewPage, /notFound\(\)/);
  assert.match(reportPage, /redirect\(authHref/);
  assert.match(reportPage, /loadOwnedReport/);
  assert.match(reportPage, /notification=/);
  assert.doesNotMatch(status + email, /(?:bg|text|border)-(?:red|green|blue|slate|amber|purple)-/);
  assert.doesNotMatch(status + email, /#[0-9a-fA-F]{3,8}/);
});
