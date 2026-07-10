import assert from "node:assert/strict";
import test from "node:test";

import {
  createProviderFailure,
  createProviderSuccess,
  MockCompaniesHouseClient,
} from "@workspace/integrations";
import type {
  CompaniesHouseClient,
  CompaniesHouseCompanyNumberInput,
  CompaniesHousePaginatedInput,
  FreeCompanyTabPayload,
} from "@workspace/types";

import { InMemoryCompanyRepository } from "./repository.js";
import type { CompanyTabCache } from "./tab-cache.js";
import { companyTabCacheTtlSeconds, CompanyTabService } from "./tab-service.js";

void test("tab service caches successful normalized pages for 15 minutes with page-isolated keys", async () => {
  const companiesHouseClient = new TabServiceCompaniesHouseClient();
  const cache = new RecordingCompanyTabCache();
  const service = new CompanyTabService({
    companiesHouseClient,
    companyRepository: new InMemoryCompanyRepository(),
    cache,
  });

  const firstPage = await service.getTab("12345678", "filing-history", 1, 25);
  const cachedFirstPage = await service.getTab("12345678", "filing-history", 1, 25);
  const secondPage = await service.getTab("12345678", "filing-history", 2, 25);

  assert.equal(firstPage.tab, "filing-history");
  assert.equal(cachedFirstPage, firstPage);
  assert.equal(secondPage.tab, "filing-history");
  assert.equal(secondPage.pagination.page, 2);
  assert.deepEqual(companiesHouseClient.filingInputs, [
    { companyNumber: "12345678", page: 1, limit: 25 },
    { companyNumber: "12345678", page: 2, limit: 25 },
  ]);
  assert.deepEqual(
    cache.sets.map((entry) => ({ key: entry.key, ttlSeconds: entry.ttlSeconds })),
    [
      {
        key: "invoiceguard:company-tab:12345678:filing-history:1:25",
        ttlSeconds: companyTabCacheTtlSeconds,
      },
      {
        key: "invoiceguard:company-tab:12345678:filing-history:2:25",
        ttlSeconds: companyTabCacheTtlSeconds,
      },
    ],
  );
});

void test("tab service does not cache Companies House failures", async () => {
  const companiesHouseClient = new TabServiceCompaniesHouseClient();
  companiesHouseClient.failFilings = true;
  const cache = new RecordingCompanyTabCache();
  const service = new CompanyTabService({
    companiesHouseClient,
    companyRepository: new InMemoryCompanyRepository(),
    cache,
  });

  await assert.rejects(() => service.getTab("12345678", "filing-history", 1, 25));

  assert.equal(cache.sets.length, 0);
  assert.equal(companiesHouseClient.filingInputs.length, 1);
});

class RecordingCompanyTabCache implements CompanyTabCache {
  readonly values = new Map<string, FreeCompanyTabPayload>();
  readonly sets: Array<{ key: string; ttlSeconds: number }> = [];

  get(key: string): Promise<FreeCompanyTabPayload | undefined> {
    return Promise.resolve(this.values.get(key));
  }

  set(key: string, value: FreeCompanyTabPayload, ttlSeconds: number): Promise<void> {
    this.values.set(key, value);
    this.sets.push({ key, ttlSeconds });

    return Promise.resolve();
  }
}

class TabServiceCompaniesHouseClient extends MockCompaniesHouseClient {
  readonly filingInputs: CompaniesHousePaginatedInput[] = [];
  failFilings = false;

  override getCompanyProfile(
    input: CompaniesHouseCompanyNumberInput,
  ): ReturnType<CompaniesHouseClient["getCompanyProfile"]> {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: input.companyNumber,
        companyName: "ACME SUPPLIES LIMITED",
        companyStatus: "active",
        companyType: "ltd",
        incorporationDate: "2018-04-12",
        accounts: undefined,
        cessationDate: "",
        has_been_liquidated: false,
        has_charges: false,
        has_insolvency_history: false,
        registeredOfficeAddress: {
          addressLine_1: "",
          addressLine_2: "",
          poBox: "",
          postalCode: "",
          locality: "Manchester",
          region: "Greater Manchester",
          country: "England",
        },
        sicCodes: ["46900"],
        activeDirectorCount: 2,
      }),
    );
  }

  override getFilingHistory(
    input: CompaniesHousePaginatedInput,
  ): ReturnType<CompaniesHouseClient["getFilingHistory"]> {
    this.filingInputs.push(input);
    if (this.failFilings) {
      return Promise.resolve(
        createProviderFailure(this.provider, {
          code: "integration_provider_error",
          message: "Companies House unavailable",
          retryable: true,
          statusCode: 503,
        }),
      );
    }

    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: input.companyNumber,
        filings: [],
        pagination: {
          page: input.page ?? 1,
          limit: input.limit ?? 25,
          totalResults: 0,
          totalPages: 0,
        },
      }),
    );
  }

  override getCharges(
    input: CompaniesHousePaginatedInput,
  ): ReturnType<CompaniesHouseClient["getCharges"]> {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: input.companyNumber,
        charges: [],
        pagination: {
          page: input.page ?? 1,
          limit: input.limit ?? 25,
          totalResults: 0,
          totalPages: 0,
        },
      }),
    );
  }

  override getOfficers(
    input: CompaniesHousePaginatedInput,
  ): ReturnType<CompaniesHouseClient["getOfficers"]> {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: input.companyNumber,
        officers: [],
        activeCount: 0,
        resignedCount: 0,
        pagination: {
          page: input.page ?? 1,
          limit: input.limit ?? 25,
          totalResults: 0,
          totalPages: 0,
        },
      }),
    );
  }

  override getInsolvency(
    input: CompaniesHouseCompanyNumberInput,
  ): ReturnType<CompaniesHouseClient["getInsolvency"]> {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: input.companyNumber,
        cases: [],
        status: "none",
      }),
    );
  }
}
