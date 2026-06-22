import { z } from "zod";

import { readBooleanFlag, runtimeEnvironmentSchema } from "./env.js";

const appConfigSchema = z.object({
  NODE_ENV: runtimeEnvironmentSchema,
  APP_URL: z.string().url().default("http://localhost:3000"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  ADMIN_EMAIL: z.string().email().optional(),
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().min(1).optional(),
  WEB_API_SHARED_SECRET: z.string().min(32).optional(),
  SEARCH_IP_HASH_SECRET: z.string().min(32).optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  POSTMARK_API_KEY: z.string().min(1).optional(),
  ADMIN_ALERT_EMAIL: z.string().email().optional(),
  COMPANIES_HOUSE_PROVIDER_MODE: z.enum(["mock", "live"]).default("mock"),
  COMPANIES_HOUSE_BASE_URL: z
    .string()
    .url()
    .default("https://api.company-information.service.gov.uk"),
  COMPANIES_HOUSE_API_KEY: z.string().min(1).optional(),
  COMPANIES_HOUSE_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
  LONDON_GAZETTE_PROVIDER_MODE: z.enum(["mock", "live"]).default("mock"),
  LONDON_GAZETTE_BASE_URL: z
    .string()
    .url()
    .default("https://www.thegazette.co.uk/company-notices/data.json"),
  LONDON_GAZETTE_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
  INSOLVENCY_DISQUALIFIED_OFFICERS_PROVIDER_MODE: z.enum(["mock", "live"]).default("mock"),
  INSOLVENCY_DISQUALIFIED_OFFICERS_BASE_URL: z
    .string()
    .url()
    .default("https://api.company-information.service.gov.uk/free-preview-adverse-checks"),
  INSOLVENCY_DISQUALIFIED_OFFICERS_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
  ENABLE_FLAG_SUMMARY: z.string().optional(),
});

export interface AppConfig {
  environment: "development" | "test" | "production";
  appUrl: string;
  apiPort: number;
  adminEmail: string | undefined;
  adminAlertEmail: string | undefined;
  databaseUrl: string | undefined;
  redisUrl: string | undefined;
  webApiSharedSecret: string | undefined;
  searchIpHashSecret: string | undefined;
  clerkSecretKey: string | undefined;
  clerkPublishableKey: string | undefined;
  stripeSecretKey: string | undefined;
  stripeWebhookSecret: string | undefined;
  postmarkApiKey: string | undefined;
  companiesHouseProviderMode: "mock" | "live";
  companiesHouseBaseUrl: string;
  companiesHouseApiKey: string | undefined;
  companiesHouseTimeoutMs: number;
  londonGazetteProviderMode: "mock" | "live";
  londonGazetteBaseUrl: string;
  londonGazetteTimeoutMs: number;
  insolvencyDisqualifiedOfficersProviderMode: "mock" | "live";
  insolvencyDisqualifiedOfficersBaseUrl: string;
  insolvencyDisqualifiedOfficersTimeoutMs: number;
  enableFlagSummary: boolean;
}

export function loadAppConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  const parsed = appConfigSchema.parse(env);

  return {
    environment: parsed.NODE_ENV,
    appUrl: parsed.APP_URL,
    apiPort: parsed.API_PORT,
    adminEmail: parsed.ADMIN_EMAIL,
    adminAlertEmail: parsed.ADMIN_ALERT_EMAIL,
    databaseUrl: parsed.DATABASE_URL,
    redisUrl: parsed.REDIS_URL,
    webApiSharedSecret: parsed.WEB_API_SHARED_SECRET,
    searchIpHashSecret: parsed.SEARCH_IP_HASH_SECRET,
    clerkSecretKey: parsed.CLERK_SECRET_KEY,
    clerkPublishableKey: parsed.CLERK_PUBLISHABLE_KEY,
    stripeSecretKey: parsed.STRIPE_SECRET_KEY,
    stripeWebhookSecret: parsed.STRIPE_WEBHOOK_SECRET,
    postmarkApiKey: parsed.POSTMARK_API_KEY,
    companiesHouseProviderMode: parsed.COMPANIES_HOUSE_PROVIDER_MODE,
    companiesHouseBaseUrl: parsed.COMPANIES_HOUSE_BASE_URL,
    companiesHouseApiKey: parsed.COMPANIES_HOUSE_API_KEY,
    companiesHouseTimeoutMs: parsed.COMPANIES_HOUSE_TIMEOUT_MS,
    londonGazetteProviderMode: parsed.LONDON_GAZETTE_PROVIDER_MODE,
    londonGazetteBaseUrl: parsed.LONDON_GAZETTE_BASE_URL,
    londonGazetteTimeoutMs: parsed.LONDON_GAZETTE_TIMEOUT_MS,
    insolvencyDisqualifiedOfficersProviderMode:
      parsed.INSOLVENCY_DISQUALIFIED_OFFICERS_PROVIDER_MODE,
    insolvencyDisqualifiedOfficersBaseUrl: parsed.INSOLVENCY_DISQUALIFIED_OFFICERS_BASE_URL,
    insolvencyDisqualifiedOfficersTimeoutMs: parsed.INSOLVENCY_DISQUALIFIED_OFFICERS_TIMEOUT_MS,
    enableFlagSummary: readBooleanFlag(parsed.ENABLE_FLAG_SUMMARY, false),
  };
}

export function assertApiProductionConfig(config: AppConfig): void {
  if (config.environment !== "production") {
    return;
  }

  const missing = [
    ["DATABASE_URL", config.databaseUrl],
    ["REDIS_URL", config.redisUrl],
    ["WEB_API_SHARED_SECRET", config.webApiSharedSecret],
    ["SEARCH_IP_HASH_SECRET", config.searchIpHashSecret],
  ]
    .filter((entry) => !entry[1])
    .map((entry) => entry[0]);

  if (missing.length > 0) {
    throw new Error(`Missing production API configuration: ${missing.join(", ")}.`);
  }
}

export function assertWorkerProductionConfig(config: AppConfig): void {
  if (config.environment !== "production") {
    return;
  }

  const missing = [
    ["DATABASE_URL", config.databaseUrl],
    ["REDIS_URL", config.redisUrl],
  ]
    .filter((entry) => !entry[1])
    .map((entry) => entry[0]);

  if (missing.length > 0) {
    throw new Error(`Missing production worker configuration: ${missing.join(", ")}.`);
  }
}

export function requireConfigValue(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}
