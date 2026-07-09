import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  companyDataSnapshots,
  fairPaymentCodeStatuses,
  providerUsageLogs,
  purchasedReports,
  purchasedReportStatusEnum,
  reportNotifications,
  reportPdfArtifacts,
  reportPdfStatusEnum,
  snapshotSourceContextEnum,
} from "./index.js";

void test("Phase A report and snapshot enums contain only approved lifecycle values", () => {
  assert.ok(purchasedReportStatusEnum.enumValues.includes("partial"));
  assert.deepEqual(snapshotSourceContextEnum.enumValues, ["free_preview", "paid_report"]);
  assert.equal("reportTier" in providerUsageLogs, true);
  assert.equal("subscriptionTier" in providerUsageLogs, false);
});

void test("18B migration creates one durable PDF artifact per report", async () => {
  assert.deepEqual(reportPdfStatusEnum.enumValues, ["queued", "generating", "ready", "failed"]);
  assert.equal("objectKey" in reportPdfArtifacts, true);
  assert.equal("sha256" in reportPdfArtifacts, true);
  assert.equal("complianceVersion" in reportPdfArtifacts, true);
  const migration = await readFile(
    new URL("../../drizzle/0006_fresh_naoko.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /report_pdf_artifacts/);
  assert.match(migration, /ON DELETE cascade/);
  assert.match(migration, /object_key_unique/);
});

void test("17B migration persists one owner-ready notification per report", async () => {
  assert.equal("postmarkMessageId" in reportNotifications, true);
  assert.equal("failureKind" in reportNotifications, true);
  const migration = await readFile(
    new URL("../../drizzle/0005_glorious_old_lace.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /report_notification_status/);
  assert.match(migration, /report_notifications_report_type_unique/);
  assert.match(migration, /FOREIGN KEY \("report_id"\)/);
});

void test("purchased reports freeze the Stripe-confirmed financial values", async () => {
  assert.equal("amountPaidPence" in purchasedReports, true);
  assert.equal("currency" in purchasedReports, true);

  const migration = await readFile(
    new URL("../../drizzle/0002_confused_sphinx.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /UPDATE "purchased_reports"/);
  assert.match(migration, /ALTER COLUMN "amount_paid_pence" SET NOT NULL/);
});

void test("context compliance migration guards destructive enum conversion", async () => {
  const migration = await readFile(
    new URL("../../drizzle/0001_context_compliance.sql", import.meta.url),
    "utf8",
  );

  assert.match(migration, /Cannot remove watchlist source context/);
  assert.match(migration, /ADD VALUE IF NOT EXISTS 'partial'/);
  assert.match(migration, /RENAME COLUMN "subscription_tier" TO "report_tier"/);
  assert.match(migration, /single_report/);
  assert.match(migration, /starter_pack/);
  assert.match(migration, /business_pack/);
  assert.match(migration, /agency_pack/);
  assert.match(migration, /2000/);
  assert.match(migration, /5400/);
  assert.match(migration, /8000/);
  assert.match(migration, /14000/);
});

void test("AUTH-C migration refuses ownerless reports before retiring guest columns", async () => {
  const migration = await readFile(
    new URL("../../drizzle/0003_wandering_punisher.sql", import.meta.url),
    "utf8",
  );

  assert.match(migration, /WHERE "clerk_user_id" IS NULL/);
  assert.match(migration, /AUTH-C migration blocked/);
  assert.match(migration, /ALTER COLUMN "clerk_user_id" SET NOT NULL/);
  assert.match(migration, /DROP COLUMN "guest_email"/);
  assert.equal("guestEmail" in purchasedReports, false);
  assert.equal("guestAccessTokenHash" in purchasedReports, false);
});

void test("15B migration freezes entitlements and links immutable paid snapshots", async () => {
  assert.equal("entitlements" in purchasedReports, true);
  assert.equal("reportId" in companyDataSnapshots, true);
  assert.equal("operation" in companyDataSnapshots, true);
  assert.equal("attempt" in companyDataSnapshots, true);
  assert.equal("companiesHouseNumber" in fairPaymentCodeStatuses, true);

  const migration = await readFile(
    new URL("../../drizzle/0004_daily_zombie.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /UPDATE "purchased_reports"/);
  assert.match(migration, /ALTER COLUMN "entitlements" SET NOT NULL/);
  assert.match(migration, /jsonb_set/);
  assert.match(migration, /fair_payment_code_statuses/);
});
