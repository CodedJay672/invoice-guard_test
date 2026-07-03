import assert from "node:assert/strict";
import test from "node:test";

import { CodeOwnedReportReadyEmailRenderer } from "./renderer.js";
import type { OwnerReportNotificationRecord } from "./types.js";

void test("report-ready multipart content is safe, minimal, and owner-authorized", () => {
  const email = new CodeOwnedReportReadyEmailRenderer("https://invoiceguard.example").render({
    id: "notification-1",
    reportId: "11111111-1111-4111-8111-111111111111",
    reportReference: "IG-2026-ABCDEF123456",
    clerkUserId: "user_1",
    companyName: "North <script>alert(1)</script> Limited",
    reportTier: "premium",
    reportStatus: "partial",
    status: "queued",
    attemptCount: 0,
    reportData: {
      schemaVersion: "paid-report-v1",
      reportReference: "IG-2026-ABCDEF123456",
      companyNumber: "01234567",
      companyName: "North Limited",
      tier: "premium",
      entitlements: {
        companiesHouse: {
          profile: true,
          addressHistory: true,
          officers: true,
          filingHistory: true,
          charges: true,
          insolvency: true,
        },
        registryTrust: { enabled: true, includeAmounts: true, includeSatisfaction: true },
        londonGazette: true,
        insolvencyDisqualifiedOfficers: true,
        fairPaymentCode: true,
        evidenceCoverage: true,
        relatedCompanies: false,
        aiInterpretation: true,
      },
      generatedAt: "2026-07-03T09:42:00.000Z",
      facts: {
        overview: null,
        charges: null,
        insolvency: null,
        officers: null,
        filing_history: null,
        ccj: null,
        fair_payment_code: null,
      },
      interpretation: null,
      relatedCompanies: { status: "unavailable", reason: "not available" },
      evidenceCoverage: null,
      recovery: null,
    },
  } satisfies OwnerReportNotificationRecord);
  assert.match(email.htmlBody, /North &lt;script&gt;/);
  assert.doesNotMatch(email.htmlBody, /<script>/);
  assert.match(email.textBody, /https:\/\/invoiceguard\.example\/reports\/IG-2026-ABCDEF123456/);
  assert.doesNotMatch(email.textBody, /interpretation|findings|token=/i);
  assert.match(email.textBody, /not an access token/i);
});
