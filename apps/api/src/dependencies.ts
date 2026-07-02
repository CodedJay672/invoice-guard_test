import { assertApiProductionConfig, loadAppConfig, type AppConfig } from "@workspace/config";
import { createDatabase } from "@workspace/db";
import { createCompaniesHouseClient } from "@workspace/integrations";
import { Redis } from "ioredis";
import {
  createQueue,
  QUEUE_JOB_NAMES,
  QUEUE_NAMES,
  type GeneratePaidReportJobData,
} from "@workspace/queues";

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
import { DrizzleCheckoutRepository } from "./checkout/repository.js";
import { CheckoutService } from "./checkout/service.js";
import { StripeSdkGateway } from "./checkout/stripe-gateway.js";
import { createRequestIdentityResolver, type RequestIdentityResolver } from "./request-context.js";
import { DrizzleReportDeliveryRepository } from "./report-delivery/repository.js";
import { ReportDeliveryService } from "./report-delivery/service.js";
import {
  DrizzleReportProductRepository,
  InMemoryReportProductRepository,
} from "./report-products/repository.js";

export interface ApiDependencies {
  companyService: CompanyService;
  anonymousSearchRateLimiter: InMemoryAnonymousSearchRateLimiter | RedisAnonymousSearchRateLimiter;
  requestIdentityResolver: RequestIdentityResolver;
  checkoutService?: CheckoutService | undefined;
  reportDeliveryService?: ReportDeliveryService | undefined;
}

export function createApiDependencies(config: AppConfig = loadAppConfig()): ApiDependencies {
  assertApiProductionConfig(config);
  const companiesHouseClient = createCompaniesHouseClient({
    mode: config.companiesHouseProviderMode,
    baseUrl: config.companiesHouseBaseUrl,
    apiKey: config.companiesHouseApiKey,
    timeoutMs: config.companiesHouseTimeoutMs,
  });

  if (config.databaseUrl) {
    const db = createDatabase(config.databaseUrl);
    const reportProductRepository = new DrizzleReportProductRepository(db);
    const companyService = new CompanyService({
      companiesHouseClient,
      companyRepository: new DrizzleCompanyRepository(db),
      searchLogRepository: new DrizzleSearchLogRepository(db),
      reportProductRepository,
    });
    const checkoutService =
      config.redisUrl && config.stripeSecretKey && config.stripeWebhookSecret
        ? createCheckoutService(config, db, companyService, reportProductRepository)
        : undefined;

    return {
      companyService,
      anonymousSearchRateLimiter: createAnonymousSearchRateLimiter(config),
      requestIdentityResolver: createRequestIdentityResolver({
        webApiSharedSecret: config.webApiSharedSecret,
        searchIpHashSecret: config.searchIpHashSecret,
      }),
      checkoutService,
      reportDeliveryService: new ReportDeliveryService(new DrizzleReportDeliveryRepository(db)),
    };
  }

  return {
    companyService: new CompanyService({
      companiesHouseClient,
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

function createCheckoutService(
  config: AppConfig,
  db: ReturnType<typeof createDatabase>,
  companyService: CompanyService,
  reportProductRepository: DrizzleReportProductRepository,
): CheckoutService {
  const queue = createQueue<GeneratePaidReportJobData, void, string>({
    name: QUEUE_NAMES.reportGeneration,
    connectionString: config.redisUrl!,
  });
  return new CheckoutService({
    appUrl: config.appUrl,
    companyService,
    reportProductRepository,
    checkoutRepository: new DrizzleCheckoutRepository(db),
    stripeGateway: new StripeSdkGateway(config.stripeSecretKey!, config.stripeWebhookSecret!),
    reportGenerationQueue: {
      async enqueue(reportId: string): Promise<void> {
        await queue.add(QUEUE_JOB_NAMES.generatePaidReport, { reportId }, { jobId: reportId });
      },
    },
  });
}

function createAnonymousSearchRateLimiter(
  config: AppConfig,
): InMemoryAnonymousSearchRateLimiter | RedisAnonymousSearchRateLimiter {
  if (!config.redisUrl) {
    return new InMemoryAnonymousSearchRateLimiter();
  }

  return new RedisAnonymousSearchRateLimiter(new Redis(config.redisUrl));
}
