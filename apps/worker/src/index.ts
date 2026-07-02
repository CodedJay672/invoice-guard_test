import Anthropic from "@anthropic-ai/sdk";

import { assertWorkerProductionConfig, loadAppConfig } from "@workspace/config";
import { createDatabase } from "@workspace/db";
import {
  createCompaniesHouseClient,
  createInsolvencyDisqualifiedOfficersClient,
  createLondonGazetteClient,
  createRegistryTrustClient,
} from "@workspace/integrations";
import { createLogger } from "@workspace/logger";
import { createQueue, QUEUE_NAMES, type SendAdminAlertJobData } from "@workspace/queues";

import { AnthropicAiInterpretationClient } from "./ai-interpretation/client.js";
import { PaidReportGenerationHandler } from "./paid-generation/handler.js";
import { DrizzlePaidGenerationRepository } from "./paid-generation/repository.js";
import { DrizzleReportGenerationRepository } from "./report-generation/repository.js";
import { ReportGenerationService } from "./report-generation/service.js";
import { createReportGenerationWorker } from "./report-generation/worker.js";

const config = loadAppConfig();
assertWorkerProductionConfig(config);
const logger = createLogger({
  name: "invoiceguard-worker",
  environment: config.environment,
});

if (config.databaseUrl && config.redisUrl && config.anthropicApiKey) {
  const db = createDatabase(config.databaseUrl);
  const paidRepository = new DrizzlePaidGenerationRepository(db);
  const alertQueue = createQueue<SendAdminAlertJobData, void, string>({
    name: QUEUE_NAMES.providerAlert,
    connectionString: config.redisUrl,
  });
  const handler = new PaidReportGenerationHandler({
    repository: paidRepository,
    companiesHouse: createCompaniesHouseClient({
      mode: config.companiesHouseProviderMode,
      baseUrl: config.companiesHouseBaseUrl,
      apiKey: config.companiesHouseApiKey,
      timeoutMs: config.companiesHouseTimeoutMs,
    }),
    registryTrust: createRegistryTrustClient({ mode: config.registryTrustProviderMode }),
    londonGazette: createLondonGazetteClient({
      mode: config.londonGazetteProviderMode,
      baseUrl: config.londonGazetteBaseUrl,
      timeoutMs: config.londonGazetteTimeoutMs,
    }),
    insolvencyDisqualifiedOfficers: createInsolvencyDisqualifiedOfficersClient({
      mode: config.insolvencyDisqualifiedOfficersProviderMode,
      baseUrl: config.insolvencyDisqualifiedOfficersBaseUrl,
      timeoutMs: config.insolvencyDisqualifiedOfficersTimeoutMs,
    }),
    ai: new AnthropicAiInterpretationClient({
      apiKey: config.anthropicApiKey,
      client: new Anthropic({ apiKey: config.anthropicApiKey, maxRetries: 0 }),
    }),
    alerts: {
      async publish(input): Promise<void> {
        await alertQueue.add("paid-report-provider-alert", {
          subject: `Paid report ${input.outcome}`,
          message: JSON.stringify({
            reportReference: input.reportReference,
            outcome: input.outcome,
            failures: input.failures,
          }),
          reportId: input.reportId,
        });
      },
    },
    logger,
  });
  const service = new ReportGenerationService(
    new DrizzleReportGenerationRepository(db),
    handler,
    logger,
  );
  createReportGenerationWorker({ connectionString: config.redisUrl, service, logger });
  logger.info({ queues: QUEUE_NAMES }, "InvoiceGuard paid report worker started");
} else {
  logger.info(
    { queues: QUEUE_NAMES },
    "InvoiceGuard worker is idle until database, Redis, and Anthropic configuration are present",
  );
}
