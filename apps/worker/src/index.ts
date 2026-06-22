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
  },
  "InvoiceGuard worker bootstrap ready",
);
