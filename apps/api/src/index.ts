import { loadAppConfig } from "@workspace/config";
import { createLogger } from "@workspace/logger";

import { createApiApp } from "./app.js";

const config = loadAppConfig();
const logger = createLogger({
  name: "invoiceguard-api",
  environment: config.environment,
});

const app = createApiApp();

app.listen(config.apiPort, () => {
  logger.info({ port: config.apiPort }, "InvoiceGuard API listening");
});
