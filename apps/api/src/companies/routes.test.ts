import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";

import {
  createProviderSuccess,
  createProviderFailure,
  MockCompaniesHouseClient,
  MockInsolvencyDisqualifiedOfficersClient,
  MockLondonGazetteClient,
  type CompaniesHouseClient,
  type CompaniesHouseCompanyNumberInput,
  type CompaniesHouseCompanyProfile,
  type CompaniesHouseSearchInput,
  type CompaniesHouseSearchResult,
  type InsolvencyDisqualifiedOfficersClient,
  type InsolvencyDisqualifiedOfficersFreePreviewFlags,
  type InsolvencyDisqualifiedOfficersInput,
  type LondonGazetteClient,
  type LondonGazetteCompanyInput,
  type LondonGazetteFreePreviewFlags,
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

const testHashSecret = "invoiceguard-test-search-hash-secret-123456";
const testProxySecret = "invoiceguard-test-proxy-shared-secret-123456";

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

void test("GET /companies/:companyNumber/free-preview returns clean-path preview data", async () => {
  const { baseUrl, close } = await startTestServer();

  const response = await fetch(`${baseUrl}/companies/12345678/free-preview`);
  const body = (await response.json()) as {
    data: {
      preview: {
        previewPath: string;
        cleanReassurance: string;
        adverseBanners: unknown[];
        courtRecordsPrompt: { label: string };
        tierCards: unknown[];
        company: { companiesHouseNumber: string; activeDirectorCount: number };
      };
    };
  };

  assert.equal(response.status, 200);
  assert.equal(body.data.preview.company.companiesHouseNumber, "12345678");
  assert.equal(body.data.preview.previewPath, "clean");
  assert.equal(body.data.preview.adverseBanners.length, 0);
  assert.equal(
    body.data.preview.cleanReassurance,
    "No insolvency events, director disqualifications, or gazette notices found on the free check.",
  );
  assert.equal(body.data.preview.courtRecordsPrompt.label, "COURT RECORDS — NOT YET CHECKED");
  assert.equal(body.data.preview.tierCards.length, 3);

  await close();
});

void test("GET /companies/:companyNumber/free-preview returns adverse banners", async () => {
  const { baseUrl, close } = await startTestServer();

  const response = await fetch(`${baseUrl}/companies/87654321/free-preview`);
  const body = (await response.json()) as {
    data: {
      preview: {
        previewPath: string;
        freeSourceFlags: {
          insolvencyFlag: boolean;
          gazetteStrikeoffFlag: boolean;
        };
        adverseBanners: Array<{ flag: string }>;
        courtRecordsPrompt: { button: string };
      };
    };
  };

  assert.equal(response.status, 200);
  assert.equal(body.data.preview.previewPath, "adverse");
  assert.equal(body.data.preview.freeSourceFlags.insolvencyFlag, true);
  assert.equal(body.data.preview.freeSourceFlags.gazetteStrikeoffFlag, true);
  assert.deepEqual(
    body.data.preview.adverseBanners.map((banner) => banner.flag),
    ["insolvency", "gazette_strikeoff"],
  );
  assert.equal(body.data.preview.courtRecordsPrompt.button, "Check the Court Records");

  await close();
});

void test("free preview never represents a failed source as clean", async () => {
  const companyService = new CompanyService({
    companiesHouseClient: new MockCompaniesHouseClient(),
    londonGazetteClient: new FailedLondonGazetteClient(),
    insolvencyDisqualifiedOfficersClient: new MockInsolvencyDisqualifiedOfficersClient(),
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
  const body = (await response.json()) as {
    data: {
      preview: {
        previewPath: string;
        cleanReassurance?: string;
        freeSourceFlags: { gazetteStrikeoffFlag: boolean | null };
        sourceStatuses: Array<{ provider: string; status: string; message?: string }>;
      };
    };
  };

  assert.equal(response.status, 200);
  assert.equal(body.data.preview.previewPath, "source_failed");
  assert.equal(body.data.preview.cleanReassurance, undefined);
  assert.equal(body.data.preview.freeSourceFlags.gazetteStrikeoffFlag, null);
  assert.deepEqual(
    body.data.preview.sourceStatuses.find((source) => source.provider === "london_gazette"),
    {
      provider: "london_gazette",
      status: "failed",
      checkedAt: "2026-01-01T00:00:00.000Z",
      message: "Data could not be retrieved",
    },
  );

  await close();
});

void test("adverse findings remain visible when another source fails", async () => {
  const companyService = new CompanyService({
    companiesHouseClient: new MockCompaniesHouseClient(),
    londonGazetteClient: new FailedLondonGazetteClient(),
    insolvencyDisqualifiedOfficersClient: new MockInsolvencyDisqualifiedOfficersClient(),
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

  const response = await fetch(`${baseUrl}/companies/87654321/free-preview`);
  const body = (await response.json()) as {
    data: { preview: { previewPath: string; adverseBanners: Array<{ flag: string }> } };
  };

  assert.equal(body.data.preview.previewPath, "adverse");
  assert.equal(
    body.data.preview.adverseBanners.some((banner) => banner.flag === "insolvency"),
    true,
  );

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

void test("free preview clean path is only used for active companies", async () => {
  const searchLogRepository = new InMemorySearchLogRepository();
  const companyService = new CompanyService({
    companiesHouseClient: new SingleCompanyCompaniesHouseClient({
      companiesHouseNumber: "ZZ000001",
      companyName: "DORMANT EXAMPLE LIMITED",
      companyStatus: "dissolved",
      companyType: "ltd",
      incorporationDate: "2020-01-01",
      registeredOfficeAddress: {
        locality: "Leeds",
        region: "West Yorkshire",
        country: "England",
      },
      sicCodes: ["62020"],
      activeDirectorCount: 0,
    }),
    londonGazetteClient: new MockLondonGazetteClient(),
    insolvencyDisqualifiedOfficersClient: new MockInsolvencyDisqualifiedOfficersClient(),
    companyRepository: new InMemoryCompanyRepository(),
    searchLogRepository,
    reportProductRepository: new InMemoryReportProductRepository(),
  });
  const app = createApiApp({
    companyService,
    anonymousSearchRateLimiter: new InMemoryAnonymousSearchRateLimiter(),
    requestIdentityResolver: createTestIdentityResolver(),
  });
  const { baseUrl, close } = await listen(app);

  const response = await fetch(`${baseUrl}/companies/ZZ000001/free-preview`);
  const body = (await response.json()) as { data: { preview: { previewPath: string } } };

  assert.equal(response.status, 200);
  assert.equal(body.data.preview.previewPath, "standard");

  await close();
});

void test("free preview calls only the three approved provider clients", async () => {
  const companiesHouseClient = new CountingCompaniesHouseClient();
  const londonGazetteClient = new CountingLondonGazetteClient();
  const insolvencyDisqualifiedOfficersClient = new CountingInsolvencyDisqualifiedOfficersClient();
  const companyService = new CompanyService({
    companiesHouseClient,
    londonGazetteClient,
    insolvencyDisqualifiedOfficersClient,
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
  assert.equal(londonGazetteClient.noticeCalls, 1);
  assert.equal(insolvencyDisqualifiedOfficersClient.checkCalls, 1);

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
  const { baseUrl, close } = await startTestServer();

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
    londonGazetteClient: new MockLondonGazetteClient(),
    insolvencyDisqualifiedOfficersClient: new MockInsolvencyDisqualifiedOfficersClient(),
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
    londonGazetteClient: new MockLondonGazetteClient(),
    insolvencyDisqualifiedOfficersClient: new MockInsolvencyDisqualifiedOfficersClient(),
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
    londonGazetteClient: new MockLondonGazetteClient(),
    insolvencyDisqualifiedOfficersClient: new MockInsolvencyDisqualifiedOfficersClient(),
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

async function startTestServer(
  searchLogRepository = new InMemorySearchLogRepository(),
): Promise<{ baseUrl: string; close: () => Promise<void> }> {
  const companyService = new CompanyService({
    companiesHouseClient: new MockCompaniesHouseClient(),
    londonGazetteClient: new MockLondonGazetteClient(),
    insolvencyDisqualifiedOfficersClient: new MockInsolvencyDisqualifiedOfficersClient(),
    companyRepository: new InMemoryCompanyRepository(),
    searchLogRepository,
    reportProductRepository: new InMemoryReportProductRepository(),
  });

  const app = createApiApp({
    companyService,
    anonymousSearchRateLimiter: new InMemoryAnonymousSearchRateLimiter(),
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

  getFilingHistory(): Promise<
    ProviderResult<{ companiesHouseNumber: string; filings: unknown[] }>
  > {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: this.company.companiesHouseNumber,
        filings: [],
      }),
    );
  }

  getCharges(): Promise<ProviderResult<{ companiesHouseNumber: string; charges: unknown[] }>> {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: this.company.companiesHouseNumber,
        charges: [],
      }),
    );
  }
}

class CountingCompaniesHouseClient extends SingleCompanyCompaniesHouseClient {
  profileCalls = 0;

  constructor() {
    super({
      companiesHouseNumber: "12345678",
      companyName: "ACME SUPPLIES LIMITED",
      companyStatus: "active",
      companyType: "ltd",
      incorporationDate: "2018-04-12",
      registeredOfficeAddress: {
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
}

class CountingLondonGazetteClient implements LondonGazetteClient {
  readonly mode: ProviderMode = "mock";

  readonly provider = "london_gazette" as const;

  noticeCalls = 0;

  checkCompanyNotices(
    input: LondonGazetteCompanyInput,
  ): Promise<ProviderResult<LondonGazetteFreePreviewFlags>> {
    this.noticeCalls += 1;

    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: input.companyNumber,
        gazetteStrikeoffFlag: false,
        gazetteWindingupFlag: false,
        notices: [],
      }),
    );
  }
}

class FailedLondonGazetteClient implements LondonGazetteClient {
  readonly mode: ProviderMode = "mock";

  readonly provider = "london_gazette" as const;

  checkCompanyNotices(): Promise<ProviderResult<LondonGazetteFreePreviewFlags>> {
    return Promise.resolve(
      createProviderFailure(
        this.provider,
        {
          code: "integration_timeout",
          message: "London Gazette request timed out.",
          retryable: true,
        },
        "2026-01-01T00:00:00.000Z",
      ),
    );
  }
}

class FakeRedisRateLimitClient implements RedisRateLimitClient {
  readonly calls: Array<{ script: string; numberOfKeys: number; args: string[] }> = [];

  eval(script: string, numberOfKeys: number, ...args: string[]): Promise<unknown> {
    this.calls.push({ script, numberOfKeys, args });

    return Promise.resolve([1, 86_400]);
  }
}

class CountingInsolvencyDisqualifiedOfficersClient implements InsolvencyDisqualifiedOfficersClient {
  readonly mode: ProviderMode = "mock";

  readonly provider = "insolvency_disqualified_officers" as const;

  checkCalls = 0;

  checkCompany(
    input: InsolvencyDisqualifiedOfficersInput,
  ): Promise<ProviderResult<InsolvencyDisqualifiedOfficersFreePreviewFlags>> {
    this.checkCalls += 1;

    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: input.companyNumber,
        insolvencyFlag: false,
        disqualifiedDirectorsFlag: false,
        disqualifiedOfficers: [],
      }),
    );
  }
}

async function listen(app: { listen: (port: number) => unknown }): Promise<{
  baseUrl: string;
  close: () => Promise<void>;
}> {
  const server = app.listen(0) as Server;

  await new Promise<void>((resolve) => {
    server.once("listening", resolve);
  });

  const address = server.address() as AddressInfo;

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  };
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
