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
