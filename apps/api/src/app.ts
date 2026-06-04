import { loadAppConfig } from "@workspace/config";
import { createLogger } from "@workspace/logger";
import express, { type Express, type NextFunction, type Request, type Response } from "express";

const config = loadAppConfig();
const logger = createLogger({
  name: "invoiceguard-api",
  environment: config.environment,
});

export function createApiApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());

  app.get("/health", (_request: Request, response: Response) => {
    response.json({
      status: "ok",
      service: "invoiceguard-api",
      environment: config.environment,
      enableFlagSummary: config.enableFlagSummary,
    });
  });

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
