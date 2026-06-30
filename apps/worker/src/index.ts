import { assertWorkerProductionConfig, loadAppConfig } from "@workspace/config";
import { createLogger } from "@workspace/logger";
import { QUEUE_NAMES } from "@workspace/queues";

const config = loadAppConfig();
assertWorkerProductionConfig(config);
const logger = createLogger({
  name: "invoiceguard-worker",
  environment: config.environment,
});

logger.info(
  {
    queues: QUEUE_NAMES,
    enableFlagSummary: config.enableFlagSummary,
    reportGenerationStuckAfterMs: config.reportGenerationStuckAfterMs,
  },
  "InvoiceGuard worker bootstrap ready; report generation consumption awaits the 15B handler",
);

// Deliberately do not create the report-generation Worker here. The worker factory requires the
// paid-provider handler that 15B will compose; consuming paid jobs before then would create false
// terminal outcomes.
