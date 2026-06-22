import { assertApiProductionConfig, loadAppConfig, type AppConfig } from "@workspace/config";
import { createDatabase } from "@workspace/db";
import {
  createCompaniesHouseClient,
  createInsolvencyDisqualifiedOfficersClient,
  createLondonGazetteClient,
} from "@workspace/integrations";
import { Redis } from "ioredis";

import {
  InMemoryAnonymousSearchRateLimiter,
  RedisAnonymousSearchRateLimiter,
} from "./companies/rate-limit.js";
import {
  DrizzleCompanyRepository,
  DrizzleSearchLogRepository,
  InMemoryCompanyRepository,
  InMemorySearchLogRepository,
} from "./companies/repository.js";
import { CompanyService } from "./companies/service.js";
import { createRequestIdentityResolver, type RequestIdentityResolver } from "./request-context.js";
import {
  DrizzleReportProductRepository,
  InMemoryReportProductRepository,
} from "./report-products/repository.js";

export interface ApiDependencies {
  companyService: CompanyService;
  anonymousSearchRateLimiter: InMemoryAnonymousSearchRateLimiter | RedisAnonymousSearchRateLimiter;
  requestIdentityResolver: RequestIdentityResolver;
}

export function createApiDependencies(config: AppConfig = loadAppConfig()): ApiDependencies {
  assertApiProductionConfig(config);
  const companiesHouseClient = createCompaniesHouseClient({
    mode: config.companiesHouseProviderMode,
    baseUrl: config.companiesHouseBaseUrl,
    apiKey: config.companiesHouseApiKey,
    timeoutMs: config.companiesHouseTimeoutMs,
  });
  const londonGazetteClient = createLondonGazetteClient({
    mode: config.londonGazetteProviderMode,
    baseUrl: config.londonGazetteBaseUrl,
    timeoutMs: config.londonGazetteTimeoutMs,
  });
  const insolvencyDisqualifiedOfficersClient = createInsolvencyDisqualifiedOfficersClient({
    mode: config.insolvencyDisqualifiedOfficersProviderMode,
    baseUrl: config.insolvencyDisqualifiedOfficersBaseUrl,
    timeoutMs: config.insolvencyDisqualifiedOfficersTimeoutMs,
  });

  if (config.databaseUrl) {
    const db = createDatabase(config.databaseUrl);

    return {
      companyService: new CompanyService({
        companiesHouseClient,
        londonGazetteClient,
        insolvencyDisqualifiedOfficersClient,
        companyRepository: new DrizzleCompanyRepository(db),
        searchLogRepository: new DrizzleSearchLogRepository(db),
        reportProductRepository: new DrizzleReportProductRepository(db),
      }),
      anonymousSearchRateLimiter: createAnonymousSearchRateLimiter(config),
      requestIdentityResolver: createRequestIdentityResolver({
        webApiSharedSecret: config.webApiSharedSecret,
        searchIpHashSecret: config.searchIpHashSecret,
      }),
    };
  }

  return {
    companyService: new CompanyService({
      companiesHouseClient,
      londonGazetteClient,
      insolvencyDisqualifiedOfficersClient,
      companyRepository: new InMemoryCompanyRepository(),
      searchLogRepository: new InMemorySearchLogRepository(),
      reportProductRepository: new InMemoryReportProductRepository(),
    }),
    anonymousSearchRateLimiter: createAnonymousSearchRateLimiter(config),
    requestIdentityResolver: createRequestIdentityResolver({
      webApiSharedSecret: config.webApiSharedSecret,
      searchIpHashSecret: config.searchIpHashSecret,
    }),
  };
}

function createAnonymousSearchRateLimiter(
  config: AppConfig,
): InMemoryAnonymousSearchRateLimiter | RedisAnonymousSearchRateLimiter {
  if (!config.redisUrl) {
    return new InMemoryAnonymousSearchRateLimiter();
  }

  return new RedisAnonymousSearchRateLimiter(new Redis(config.redisUrl));
}
