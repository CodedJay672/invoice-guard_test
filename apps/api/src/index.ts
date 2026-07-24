import { config } from "dotenv";

import { loadAppConfig } from "@workspace/config";
import { createLogger } from "@workspace/logger";

import { createApiApp } from "./app.js";

config({ path: "../../.env" });

const configApp = loadAppConfig();
const logger = createLogger({
  name: "invoiceguard-api",
  environment: configApp.environment,
});

const app = createApiApp();

app.listen(configApp.apiPort, () => {
  logger.info({ port: configApp.apiPort }, "InvoiceGuard API listening");
});
