import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";

import { MockCompaniesHouseClient } from "@workspace/integrations";
import express from "express";

import { createApiApp } from "../app.js";

import { InMemoryAnonymousSearchRateLimiter } from "./rate-limit.js";
import { InMemoryCompanyRepository, InMemorySearchLogRepository } from "./repository.js";
import { registerCompanyRoutes } from "./routes.js";
import { CompanyService } from "./service.js";

void test("GET /companies/search returns normalized company matches", async () => {
  const { baseUrl, close } = await startTestServer();

  const response = await fetch(`${baseUrl}/companies/search?q=acme`);
  const body = (await response.json()) as {
    data: {
      matches: Array<{
        companiesHouseNumber: string;
        companyName: string;
      }>;
    };
  };

  assert.equal(response.status, 200);
  assert.equal(body.data.matches[0]?.companiesHouseNumber, "12345678");
  assert.equal(body.data.matches[0]?.companyName, "ACME SUPPLIES LIMITED");

  await close();
});

void test("GET /companies/:companyNumber returns canonical company profile data", async () => {
  const { baseUrl, close } = await startTestServer();

  const response = await fetch(`${baseUrl}/companies/12345678`);
  const body = (await response.json()) as {
    data: {
      company: {
        companiesHouseNumber: string;
        companyName: string;
        activeDirectorCount: number;
      };
    };
  };

  assert.equal(response.status, 200);
  assert.equal(body.data.company.companiesHouseNumber, "12345678");
  assert.equal(body.data.company.companyName, "ACME SUPPLIES LIMITED");
  assert.equal(body.data.company.activeDirectorCount, 2);

  await close();
});

void test("GET /companies/search validates query input", async () => {
  const { baseUrl, close } = await startTestServer();

  const response = await fetch(`${baseUrl}/companies/search?q=a`);
  const body = (await response.json()) as { error: { code: string } };

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "invalid_company_search_query");

  await close();
});

void test("GET /companies/search blocks the 6th anonymous search in a 24 hour window", async () => {
  const { baseUrl, close } = await startTestServer();

  for (let searchNumber = 1; searchNumber <= 5; searchNumber += 1) {
    const response = await fetch(`${baseUrl}/companies/search?q=acme`);

    assert.equal(response.status, 200);
  }

  const blockedResponse = await fetch(`${baseUrl}/companies/search?q=acme`);
  const body = (await blockedResponse.json()) as { error: { code: string } };

  assert.equal(blockedResponse.status, 429);
  assert.equal(body.error.code, "anonymous_search_rate_limited");

  await close();
});

void test("GET /companies/search bypasses anonymous rate limits for trusted auth context", async () => {
  const searchLogRepository = new InMemorySearchLogRepository();
  const companyService = new CompanyService({
    companiesHouseClient: new MockCompaniesHouseClient(),
    companyRepository: new InMemoryCompanyRepository(),
    searchLogRepository,
  });
  const app = express();

  app.use(express.json());
  app.use((request, _response, next) => {
    request.clerkUserId = "clerk_user_123";
    next();
  });
  registerCompanyRoutes(app, {
    companyService,
    anonymousSearchRateLimiter: new InMemoryAnonymousSearchRateLimiter(1),
  });

  const { baseUrl, close } = await listen(app);

  const firstResponse = await fetch(`${baseUrl}/companies/search?q=acme`);
  const secondResponse = await fetch(`${baseUrl}/companies/search?q=acme`);

  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 200);
  assert.equal(searchLogRepository.entries[0]?.clerkUserId, "clerk_user_123");

  await close();
});

void test("search logs store a hashed IP and selected company number", async () => {
  const searchLogRepository = new InMemorySearchLogRepository();
  const { baseUrl, close } = await startTestServer(searchLogRepository);

  await fetch(`${baseUrl}/companies/search?q=acme`, {
    headers: {
      "x-forwarded-for": "203.0.113.10",
    },
  });
  await fetch(`${baseUrl}/companies/12345678`, {
    headers: {
      "x-forwarded-for": "203.0.113.10",
    },
  });

  assert.equal(searchLogRepository.entries.length, 2);
  assert.notEqual(searchLogRepository.entries[0]?.ipHash, "203.0.113.10");
  assert.equal(searchLogRepository.entries[0]?.ipHash?.length, 32);
  assert.equal(searchLogRepository.entries[1]?.selectedCompaniesHouseNumber, "12345678");

  await close();
});

async function startTestServer(
  searchLogRepository = new InMemorySearchLogRepository(),
): Promise<{ baseUrl: string; close: () => Promise<void> }> {
  const companyService = new CompanyService({
    companiesHouseClient: new MockCompaniesHouseClient(),
    companyRepository: new InMemoryCompanyRepository(),
    searchLogRepository,
  });

  const app = createApiApp({
    companyService,
    anonymousSearchRateLimiter: new InMemoryAnonymousSearchRateLimiter(),
  });

  return listen(app);
}

async function listen(app: { listen: (port: number) => unknown }): Promise<{
  baseUrl: string;
  close: () => Promise<void>;
}> {
  const server = app.listen(0) as Server;

  await new Promise<void>((resolve) => {
    server.once("listening", resolve);
  });

  const address = server.address() as AddressInfo;

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  };
}
