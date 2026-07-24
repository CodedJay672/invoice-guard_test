import pino, { type Logger, type LoggerOptions } from "pino";

import type { LogContext } from "./context.js";

export type LoggerEnvironment = "development" | "test" | "production";

export interface CreateLoggerOptions {
  name?: string;
  level?: string;
  environment?: LoggerEnvironment;
}

const DEFAULT_LOG_LEVEL_BY_ENVIRONMENT: Record<LoggerEnvironment, string> = {
  development: "debug",
  test: "silent",
  production: "info",
};

const REDACTED_LOG_PATHS: string[] = [
  "password",
  "token",
  "secret",
  "apiKey",
  "authorization",
  "headers.authorization",
  "*.password",
  "*.token",
  "*.secret",
  "*.apiKey",
  "*.authorization",
];

export function createLogger(options: CreateLoggerOptions = {}): Logger {
  const environment = options.environment ?? "production";
  const level = options.level ?? DEFAULT_LOG_LEVEL_BY_ENVIRONMENT[environment];
  const loggerOptions: LoggerOptions = {
    level,
    base: {
      environment,
    },
    redact: {
      paths: REDACTED_LOG_PATHS,
      censor: "[Redacted]",
    },
  };

  if (options.name) {
    loggerOptions.name = options.name;
  }

  return pino(loggerOptions);
}

export function createChildLogger(parent: Logger, context: LogContext): Logger {
  return parent.child(context);
}
