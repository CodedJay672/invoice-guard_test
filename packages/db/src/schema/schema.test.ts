import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  providerUsageLogs,
  purchasedReportStatusEnum,
  snapshotSourceContextEnum,
} from "./index.js";

void test("Phase A report and snapshot enums contain only approved lifecycle values", () => {
  assert.ok(purchasedReportStatusEnum.enumValues.includes("partial"));
  assert.deepEqual(snapshotSourceContextEnum.enumValues, ["free_preview", "paid_report"]);
  assert.equal("reportTier" in providerUsageLogs, true);
  assert.equal("subscriptionTier" in providerUsageLogs, false);
});

void test("context compliance migration guards destructive enum conversion", async () => {
  const migration = await readFile(
    new URL("../../drizzle/0001_context_compliance.sql", import.meta.url),
    "utf8",
  );

  assert.match(migration, /Cannot remove watchlist source context/);
  assert.match(migration, /ADD VALUE IF NOT EXISTS 'partial'/);
  assert.match(migration, /RENAME COLUMN "subscription_tier" TO "report_tier"/);
  assert.match(migration, /799/);
  assert.match(migration, /1499/);
  assert.match(migration, /2700/);
});
