import assert from "node:assert/strict";
import test from "node:test";

import {
  freeCompanyTabApiResponseSchema,
  freeCompanyTabPaginationQuerySchema,
  freePreviewApiResponseSchema,
} from "./companies.js";

void test("free preview response accepts normalized Companies House account fields", () => {
  const result = freePreviewApiResponseSchema.safeParse({
    data: {
      preview: {
        company: {
          companiesHouseNumber: "12345678",
          companyName: "ACME SUPPLIES LIMITED",
          companyStatus: "active",
          companyType: "ltd",
          incorporationDate: "2018-04-12",
          registeredOfficeAddress: {
            addressLine1: "1 Market Street",
            locality: "Manchester",
            postalCode: "M1 1AA",
          },
          sicCodes: ["46900"],
          accounts: {
            accounting_reference_date: {
              day: 31,
              month: 12,
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
        notYetCheckedSources: [
          {
            source: "registry_trust",
            label: "Registry Trust",
            status: "not_yet_checked",
            message: "Source not yet checked",
          },
        ],
        courtRecordsPrompt: {
          label: "COURT RECORDS - NOT YET CHECKED",
          heading: "Court records not yet checked",
          body: "Unlock a paid report to check court records.",
          questionLine: "Any CCJs?",
          button: "Unlock report",
          smallText: "Paid report only",
        },
        curiosityCards: [],
        tierCards: [
          {
            tier: "single_report",
            name: "Single Report",
            price: "GBP 20",
            pricePence: 2000,
            creditQuantity: 1,
            includesPdf: false,
            includedItems: ["Full report"],
            cta: "Buy 1 Report",
          },
        ],
        sourceStatuses: [
          {
            provider: "companies_house",
            status: "success",
            checkedAt: "2026-07-10T10:00:00.000Z",
          },
        ],
      },
    },
  });

  assert.equal(result.success, true);
});

void test("free preview response coerces live Companies House account reference strings", () => {
  const result = freePreviewApiResponseSchema.safeParse({
    data: {
      preview: {
        company: {
          companiesHouseNumber: "12345678",
          companyName: "ACME SUPPLIES LIMITED",
          companyStatus: "active",
          registeredOfficeAddress: {},
          sicCodes: [],
          accounts: {
            accounting_reference_date: {
              day: "31",
              month: "12",
            },
            last_accounts: {
              type: "micro-entity",
            },
            next_accounts: {},
          },
        },
        notYetCheckedSources: [],
        courtRecordsPrompt: {
          label: "COURT RECORDS - NOT YET CHECKED",
          heading: "Court records not yet checked",
          body: "Unlock a paid report to check court records.",
          questionLine: "Any CCJs?",
          button: "Unlock report",
          smallText: "Paid report only",
        },
        curiosityCards: [],
        tierCards: [],
        sourceStatuses: [
          {
            provider: "companies_house",
            status: "success",
            checkedAt: "2026-07-10T10:00:00.000Z",
          },
        ],
      },
    },
  });

  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.data.data.preview.company.accounts?.accounting_reference_date.day, 31);
  assert.equal(result.data.data.preview.company.accounts?.accounting_reference_date.month, 12);
});

void test("free tab response accepts typed Companies House filing payloads with pagination", () => {
  const result = freeCompanyTabApiResponseSchema.safeParse({
    data: {
      tab: {
        tab: "filing-history",
        companyNumber: "12345678",
        source: { provider: "companies_house", checkedAt: "2026-07-10T10:00:00.000Z" },
        pagination: { page: 2, limit: 25, totalResults: 51, totalPages: 3 },
        filings: [
          {
            date: "2026-01-31",
            type: "AA",
            description: "Accounts",
            category: "accounts",
            pages: 12,
            transactionId: "MzAw",
            providerPayload: {
              transaction_id: "MzAw",
              description_values: { made_up_date: "2025-01-31" },
              links: { document_metadata: "/document/abc" },
            },
            descriptionValues: { made_up_date: "2025-01-31" },
          },
        ],
      },
    },
  });

  assert.equal(result.success, true);
  if (!result.success) return;
  assert.deepEqual(
    result.data.data.tab.tab === "filing-history"
      ? result.data.data.tab.filings[0]?.providerPayload?.description_values
      : undefined,
    { made_up_date: "2025-01-31" },
  );
});

void test("free tab response accepts design-visible Companies House tab fields", () => {
  const baseSource = { provider: "companies_house", checkedAt: "2026-07-10T10:00:00.000Z" };

  const charges = freeCompanyTabApiResponseSchema.safeParse({
    data: {
      tab: {
        tab: "charges",
        companyNumber: "12345678",
        source: baseSource,
        pagination: { page: 1, limit: 25, totalResults: 1, totalPages: 1 },
        charges: [
          {
            chargeCode: "1266 2009 0001",
            createdOn: "2021-08-17",
            deliveredOn: "2021-08-23",
            status: "outstanding",
            personsEntitled: ["Swishfund LTD"],
            classification: "A registered charge",
            description: "Fixed and floating charge over company assets.",
          },
        ],
      },
    },
  });

  const officers = freeCompanyTabApiResponseSchema.safeParse({
    data: {
      tab: {
        tab: "officers",
        companyNumber: "12345678",
        source: baseSource,
        activeCount: 1,
        resignedCount: 1,
        pagination: { page: 1, limit: 25, totalResults: 2, totalPages: 1 },
        officers: [
          {
            name: "BROWN, Daniel Tony",
            role: "director",
            appointedOn: "2021-09-15",
            nationality: "British",
            countryOfResidence: "England",
            dateOfBirth: { month: 2, year: 1985 },
            identityVerificationDetails: {
              appointmentVerificationStatementDueOn: "2025-11-18",
            },
          },
        ],
      },
    },
  });

  const insolvency = freeCompanyTabApiResponseSchema.safeParse({
    data: {
      tab: {
        tab: "insolvency",
        companyNumber: "12345678",
        source: baseSource,
        cases: [
          {
            type: "Creditors Voluntary Liquidation",
            status: "active",
            startedOn: "2024-02-26",
            practitioners: [
              {
                name: "Steven Phillip Ross",
                role: "practitioner",
                appointedOn: "2024-02-26",
                ceasedToActOn: "2025-02-01",
                address: { locality: "London", country: "England" },
              },
            ],
            notes: [],
          },
        ],
      },
    },
  });

  assert.equal(charges.success, true);
  assert.equal(officers.success, true);
  assert.equal(insolvency.success, true);
});

void test("free tab pagination bounds page and limit values", () => {
  assert.deepEqual(freeCompanyTabPaginationQuerySchema.parse({}), { page: 1, limit: 25 });
  assert.equal(freeCompanyTabPaginationQuerySchema.safeParse({ page: 0 }).success, false);
  assert.equal(freeCompanyTabPaginationQuerySchema.safeParse({ limit: 51 }).success, false);
});
