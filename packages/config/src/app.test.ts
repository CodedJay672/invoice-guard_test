import assert from "node:assert/strict";
import test from "node:test";

import { assertApiProductionConfig, assertWorkerProductionConfig, loadAppConfig } from "./app.js";
import { assertWebProxyProductionConfig, loadWebProxyConfig } from "./web.js";

void test("production API configuration fails closed without durable infrastructure", () => {
  const config = loadAppConfig({ NODE_ENV: "production" });

  assert.throws(() => assertApiProductionConfig(config), /DATABASE_URL/);
  assert.throws(() => assertWorkerProductionConfig(config), /REDIS_URL/);
});

void test("production API configuration accepts required infrastructure and secrets", () => {
  const config = loadAppConfig({
    NODE_ENV: "production",
    DATABASE_URL: "postgres://invoiceguard:test@localhost/invoiceguard",
    REDIS_URL: "redis://localhost:6379",
    WEB_API_SHARED_SECRET: "invoiceguard-web-api-shared-secret-123456",
    SEARCH_IP_HASH_SECRET: "invoiceguard-search-hash-secret-1234567",
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
