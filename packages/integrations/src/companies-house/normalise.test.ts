import assert from "node:assert/strict";
import test from "node:test";

import { LiveCompaniesHouseClient } from "./live-client.js";
import {
  normaliseCompaniesHouseProfileResponse,
  normaliseCompaniesHouseSearchResponse,
} from "./normalise.js";

void test("normalises valid Companies House search responses", () => {
  const result = normaliseCompaniesHouseSearchResponse({
    items: [
      {
        company_number: "12345678",
        title: "ACME SUPPLIES LIMITED",
        company_status: "active",
        company_type: "ltd",
        date_of_creation: "2018-04-12",
        address: {
          locality: "Manchester",
          region: "Greater Manchester",
          country: "England",
        },
      },
    ],
  });

  assert.equal(result.status, "success");
  assert.equal(result.data.matches[0]?.companiesHouseNumber, "12345678");
  assert.equal(result.data.matches[0]?.companyName, "ACME SUPPLIES LIMITED");
});

void test("normalises alphabetical Companies House search responses", () => {
  const result = normaliseCompaniesHouseSearchResponse({
    items: [
      {
        company_number: "12345678",
        company_name: "ACME SUPPLIES LIMITED",
        company_status: "active",
        company_type: "ltd",
      },
    ],
  });

  assert.equal(result.status, "success");
  assert.equal(result.data.matches[0]?.companyName, "ACME SUPPLIES LIMITED");
});

void test("returns provider failure for malformed Companies House search responses", () => {
  const result = normaliseCompaniesHouseSearchResponse({ items: "not-an-array" });

  assert.equal(result.status, "failed");
  assert.equal(result.errorCode, "integration_invalid_response");
});

void test("returns provider failure when required profile identity fields are missing", () => {
  const result = normaliseCompaniesHouseProfileResponse(
    {
      company_number: "12345678",
      company_status: "active",
    },
    2,
  );

  assert.equal(result.status, "failed");
  assert.equal(result.errorCode, "integration_invalid_response");
});

void test("normalises live Companies House account fields before returning a profile", () => {
  const result = normaliseCompaniesHouseProfileResponse(
    {
      company_number: "12345678",
      company_name: "ACME SUPPLIES LIMITED",
      company_status: "active",
      type: "ltd",
      date_of_creation: "2018-04-12",
      registered_office_address: {
        locality: "Manchester",
        region: "Greater Manchester",
        country: "England",
      },
      accounts: {
        accounting_reference_date: {
          day: "31",
          month: "12",
        },
        last_accounts: {
          made_up_to: "2025-12-31",
          period_end_on: "2025-12-31",
          period_start_on: "2025-01-01",
          type: "micro-entity",
        },
        next_accounts: {
          due_on: "2026-09-30",
          overdue: false,
          period_end_on: "2026-12-31",
          period_start_on: "2026-01-01",
        },
        next_due: "2026-09-30",
        next_made_up_to: "2026-12-31",
        overdue: false,
      },
    },
    2,
  );

  assert.equal(result.status, "success");
  assert.equal(result.data.accounts?.accounting_reference_date.day, 31);
  assert.equal(result.data.accounts?.accounting_reference_date.month, 12);
  assert.equal(result.data.accounts?.last_accounts.type, "micro-entity");
});

void test("maps missing live API key to an auth provider failure", async () => {
  const client = new LiveCompaniesHouseClient({
    mode: "live",
    baseUrl: "https://api.company-information.service.gov.uk",
    apiKey: undefined,
    timeoutMs: 1000,
  });

  const result = await client.searchCompanies({ query: "acme" });

  assert.equal(result.status, "failed");
  assert.equal(result.errorCode, "integration_auth_error");
});
