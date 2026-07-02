import { loadAppConfig } from "@workspace/config";
import { createLogger } from "@workspace/logger";
import express, { type Express, type NextFunction, type Request, type Response } from "express";

import { registerCompanyRoutes } from "./companies/routes.js";
import { registerCheckoutRoutes, registerStripeWebhookRoute } from "./checkout/routes.js";
import { createApiDependencies, type ApiDependencies } from "./dependencies.js";
import { registerReportDeliveryRoutes } from "./report-delivery/routes.js";

const config = loadAppConfig();
const logger = createLogger({
  name: "invoiceguard-api",
  environment: config.environment,
});

export function createApiApp(
  dependencies: ApiDependencies = createApiDependencies(config),
): Express {
  const app = express();

  app.disable("x-powered-by");
  if (dependencies.checkoutService) {
    registerStripeWebhookRoute(app, dependencies.checkoutService);
  }
  app.use(express.json());

  app.get("/health", (_request: Request, response: Response) => {
    response.json({
      status: "ok",
      service: "invoiceguard-api",
      environment: config.environment,
      enableFlagSummary: config.enableFlagSummary,
    });
  });

  registerCompanyRoutes(app, {
    companyService: dependencies.companyService,
    anonymousSearchRateLimiter: dependencies.anonymousSearchRateLimiter,
    requestIdentityResolver: dependencies.requestIdentityResolver,
  });
  if (dependencies.checkoutService) {
    registerCheckoutRoutes(app, dependencies.checkoutService, dependencies.requestIdentityResolver);
  }
  if (dependencies.reportDeliveryService) {
    registerReportDeliveryRoutes(
      app,
      dependencies.reportDeliveryService,
      dependencies.requestIdentityResolver,
    );
  }

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    logger.error({ error }, "Unhandled API error");
    response.status(500).json({
      error: {
        code: "internal_server_error",
        message: "An unexpected error occurred.",
      },
    });
  });

  return app;
}
