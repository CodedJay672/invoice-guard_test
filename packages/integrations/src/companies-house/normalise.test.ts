import assert from "node:assert/strict";
import test from "node:test";

import { LiveCompaniesHouseClient } from "./live-client.js";
import {
  normaliseCompaniesHouseChargesResponse,
  normaliseCompaniesHouseFilingHistoryResponse,
  normaliseCompaniesHouseInsolvencyResponse,
  normaliseCompaniesHouseOfficersResponse,
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
        premises: "Amelia House",
        care_of: "Example Accountants",
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
      confirmation_statement: {
        last_made_up_to: "2026-05-30",
        next_made_up_to: "2027-05-30",
        next_due: "2027-06-13",
        overdue: false,
      },
    },
    2,
  );

  assert.equal(result.status, "success");
  assert.equal(result.data.accounts?.accounting_reference_date.day, 31);
  assert.equal(result.data.accounts?.accounting_reference_date.month, 12);
  assert.equal(result.data.accounts?.last_accounts.type, "micro-entity");
  assert.equal(result.data.registeredOfficeAddress.premises, "Amelia House");
  assert.equal(result.data.registeredOfficeAddress.careOf, "Example Accountants");
  assert.equal(result.data.confirmationStatement?.nextDue, "2027-06-13");
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

void test("normalises paginated filing history, charges, officers, and insolvency tab data", () => {
  const filings = normaliseCompaniesHouseFilingHistoryResponse(
    "12345678",
    {
      total_count: 2,
      items: [
        {
          transaction_id: "MzAw",
          type: "AA",
          description: "accounts-with-accounts-type-full",
          category: "accounts",
          date: "2026-01-31",
          pages: 12,
          description_values: { accounts_type: "full" },
          subcategory: "incorporation",
          barcode: "X123",
          paper_filed: false,
          annotations: [{ annotation: "Model articles adopted", date: "2019-10-14" }],
          associated_filings: [
            { date: "2019-10-14", description: "statement-of-capital", type: "SH01" },
          ],
          resolutions: [
            {
              description: "model-articles-adopted",
              receive_date: "2019-10-14",
              type: "RESOLUTIONS",
            },
          ],
        },
      ],
    },
    2,
    25,
  );
  const charges = normaliseCompaniesHouseChargesResponse(
    "12345678",
    {
      total_count: 1,
      items: [
        {
          charge_code: "001",
          created_on: "2024-04-01",
          delivered_on: "2024-04-05",
          satisfied_on: "2025-01-01",
          classification: { description: "A registered charge" },
          persons_entitled: [{ name: "Example Bank PLC" }],
          particulars: {
            description: "A fixed and floating charge over the undertaking.",
            type: "brief-description",
            contains_fixed_charge: true,
            contains_floating_charge: true,
            contains_negative_pledge: true,
          },
        },
      ],
    },
    1,
    25,
  );
  assert.equal(filings.status, "success");
  assert.equal(charges.status, "success");
  if (filings.status !== "success" || charges.status !== "success") {
    assert.fail("Expected Companies House filing and charge normalization to succeed.");
  }
  assert.equal(filings.data.filings[0]?.descriptionValues?.accounts_type, "full");
  assert.equal(filings.data.filings[0]?.annotations?.[0]?.annotation, "Model articles adopted");
  assert.equal(filings.data.filings[0]?.associatedFilings?.[0]?.date, "2019-10-14");
  assert.equal(filings.data.filings[0]?.resolutions?.[0]?.receivedOn, "2019-10-14");
  assert.match(JSON.stringify(filings.data.providerPayload), /"barcode":"X123"/);
  assert.equal(charges.data.charges[0]?.particularsType, "brief-description");
  assert.equal(charges.data.charges[0]?.containsNegativePledge, true);
  const officers = normaliseCompaniesHouseOfficersResponse(
    "12345678",
    {
      active_count: 0,
      resigned_count: 1,
      total_results: 1,
      items: [
        {
          name: "A VERY LONG OFFICER NAME WITH MULTIPLE GIVEN NAMES AND SUFFIX",
          officer_role: "director",
          appointed_on: "2020-01-01",
          resigned_on: "2024-01-01",
          occupation: "Engineer",
          date_of_birth: { month: 4, year: 1981 },
          nationality: "British",
          country_of_residence: "England",
          identity_verification_details: {
            appointment_verification_statement_due_on: "2025-11-18",
          },
        },
      ],
    },
    1,
    25,
  );
  const insolvency = normaliseCompaniesHouseInsolvencyResponse("12345678", {
    status: "active",
    cases: [
      {
        type: "administration",
        number: "1",
        dates: [{ type: "administration-started-on", date: "2025-05-01" }],
        practitioners: [
          {
            name: "Jane Practitioner",
            role: "practitioner",
            appointed_on: "2025-05-02",
            ceased_to_act_on: "2026-01-01",
          },
        ],
        notes: ["Case note"],
      },
    ],
  });

  assert.equal(filings.status, "success");
  assert.deepEqual(filings.data.pagination, { page: 2, limit: 25, totalResults: 2, totalPages: 1 });
  assert.equal(filings.data.filings[0]?.pages, 12);
  assert.equal(charges.status, "success");
  assert.equal(charges.data.charges[0]?.status, "satisfied");
  assert.equal(charges.data.charges[0]?.deliveredOn, "2024-04-05");
  assert.equal(charges.data.charges[0]?.chargeCode, "001");
  assert.deepEqual(charges.data.charges[0]?.personsEntitled, ["Example Bank PLC"]);
  assert.equal(officers.status, "success");
  assert.equal(officers.data.activeCount, 0);
  assert.equal(officers.data.resignedCount, 1);
  assert.equal(officers.data.officers[0]?.resignedOn, "2024-01-01");
  assert.deepEqual(officers.data.officers[0]?.dateOfBirth, { month: 4, year: 1981 });
  assert.equal(officers.data.officers[0]?.nationality, "British");
  assert.equal(
    officers.data.officers[0]?.identityVerificationDetails?.appointmentVerificationStatementDueOn,
    "2025-11-18",
  );
  assert.equal(insolvency.status, "success");
  assert.equal(insolvency.data.cases[0]?.practitioners[0]?.name, "Jane Practitioner");
  assert.equal(insolvency.data.cases[0]?.practitioners[0]?.role, "practitioner");
  assert.equal(insolvency.data.cases[0]?.practitioners[0]?.appointedOn, "2025-05-02");
  assert.equal(insolvency.data.cases[0]?.practitioners[0]?.ceasedToActOn, "2026-01-01");
});
