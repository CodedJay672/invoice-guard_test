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
import {
  createQueue,
  QUEUE_NAMES,
  type SendAdminAlertJobData,
  type SendOwnerReportNotificationJobData,
} from "@workspace/queues";

import { AnthropicAiInterpretationClient } from "./ai-interpretation/client.js";
import { PaidReportGenerationHandler } from "./paid-generation/handler.js";
import { DrizzlePaidGenerationRepository } from "./paid-generation/repository.js";
import { DrizzleReportGenerationRepository } from "./report-generation/repository.js";
import { ReportGenerationService } from "./report-generation/service.js";
import { createReportGenerationWorker } from "./report-generation/worker.js";
import { ClerkOwnerEmailResolver } from "./report-notification/clerk-resolver.js";
import { HttpPostmarkGateway } from "./report-notification/postmark-gateway.js";
import { OwnerNotificationPublisher } from "./report-notification/publisher.js";
import { CodeOwnedReportReadyEmailRenderer } from "./report-notification/renderer.js";
import { DrizzleReportNotificationRepository } from "./report-notification/repository.js";
import { OwnerReportNotificationService } from "./report-notification/service.js";
import { createOwnerReportNotificationWorker } from "./report-notification/worker.js";

const config = loadAppConfig();
assertWorkerProductionConfig(config);
const logger = createLogger({
  name: "invoiceguard-worker",
  environment: config.environment,
});

if (config.databaseUrl && config.redisUrl && config.anthropicApiKey) {
  const db = createDatabase(config.databaseUrl);
  const notificationRepository = new DrizzleReportNotificationRepository(db);
  const emailQueue = createQueue<SendOwnerReportNotificationJobData, void, string>({
    name: QUEUE_NAMES.email,
    connectionString: config.redisUrl,
  });
  const notificationPublisher = new OwnerNotificationPublisher(notificationRepository, emailQueue);
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
    notificationPublisher,
  );
  createReportGenerationWorker({ connectionString: config.redisUrl, service, logger });
  try {
    const reconciledNotifications = await notificationPublisher.reconcileQueued();
    logger.info({ reconciledNotifications }, "Queued owner notifications reconciled");
  } catch (error) {
    logger.error({ error }, "Failed to reconcile queued owner notifications at startup");
  }
  if (config.clerkSecretKey && config.postmarkApiKey && config.postmarkFromEmail) {
    const notificationService = new OwnerReportNotificationService(
      notificationRepository,
      new ClerkOwnerEmailResolver(config.clerkSecretKey),
      new CodeOwnedReportReadyEmailRenderer(config.appUrl),
      new HttpPostmarkGateway({
        apiKey: config.postmarkApiKey,
        from: config.postmarkFromEmail,
        messageStream: config.postmarkMessageStream,
      }),
      logger,
    );
    createOwnerReportNotificationWorker({
      connectionString: config.redisUrl,
      service: notificationService,
      logger,
    });
  } else {
    logger.info("Owner notification consumer is idle until Clerk and Postmark are configured");
  }
  logger.info({ queues: QUEUE_NAMES }, "InvoiceGuard paid report worker started");
} else {
  logger.info(
    { queues: QUEUE_NAMES },
    "InvoiceGuard worker is idle until database, Redis, and Anthropic configuration are present",
  );
}
