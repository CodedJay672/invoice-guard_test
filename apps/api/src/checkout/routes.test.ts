import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";

import express from "express";

import type { RequestIdentityResolver } from "../request-context.js";
import { registerCheckoutRoutes } from "./routes.js";
import type { CheckoutService } from "./service.js";
import type { AuthenticatedCreateCheckoutSessionInput } from "./types.js";

const openServers = new Set<Server>();

test.afterEach(async () => {
  await Promise.all(Array.from(openServers, closeServer));
});

void test("checkout creation rejects requests without a verified Clerk principal", async () => {
  const harness = await createHarness(() => ({
    clerkUserId: undefined,
    verifiedEmail: undefined,
    ipHash: undefined,
  }));

  const response = await fetch(`${harness.baseUrl}/checkout/sessions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(validCheckoutInput()),
  });

  assert.equal(response.status, 401);
  assert.equal(harness.service.created.length, 0);
});

void test("checkout creation derives ownership and email from the trusted principal", async () => {
  const harness = await createHarness(() => ({
    clerkUserId: "user_owner_123",
    verifiedEmail: "owner@example.com",
    ipHash: undefined,
  }));

  const response = await fetch(`${harness.baseUrl}/checkout/sessions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...validCheckoutInput(), email: "attacker@example.com" }),
  });

  assert.equal(response.status, 201);
  assert.deepEqual(harness.service.created[0], {
    ...validCheckoutInput(),
    clerkUserId: "user_owner_123",
    verifiedEmail: "owner@example.com",
  });
});

void test("checkout status passes the verified owner to the service", async () => {
  const harness = await createHarness(() => ({
    clerkUserId: "user_owner_123",
    verifiedEmail: "owner@example.com",
    ipHash: undefined,
  }));

  const response = await fetch(`${harness.baseUrl}/checkout/sessions/cs_test_12345678/status`);

  assert.equal(response.status, 200);
  assert.deepEqual(harness.service.statusLookups, [
    { sessionId: "cs_test_12345678", clerkUserId: "user_owner_123" },
  ]);
});

function validCheckoutInput(): {
  companyNumber: string;
  tier: "single_report";
  attemptId: string;
} {
  return {
    companyNumber: "12345678",
    tier: "single_report" as const,
    attemptId: "4f90d0e1-6241-45db-995e-b30c3e45aa93",
  };
}

async function createHarness(identityResolver: RequestIdentityResolver): Promise<{
  baseUrl: string;
  service: {
    created: AuthenticatedCreateCheckoutSessionInput[];
    statusLookups: Array<{ sessionId: string; clerkUserId: string }>;
  };
}> {
  const service = {
    created: [] as AuthenticatedCreateCheckoutSessionInput[],
    statusLookups: [] as Array<{ sessionId: string; clerkUserId: string }>,
    createSession(input: AuthenticatedCreateCheckoutSessionInput) {
      this.created.push(input);
      return Promise.resolve({ sessionId: "cs_test_12345678", url: "https://stripe.test" });
    },
    getStatus(sessionId: string, clerkUserId: string) {
      this.statusLookups.push({ sessionId, clerkUserId });
      return Promise.resolve({ status: "confirming" as const });
    },
  };
  const app = express();
  app.use(express.json());
  registerCheckoutRoutes(app, service as unknown as CheckoutService, identityResolver);
  const server = app.listen(0) as Server;
  openServers.add(server);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address() as AddressInfo;
  return { baseUrl: `http://127.0.0.1:${address.port}`, service };
}

function closeServer(server: Server): Promise<void> {
  if (!openServers.delete(server) || !server.listening) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
