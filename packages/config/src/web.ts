import { z } from "zod";

const webProxyConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_BASE_URL: z.string().url().optional(),
  API_PROXY_TIMEOUT_MS: z.coerce.number().int().positive().max(30_000).default(8_000),
  WEB_API_SHARED_SECRET: z.string().min(32).optional(),
  TRUSTED_CLIENT_IP_HEADER: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
});

export interface WebProxyConfig {
  environment: "development" | "test" | "production";
  apiBaseUrl: string;
  timeoutMs: number;
  webApiSharedSecret: string | undefined;
  trustedClientIpHeader: string;
}

export function loadWebProxyConfig(
  env: Record<string, string | undefined> = process.env,
): WebProxyConfig {
  const parsed = webProxyConfigSchema.parse(env);

  return {
    environment: parsed.NODE_ENV,
    apiBaseUrl: parsed.API_BASE_URL ?? "http://localhost:4000",
    timeoutMs: parsed.API_PROXY_TIMEOUT_MS,
    webApiSharedSecret: parsed.WEB_API_SHARED_SECRET,
    trustedClientIpHeader: parsed.TRUSTED_CLIENT_IP_HEADER ?? "x-forwarded-for",
  };
}

export function assertWebProxyProductionConfig(
  config: WebProxyConfig,
  env: Record<string, string | undefined> = process.env,
): void {
  if (config.environment !== "production") {
    return;
  }

  const missing = [
    ["API_BASE_URL", env.API_BASE_URL],
    ["WEB_API_SHARED_SECRET", env.WEB_API_SHARED_SECRET],
    ["TRUSTED_CLIENT_IP_HEADER", env.TRUSTED_CLIENT_IP_HEADER],
  ]
    .filter((entry) => !entry[1])
    .map((entry) => entry[0]);

  if (missing.length > 0) {
    throw new Error(`Missing production web proxy configuration: ${missing.join(", ")}.`);
  }
}
