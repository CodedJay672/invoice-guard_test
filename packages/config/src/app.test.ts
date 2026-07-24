import assert from "node:assert/strict";
import test from "node:test";

import {
  assertApiProductionConfig,
  assertWorkerProductionConfig,
  isPdfProductionReady,
  loadAppConfig,
} from "./app.js";
import { assertWebProxyProductionConfig, loadWebProxyConfig } from "./web.js";

void test("production API configuration fails closed without durable infrastructure", () => {
  const config = loadAppConfig({ NODE_ENV: "production" });

  assert.throws(() => assertApiProductionConfig(config), /DATABASE_URL/);
  assert.throws(() => assertWorkerProductionConfig(config), /REDIS_URL/);
  assert.throws(() => assertWorkerProductionConfig(config), /ANTHROPIC_API_KEY/);
  assert.throws(() => assertWorkerProductionConfig(config), /POSTMARK_API_KEY/);
});

void test("production worker accepts complete notification configuration", () => {
  const config = loadAppConfig({
    NODE_ENV: "production",
    DATABASE_URL: "postgres://invoiceguard:test@localhost/invoiceguard",
    REDIS_URL: "redis://localhost:6379",
    ANTHROPIC_API_KEY: "sk-ant-test",
    CLERK_SECRET_KEY: "sk_test_clerk",
    POSTMARK_API_KEY: "postmark-test",
    POSTMARK_FROM_EMAIL: "reports@invoiceguard.co.uk",
    REGISTRY_TRUST_PROVIDER_MODE: "live",
  });
  assert.doesNotThrow(() => assertWorkerProductionConfig(config));
  assert.equal(config.postmarkMessageStream, "outbound");
});

void test("production worker fails closed until Registry Trust live mode is configured", () => {
  const config = loadAppConfig({
    NODE_ENV: "production",
    DATABASE_URL: "postgres://invoiceguard:test@localhost/invoiceguard",
    REDIS_URL: "redis://localhost:6379",
    ANTHROPIC_API_KEY: "sk-ant-test",
    CLERK_SECRET_KEY: "sk_test_clerk",
    POSTMARK_API_KEY: "postmark-test",
    POSTMARK_FROM_EMAIL: "reports@invoiceguard.co.uk",
  });

  assert.throws(() => assertWorkerProductionConfig(config), /Registry Trust live mode/);
});

void test("production API configuration accepts required infrastructure and secrets", () => {
  const config = loadAppConfig({
    NODE_ENV: "production",
    DATABASE_URL: "postgres://invoiceguard:test@localhost/invoiceguard",
    REDIS_URL: "redis://localhost:6379",
    WEB_API_SHARED_SECRET: "invoiceguard-web-api-shared-secret-123456",
    SEARCH_IP_HASH_SECRET: "invoiceguard-search-hash-secret-1234567",
    STRIPE_SECRET_KEY: "sk_test_invoiceguard",
    STRIPE_WEBHOOK_SECRET: "whsec_invoiceguard",
  });

  assert.doesNotThrow(() => assertApiProductionConfig(config));
});

void test("production web proxy configuration requires a trusted host header", () => {
  const env = {
    NODE_ENV: "production",
    API_BASE_URL: "https://api.invoiceguard.example",
    WEB_API_SHARED_SECRET: "invoiceguard-web-api-shared-secret-123456",
  };

  assert.throws(() => assertWebProxyProductionConfig(loadWebProxyConfig(env), env), {
    message: /TRUSTED_CLIENT_IP_HEADER/,
  });
});

void test("report generation uses a validated fifteen-minute stuck threshold", () => {
  assert.equal(loadAppConfig({ NODE_ENV: "test" }).reportGenerationStuckAfterMs, 900_000);
  assert.equal(
    loadAppConfig({
      NODE_ENV: "test",
      REPORT_GENERATION_STUCK_AFTER_MS: "120000",
    }).reportGenerationStuckAfterMs,
    120_000,
  );
  assert.throws(() => loadAppConfig({ NODE_ENV: "test", REPORT_GENERATION_STUCK_AFTER_MS: "0" }));
});

void test("PDF production readiness requires private R2 and non-fixture approved copy", () => {
  assert.equal(isPdfProductionReady(loadAppConfig({ NODE_ENV: "production" })), false);
  const configured = {
    NODE_ENV: "production",
    R2_ENDPOINT: "https://account.r2.cloudflarestorage.com",
    R2_BUCKET: "invoiceguard-reports",
    R2_ACCESS_KEY_ID: "access-key",
    R2_SECRET_ACCESS_KEY: "secret-key",
  };
  assert.equal(
    isPdfProductionReady(loadAppConfig({ ...configured, PDF_COMPLIANCE_VERSION: "fixture-v1" })),
    false,
  );
  assert.equal(
    isPdfProductionReady(
      loadAppConfig({
        ...configured,
        PDF_COMPLIANCE_VERSION: "approved-v1",
      }),
    ),
    true,
  );
});
