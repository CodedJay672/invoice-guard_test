import { z } from "zod";

import { readBooleanFlag, runtimeEnvironmentSchema } from "./env.js";

const appConfigSchema = z.object({
  NODE_ENV: runtimeEnvironmentSchema,
  APP_URL: z.string().url().default("http://localhost:3000"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  ADMIN_EMAIL: z.string().email().optional(),
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().min(1).optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  POSTMARK_API_KEY: z.string().min(1).optional(),
  ADMIN_ALERT_EMAIL: z.string().email().optional(),
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
  clerkSecretKey: string | undefined;
  clerkPublishableKey: string | undefined;
  stripeSecretKey: string | undefined;
  stripeWebhookSecret: string | undefined;
  postmarkApiKey: string | undefined;
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
    clerkSecretKey: parsed.CLERK_SECRET_KEY,
    clerkPublishableKey: parsed.CLERK_PUBLISHABLE_KEY,
    stripeSecretKey: parsed.STRIPE_SECRET_KEY,
    stripeWebhookSecret: parsed.STRIPE_WEBHOOK_SECRET,
    postmarkApiKey: parsed.POSTMARK_API_KEY,
    enableFlagSummary: readBooleanFlag(parsed.ENABLE_FLAG_SUMMARY, false),
  };
}

export function requireConfigValue(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}
