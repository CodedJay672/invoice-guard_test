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
  QUEUE_JOB_NAMES,
  QUEUE_NAMES,
  type SendAdminAlertJobData,
  type GenerateReportPdfJobData,
  type SendOwnerReportNotificationJobData,
  type ProcessCreditRefundJobData,
  type MaintenanceJobData,
} from "@workspace/queues";

import { AnthropicAiInterpretationClient } from "./ai-interpretation/client.js";
import { PaidReportGenerationHandler } from "./paid-generation/handler.js";
import { PDF_TEMPLATE_VERSION, resolveComplianceContent } from "./pdf-generation/compliance.js";
import { PdfPublisher } from "./pdf-generation/publisher.js";
import { PlaywrightPdfRenderer } from "./pdf-generation/renderer.js";
import { DrizzlePdfArtifactRepository } from "./pdf-generation/repository.js";
import { PdfGenerationService } from "./pdf-generation/service.js";
import { R2PdfObjectStore } from "./pdf-generation/storage.js";
import { createPdfGenerationWorker } from "./pdf-generation/worker.js";
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
import { CreditRefundPublisher } from "./refund/publisher.js";
import { CreditRefundService, StripeCreditRefundGateway } from "./refund/service.js";
import { createCreditRefundWorker } from "./refund/worker.js";
import { AdminAlertService } from "./admin-alert/service.js";
import { createAdminAlertWorker } from "./admin-alert/worker.js";
import { schema } from "@workspace/db";
import { MaintenanceService } from "./maintenance/service.js";
import { createMaintenanceWorker } from "./maintenance/worker.js";

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
  const pdfRepository = new DrizzlePdfArtifactRepository(db);
  const pdfQueue = createQueue<GenerateReportPdfJobData, void, string>({
    name: QUEUE_NAMES.pdfGeneration,
    connectionString: config.redisUrl,
  });
  const compliance = resolveComplianceContent({
    environment: config.environment,
    version: config.pdfComplianceVersion,
    enableFlagSummary: config.enableFlagSummary,
  });
  let pdfPublisher: PdfPublisher | undefined;
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
        const deduplicationKey = `paid-report:${input.reportId}:${input.outcome}`;
        const inserted = await db
          .insert(schema.adminAlerts)
          .values({
            category: "paid_report",
            severity: input.outcome === "refund_required" ? "critical" : "important",
            subject: `Paid report ${input.outcome}`,
            message: JSON.stringify({
              reportReference: input.reportReference,
              outcome: input.outcome,
              failures: input.failures,
            }),
            relatedEntityType: "report",
            relatedEntityId: input.reportId,
            deduplicationKey,
          })
          .onConflictDoNothing()
          .returning({ id: schema.adminAlerts.id });
        const alertId = inserted[0]?.id;
        if (alertId) {
          await alertQueue.add(QUEUE_JOB_NAMES.sendAdminAlert, { alertId }, { jobId: alertId });
        }
      },
    },
    logger,
  });
  const refundQueue = createQueue<ProcessCreditRefundJobData, void, string>({
    name: QUEUE_NAMES.refund,
    connectionString: config.redisUrl,
  });
  const refundPublisher = new CreditRefundPublisher(db, refundQueue);
  const maintenanceQueue = createQueue<MaintenanceJobData, void, string>({
    name: QUEUE_NAMES.maintenance,
    connectionString: config.redisUrl,
  });
  const service = new ReportGenerationService(
    new DrizzleReportGenerationRepository(db),
    handler,
    logger,
    notificationPublisher,
    pdfPublisher,
    refundPublisher,
  );
  createReportGenerationWorker({ connectionString: config.redisUrl, service, logger });
  createMaintenanceWorker(
    config.redisUrl,
    new MaintenanceService(db, {
      stuckAfterMs: config.reportGenerationStuckAfterMs,
      publishAlert: async (alertId) => {
        await alertQueue.add(QUEUE_JOB_NAMES.sendAdminAlert, { alertId }, { jobId: alertId });
      },
      reconcileNotifications: () => notificationPublisher.reconcileQueued(),
      reconcilePdfs: () => pdfPublisher?.reconcileQueued() ?? Promise.resolve(0),
      reconcileRefunds: async () => {
        await refundPublisher.reconcile();
        return 0;
      },
    }),
  );
  for (const task of [
    "detect_stuck_reports",
    "reconcile_notifications",
    "reconcile_pdfs",
    "reconcile_refunds",
    "check_scheduler_health",
  ] as const) {
    await maintenanceQueue.add(
      QUEUE_JOB_NAMES.runMaintenance,
      { version: 1, task, scheduleBoundary: "scheduled" },
      { jobId: `maintenance:${task}`, repeat: { pattern: "0 * * * *" } },
    );
  }
  await maintenanceQueue.add(
    QUEUE_JOB_NAMES.runMaintenance,
    { version: 1, task: "anonymise_old_search_logs", scheduleBoundary: "scheduled" },
    { jobId: "maintenance:anonymise_old_search_logs", repeat: { pattern: "15 2 * * *" } },
  );
  if (config.stripeSecretKey) {
    createCreditRefundWorker({
      connectionString: config.redisUrl,
      service: new CreditRefundService(db, new StripeCreditRefundGateway(config.stripeSecretKey)),
    });
    await refundPublisher.reconcile();
  }
  try {
    const reconciledNotifications = await notificationPublisher.reconcileQueued();
    logger.info({ reconciledNotifications }, "Queued owner notifications reconciled");
  } catch (error) {
    logger.error({ error }, "Failed to reconcile queued owner notifications at startup");
  }
  if (
    compliance &&
    config.r2Endpoint &&
    config.r2Bucket &&
    config.r2AccessKeyId &&
    config.r2SecretAccessKey
  ) {
    pdfPublisher = new PdfPublisher(
      pdfRepository,
      pdfQueue,
      PDF_TEMPLATE_VERSION,
      compliance.version,
    );
    createPdfGenerationWorker({
      connectionString: config.redisUrl,
      service: new PdfGenerationService(
        pdfRepository,
        new PlaywrightPdfRenderer(),
        new R2PdfObjectStore(config.r2Bucket, {
          endpoint: config.r2Endpoint,
          accessKeyId: config.r2AccessKeyId,
          secretAccessKey: config.r2SecretAccessKey,
        }),
        compliance,
        logger,
      ),
      logger,
    });
    try {
      const reconciledPdfs = await pdfPublisher.reconcileQueued();
      logger.info({ reconciledPdfs }, "Queued Premium PDFs reconciled");
    } catch (error) {
      logger.error({ error }, "Failed to reconcile queued Premium PDFs at startup");
    }
  } else {
    logger.info(
      "Premium PDF consumer is idle until R2 and approved compliance copy are configured",
    );
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
    if (config.adminAlertEmail) {
      createAdminAlertWorker(
        config.redisUrl,
        new AdminAlertService(db, {
          apiKey: config.postmarkApiKey,
          from: config.postmarkFromEmail,
          to: config.adminAlertEmail,
          messageStream: config.postmarkMessageStream,
        }),
      );
    }
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
