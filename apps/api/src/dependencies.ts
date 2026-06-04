import { loadAppConfig, type AppConfig } from "@workspace/config";
import { createDatabase } from "@workspace/db";
import { createCompaniesHouseClient } from "@workspace/integrations";
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

export interface ApiDependencies {
  companyService: CompanyService;
  anonymousSearchRateLimiter: InMemoryAnonymousSearchRateLimiter | RedisAnonymousSearchRateLimiter;
}

export function createApiDependencies(config: AppConfig = loadAppConfig()): ApiDependencies {
  const companiesHouseClient = createCompaniesHouseClient({
    mode: config.companiesHouseProviderMode,
    baseUrl: config.companiesHouseBaseUrl,
    apiKey: config.companiesHouseApiKey,
    timeoutMs: config.companiesHouseTimeoutMs,
  });

  if (config.databaseUrl) {
    const db = createDatabase(config.databaseUrl);

    return {
      companyService: new CompanyService({
        companiesHouseClient,
        companyRepository: new DrizzleCompanyRepository(db),
        searchLogRepository: new DrizzleSearchLogRepository(db),
      }),
      anonymousSearchRateLimiter: createAnonymousSearchRateLimiter(config),
    };
  }

  return {
    companyService: new CompanyService({
      companiesHouseClient,
      companyRepository: new InMemoryCompanyRepository(),
      searchLogRepository: new InMemorySearchLogRepository(),
    }),
    anonymousSearchRateLimiter: createAnonymousSearchRateLimiter(config),
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
