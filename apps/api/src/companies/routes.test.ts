import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";

import {
  createProviderSuccess,
  MockCompaniesHouseClient,
  type ProviderMode,
  type ProviderResult,
} from "@workspace/integrations";
import { createSignedClientIp, proxyIdentityHeaders } from "@workspace/utils";
import express from "express";

import { createApiApp } from "../app.js";
import { createRequestIdentityResolver } from "../request-context.js";
import { InMemoryReportProductRepository } from "../report-products/repository.js";

import {
  InMemoryAnonymousSearchRateLimiter,
  RedisAnonymousSearchRateLimiter,
  type RedisRateLimitClient,
} from "./rate-limit.js";
import { InMemoryCompanyRepository, InMemorySearchLogRepository } from "./repository.js";
import { registerCompanyRoutes } from "./routes.js";
import { CompanyService } from "./service.js";
import {
  CompaniesHouseAddressHistory,
  CompaniesHouseClient,
  CompaniesHouseCompanyNumberInput,
  CompaniesHouseCompanyProfile,
  CompaniesHouseInsolvencyFoundation,
  CompaniesHouseOfficers,
  CompaniesHousePaginatedInput,
  CompaniesHouseRegisteredOfficeAddress,
  CompaniesHouseSearchInput,
  CompaniesHouseSearchResult,
} from "@workspace/types";
import { InMemoryCompanyTabCache } from "./tab-cache.js";
import { CompanyTabService } from "./tab-service.js";

const testHashSecret = "invoiceguard-test-search-hash-secret-123456";
const testProxySecret = "invoiceguard-test-proxy-shared-secret-123456";
const openServers = new Set<Server>();

test.afterEach(async () => {
  await Promise.all(Array.from(openServers, closeServer));
});

function createTestIdentityResolver(
  webApiSharedSecret?: string,
): ReturnType<typeof createRequestIdentityResolver> {
  return createRequestIdentityResolver({
    webApiSharedSecret,
    searchIpHashSecret: testHashSecret,
  });
}

void test("GET /companies/search returns normalized company matches", async () => {
  const { baseUrl, close } = await startTestServer();

  const response = await fetch(`${baseUrl}/companies/search?q=acme`);
  const body = (await response.json()) as {
    data: {
      matches: Array<{
        companiesHouseNumber: string;
        companyName: string;
      }>;
    };
  };

  assert.equal(response.status, 200);
  assert.equal(body.data.matches[0]?.companiesHouseNumber, "12345678");
  assert.equal(body.data.matches[0]?.companyName, "ACME SUPPLIES LIMITED");

  await close();
});

void test("GET /companies/:companyNumber returns canonical company profile data", async () => {
  const { baseUrl, close } = await startTestServer();

  const response = await fetch(`${baseUrl}/companies/12345678`);
  const body = (await response.json()) as {
    data: {
      company: {
        companiesHouseNumber: string;
        companyName: string;
        activeDirectorCount: number;
      };
    };
  };

  assert.equal(response.status, 200);
  assert.equal(body.data.company.companiesHouseNumber, "12345678");
  assert.equal(body.data.company.companyName, "ACME SUPPLIES LIMITED");
  assert.equal(body.data.company.activeDirectorCount, 2);

  await close();
});

void test("GET /companies/:companyNumber/free-preview returns Companies House-only data", async () => {
  const { baseUrl, close } = await startTestServer();

  const response = await fetch(`${baseUrl}/companies/12345678/free-preview`);
  const body = (await response.json()) as {
    data: {
      preview: {
        sourceStatuses: Array<{ provider: string; status: string; checkedAt: string }>;
        notYetCheckedSources: Array<{ source: string; status: string }>;
        courtRecordsPrompt: { label: string };
        tierCards: unknown[];
        company: { companiesHouseNumber: string; activeDirectorCount: number };
      };
    };
  };

  assert.equal(response.status, 200);
  assert.equal(body.data.preview.company.companiesHouseNumber, "12345678");
  assert.equal(body.data.preview.sourceStatuses.length, 1);
  assert.equal(body.data.preview.sourceStatuses[0]?.provider, "companies_house");
  assert.equal(body.data.preview.sourceStatuses[0]?.status, "success");
  assert.equal(
    Number.isNaN(Date.parse(body.data.preview.sourceStatuses[0]?.checkedAt ?? "")),
    false,
  );
  assert.deepEqual(
    body.data.preview.notYetCheckedSources.map((source) => source.source),
    [
      "london_gazette",
      "insolvency_disqualified_officers",
      "registry_trust",
      "fair_payment_code",
      "ai_interpretation",
    ],
  );
  assert.equal(body.data.preview.courtRecordsPrompt.label, "COURT RECORDS — NOT YET CHECKED");
  assert.equal(body.data.preview.tierCards.length, 4);

  await close();
});

void test("GET /companies/:companyNumber/free-preview validates company number", async () => {
  const { baseUrl, close } = await startTestServer();

  const response = await fetch(`${baseUrl}/companies/not-valid-number/free-preview`);
  const body = (await response.json()) as { error: { code: string } };

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "invalid_companies_house_number");

  await close();
});

void test("free preview calls only Companies House", async () => {
  const companiesHouseClient = new CountingCompaniesHouseClient();
  const companyService = new CompanyService({
    companiesHouseClient,
    companyRepository: new InMemoryCompanyRepository(),
    searchLogRepository: new InMemorySearchLogRepository(),
    reportProductRepository: new InMemoryReportProductRepository(),
  });
  const app = createApiApp({
    companyService,
    anonymousSearchRateLimiter: new InMemoryAnonymousSearchRateLimiter(),
    requestIdentityResolver: createTestIdentityResolver(),
  });
  const { baseUrl, close } = await listen(app);

  const response = await fetch(`${baseUrl}/companies/12345678/free-preview`);

  assert.equal(response.status, 200);
  assert.equal(companiesHouseClient.profileCalls, 1);

  await close();
});

void test("GET /companies/search validates query input", async () => {
  const { baseUrl, close } = await startTestServer();

  const response = await fetch(`${baseUrl}/companies/search?q=a`);
  const body = (await response.json()) as { error: { code: string } };

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "invalid_company_search_query");

  await close();
});

void test("GET /companies/search blocks the 6th anonymous search in a 24 hour window", async () => {
  const { baseUrl, close } = await startTestServer(
    new InMemorySearchLogRepository(),
    new InMemoryAnonymousSearchRateLimiter(5),
  );

  for (let searchNumber = 1; searchNumber <= 5; searchNumber += 1) {
    const response = await fetch(`${baseUrl}/companies/search?q=acme`);

    assert.equal(response.status, 200);
  }

  const blockedResponse = await fetch(`${baseUrl}/companies/search?q=acme`);
  const body = (await blockedResponse.json()) as { error: { code: string } };

  assert.equal(blockedResponse.status, 429);
  assert.equal(body.error.code, "anonymous_search_rate_limited");

  await close();
});

void test("Redis rate limiting performs increment and expiry in one atomic operation", async () => {
  const redis = new FakeRedisRateLimitClient();
  const limiter = new RedisAnonymousSearchRateLimiter(redis, 5, 86_400);

  const result = await limiter.check("hashed-ip");

  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 4);
  assert.equal(redis.calls.length, 1);
  assert.match(redis.calls[0]?.script ?? "", /INCR/);
  assert.match(redis.calls[0]?.script ?? "", /EXPIRE/);
});

void test("GET /companies/search bypasses anonymous rate limits for trusted auth context", async () => {
  const searchLogRepository = new InMemorySearchLogRepository();
  const companyService = new CompanyService({
    companiesHouseClient: new MockCompaniesHouseClient(),
    companyRepository: new InMemoryCompanyRepository(),
    searchLogRepository,
    reportProductRepository: new InMemoryReportProductRepository(),
  });
  const app = express();

  app.use(express.json());
  app.use((request, _response, next) => {
    request.clerkUserId = "clerk_user_123";
    next();
  });
  registerCompanyRoutes(app, {
    companyService,
    anonymousSearchRateLimiter: new InMemoryAnonymousSearchRateLimiter(1),
    requestIdentityResolver: createTestIdentityResolver(),
  });

  const { baseUrl, close } = await listen(app);

  const firstResponse = await fetch(`${baseUrl}/companies/search?q=acme`);
  const secondResponse = await fetch(`${baseUrl}/companies/search?q=acme`);

  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 200);
  assert.equal(searchLogRepository.entries[0]?.clerkUserId, "clerk_user_123");

  await close();
});

void test("forged forwarding headers cannot bypass anonymous rate limits", async () => {
  const companyService = new CompanyService({
    companiesHouseClient: new MockCompaniesHouseClient(),
    companyRepository: new InMemoryCompanyRepository(),
    searchLogRepository: new InMemorySearchLogRepository(),
    reportProductRepository: new InMemoryReportProductRepository(),
  });
  const app = createApiApp({
    companyService,
    anonymousSearchRateLimiter: new InMemoryAnonymousSearchRateLimiter(1),
    requestIdentityResolver: createTestIdentityResolver(testProxySecret),
  });
  const { baseUrl, close } = await listen(app);

  const firstResponse = await fetch(`${baseUrl}/companies/search?q=acme`, {
    headers: { "x-forwarded-for": "203.0.113.10" },
  });
  const secondResponse = await fetch(`${baseUrl}/companies/search?q=acme`, {
    headers: { "x-forwarded-for": "203.0.113.11" },
  });

  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 429);

  await close();
});

void test("valid signed proxy identities receive independent anonymous limits", async () => {
  const companyService = new CompanyService({
    companiesHouseClient: new MockCompaniesHouseClient(),
    companyRepository: new InMemoryCompanyRepository(),
    searchLogRepository: new InMemorySearchLogRepository(),
    reportProductRepository: new InMemoryReportProductRepository(),
  });
  const app = createApiApp({
    companyService,
    anonymousSearchRateLimiter: new InMemoryAnonymousSearchRateLimiter(1),
    requestIdentityResolver: createTestIdentityResolver(testProxySecret),
  });
  const { baseUrl, close } = await listen(app);

  const firstResponse = await fetch(`${baseUrl}/companies/search?q=acme`, {
    headers: toProxyHeaders(createSignedClientIp("203.0.113.10", testProxySecret)),
  });
  const secondResponse = await fetch(`${baseUrl}/companies/search?q=acme`, {
    headers: toProxyHeaders(createSignedClientIp("203.0.113.11", testProxySecret)),
  });

  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 200);

  await close();
});

void test("free preview selections store a hashed IP and selected company number", async () => {
  const searchLogRepository = new InMemorySearchLogRepository();
  const { baseUrl, close } = await startTestServer(searchLogRepository);

  await fetch(`${baseUrl}/companies/search?q=acme`, {
    headers: {
      "x-forwarded-for": "203.0.113.10",
    },
  });
  await fetch(`${baseUrl}/companies/12345678/free-preview`, {
    headers: {
      "x-forwarded-for": "203.0.113.10",
    },
  });

  assert.equal(searchLogRepository.entries.length, 2);
  assert.notEqual(searchLogRepository.entries[0]?.ipHash, "203.0.113.10");
  assert.equal(searchLogRepository.entries[0]?.ipHash?.length, 64);
  assert.equal(searchLogRepository.entries[1]?.selectedCompaniesHouseNumber, "12345678");

  await close();
});

void test("GET /companies/:companyNumber/tabs/:tab returns paginated free tab data", async () => {
  const companiesHouseClient = new CountingCompaniesHouseClient();
  const companyRepository = new InMemoryCompanyRepository();
  const companyService = new CompanyService({
    companiesHouseClient,
    companyRepository,
    searchLogRepository: new InMemorySearchLogRepository(),
    reportProductRepository: new InMemoryReportProductRepository(),
  });
  const companyTabService = new CompanyTabService({
    companiesHouseClient,
    companyRepository,
    cache: new InMemoryCompanyTabCache(),
  });
  const app = createApiApp({
    companyService,
    companyTabService,
    anonymousSearchRateLimiter: new InMemoryAnonymousSearchRateLimiter(5),
    requestIdentityResolver: createTestIdentityResolver(),
  });
  const { baseUrl, close } = await listen(app);

  const response = await fetch(`${baseUrl}/companies/12345678/tabs/filing-history?page=2&limit=10`);
  const body = (await response.json()) as {
    data: {
      tab: { tab: string; companyNumber: string; pagination: { page: number; limit: number } };
    };
  };

  assert.equal(response.status, 200);
  assert.equal(body.data.tab.tab, "filing-history");
  assert.equal(body.data.tab.companyNumber, "12345678");
  assert.equal(body.data.tab.pagination.page, 2);
  assert.equal(body.data.tab.pagination.limit, 10);
  assert.deepEqual(companiesHouseClient.filingInputs, [
    { companyNumber: "12345678", page: 2, limit: 10 },
  ]);

  await close();
});

void test("anonymous tab cache hits still consume the daily allowance", async () => {
  const companiesHouseClient = new CountingCompaniesHouseClient();
  const companyRepository = new InMemoryCompanyRepository();
  const companyService = new CompanyService({
    companiesHouseClient,
    companyRepository,
    searchLogRepository: new InMemorySearchLogRepository(),
    reportProductRepository: new InMemoryReportProductRepository(),
  });
  const companyTabService = new CompanyTabService({
    companiesHouseClient,
    companyRepository,
    cache: new InMemoryCompanyTabCache(),
  });
  const app = createApiApp({
    companyService,
    companyTabService,
    anonymousSearchRateLimiter: new InMemoryAnonymousSearchRateLimiter(1),
    requestIdentityResolver: createTestIdentityResolver(),
  });
  const { baseUrl, close } = await listen(app);

  const firstResponse = await fetch(`${baseUrl}/companies/12345678/tabs/filing-history`);
  const secondResponse = await fetch(`${baseUrl}/companies/12345678/tabs/filing-history`);
  const body = (await secondResponse.json()) as { error: { code: string } };

  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 429);
  assert.equal(body.error.code, "anonymous_search_rate_limited");
  assert.equal(companiesHouseClient.filingInputs.length, 1);

  await close();
});

void test("trusted authenticated tab requests bypass anonymous allowance", async () => {
  const companiesHouseClient = new CountingCompaniesHouseClient();
  const companyRepository = new InMemoryCompanyRepository();
  const companyService = new CompanyService({
    companiesHouseClient,
    companyRepository,
    searchLogRepository: new InMemorySearchLogRepository(),
    reportProductRepository: new InMemoryReportProductRepository(),
  });
  const companyTabService = new CompanyTabService({
    companiesHouseClient,
    companyRepository,
    cache: new InMemoryCompanyTabCache(),
  });
  const app = express();

  app.use(express.json());
  app.use((request, _response, next) => {
    request.clerkUserId = "clerk_user_123";
    next();
  });
  registerCompanyRoutes(app, {
    companyService,
    companyTabService,
    anonymousSearchRateLimiter: new InMemoryAnonymousSearchRateLimiter(1),
    requestIdentityResolver: createTestIdentityResolver(),
  });
  const { baseUrl, close } = await listen(app);

  const firstResponse = await fetch(`${baseUrl}/companies/12345678/tabs/officers`);
  const secondResponse = await fetch(`${baseUrl}/companies/12345678/tabs/officers`);

  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 200);
  assert.equal(companiesHouseClient.officerInputs.length, 1);

  await close();
});

async function startTestServer(
  searchLogRepository = new InMemorySearchLogRepository(),
  anonymousSearchRateLimiter = new InMemoryAnonymousSearchRateLimiter(),
): Promise<{ baseUrl: string; close: () => Promise<void> }> {
  const companyService = new CompanyService({
    companiesHouseClient: new MockCompaniesHouseClient(),
    companyRepository: new InMemoryCompanyRepository(),
    searchLogRepository,
    reportProductRepository: new InMemoryReportProductRepository(),
  });

  const app = createApiApp({
    companyService,
    anonymousSearchRateLimiter,
    requestIdentityResolver: createTestIdentityResolver(),
  });

  return listen(app);
}

class SingleCompanyCompaniesHouseClient implements CompaniesHouseClient {
  readonly mode: ProviderMode = "mock";

  readonly provider = "companies_house" as const;

  constructor(private readonly company: CompaniesHouseCompanyProfile) {}

  searchCompanies(
    _input: CompaniesHouseSearchInput,
  ): Promise<ProviderResult<CompaniesHouseSearchResult>> {
    const { activeDirectorCount: _activeDirectorCount, ...summary } = this.company;

    return Promise.resolve(createProviderSuccess(this.provider, { matches: [summary] }));
  }

  getCompanyProfile(
    _input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseCompanyProfile>> {
    return Promise.resolve(createProviderSuccess(this.provider, this.company));
  }

  getActiveOfficerCount(): Promise<
    ProviderResult<{ companiesHouseNumber: string; activeDirectorCount: number }>
  > {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: this.company.companiesHouseNumber,
        activeDirectorCount: this.company.activeDirectorCount ?? 0,
      }),
    );
  }

  getRegisteredOfficeAddress(): Promise<ProviderResult<CompaniesHouseRegisteredOfficeAddress>> {
    return Promise.resolve(
      createProviderSuccess(this.provider, this.company.registeredOfficeAddress),
    );
  }

  getRegisteredOfficeAddressHistory(): Promise<ProviderResult<CompaniesHouseAddressHistory>> {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: this.company.companiesHouseNumber,
        currentAddress: this.company.registeredOfficeAddress,
        changeFilings: [],
      }),
    );
  }

  getOfficers(
    _input?: CompaniesHousePaginatedInput,
  ): Promise<ProviderResult<CompaniesHouseOfficers>> {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: this.company.companiesHouseNumber,
        officers: [],
        activeCount: 0,
        resignedCount: 0,
        pagination: { page: 1, limit: 25, totalResults: 0, totalPages: 0 },
      }),
    );
  }

  getFilingHistory(
    _input?: CompaniesHousePaginatedInput,
  ): ReturnType<CompaniesHouseClient["getFilingHistory"]> {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: this.company.companiesHouseNumber,
        filings: [],
        pagination: { page: 1, limit: 25, totalResults: 0, totalPages: 0 },
      }),
    );
  }

  getCharges(
    _input?: CompaniesHousePaginatedInput,
  ): ReturnType<CompaniesHouseClient["getCharges"]> {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: this.company.companiesHouseNumber,
        charges: [],
        pagination: { page: 1, limit: 25, totalResults: 0, totalPages: 0 },
      }),
    );
  }

  getInsolvency(): Promise<ProviderResult<CompaniesHouseInsolvencyFoundation>> {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: this.company.companiesHouseNumber,
        cases: [],
        status: "none",
      }),
    );
  }
}

class CountingCompaniesHouseClient extends SingleCompanyCompaniesHouseClient {
  profileCalls = 0;
  readonly filingInputs: CompaniesHousePaginatedInput[] = [];
  readonly officerInputs: CompaniesHousePaginatedInput[] = [];

  constructor() {
    super({
      companiesHouseNumber: "12345678",
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
    });
  }

  override getCompanyProfile(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseCompanyProfile>> {
    this.profileCalls += 1;

    return super.getCompanyProfile(input);
  }

  override getFilingHistory(
    input: CompaniesHousePaginatedInput,
  ): ReturnType<CompaniesHouseClient["getFilingHistory"]> {
    this.filingInputs.push(input);

    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: input.companyNumber,
        filings: [
          {
            transactionId: "MzAw",
            type: "AA",
            description: "accounts-with-accounts-type-full",
            category: "accounts",
            date: "2025-01-31",
            pages: 12,
            barcode: "X1",
          },
        ],
        pagination: {
          page: input.page ?? 1,
          limit: input.limit ?? 25,
          totalResults: 1,
          totalPages: 1,
        },
      }),
    );
  }

  override getOfficers(
    input: CompaniesHousePaginatedInput,
  ): ReturnType<CompaniesHouseClient["getOfficers"]> {
    this.officerInputs.push(input);

    return super.getOfficers(input);
  }
}

class FakeRedisRateLimitClient implements RedisRateLimitClient {
  readonly calls: Array<{ script: string; numberOfKeys: number; args: string[] }> = [];

  eval(script: string, numberOfKeys: number, ...args: string[]): Promise<unknown> {
    this.calls.push({ script, numberOfKeys, args });

    return Promise.resolve([1, 86_400]);
  }
}

async function listen(app: { listen: (port: number) => unknown }): Promise<{
  baseUrl: string;
  close: () => Promise<void>;
}> {
  const server = app.listen(0) as Server;
  openServers.add(server);

  await new Promise<void>((resolve) => {
    server.once("listening", resolve);
  });

  const address = server.address() as AddressInfo;

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => closeServer(server),
  };
}

function closeServer(server: Server): Promise<void> {
  if (!openServers.delete(server) || !server.listening) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function toProxyHeaders(identity: {
  clientIp: string;
  signature: string;
  timestamp: string;
}): Record<string, string> {
  return {
    [proxyIdentityHeaders.clientIp]: identity.clientIp,
    [proxyIdentityHeaders.signature]: identity.signature,
    [proxyIdentityHeaders.timestamp]: identity.timestamp,
  };
}
