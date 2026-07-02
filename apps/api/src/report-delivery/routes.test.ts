import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";

import express from "express";

import type { RequestIdentityResolver } from "../request-context.js";
import { registerReportDeliveryRoutes } from "./routes.js";
import type { ReportDeliveryService } from "./service.js";
import { ReportNotFoundError } from "./types.js";

const servers = new Set<Server>();
test.afterEach(async () => Promise.all([...servers].map(closeServer)));

void test("report route rejects an unsigned principal before lookup", async () => {
  const harness = await createHarness(() => ({
    clerkUserId: undefined,
    verifiedEmail: undefined,
    ipHash: undefined,
  }));
  const response = await fetch(`${harness.baseUrl}/reports/IG-2026-A1B2C3D4E5F6`);
  assert.equal(response.status, 401);
  assert.equal(harness.lookups.length, 0);
});

void test("report route passes the trusted Clerk owner to delivery", async () => {
  const harness = await createHarness(() => ({
    clerkUserId: "user_owner",
    verifiedEmail: "owner@example.com",
    ipHash: undefined,
  }));
  const response = await fetch(`${harness.baseUrl}/reports/IG-2026-A1B2C3D4E5F6`);
  assert.equal(response.status, 200);
  assert.deepEqual(harness.lookups, [
    { reportReference: "IG-2026-A1B2C3D4E5F6", clerkUserId: "user_owner" },
  ]);
});

void test("missing and non-owner responses share the 404 status", async () => {
  for (const accessDenied of [false, true]) {
    const harness = await createHarness(
      () => ({ clerkUserId: "user_owner", verifiedEmail: "owner@example.com", ipHash: undefined }),
      accessDenied,
    );
    const response = await fetch(`${harness.baseUrl}/reports/IG-2026-A1B2C3D4E5F6`);
    assert.equal(response.status, 404);
    const payload = (await response.json()) as { error?: { code?: string } };
    assert.equal(payload.error?.code, accessDenied ? "report_access_denied" : "report_not_found");
  }
});

async function createHarness(
  identity: RequestIdentityResolver,
  notFound?: boolean,
): Promise<{ baseUrl: string; lookups: Array<{ reportReference: string; clerkUserId: string }> }> {
  const lookups: Array<{ reportReference: string; clerkUserId: string }> = [];
  const service = {
    getOwnedReport(reportReference: string, clerkUserId: string) {
      lookups.push({ reportReference, clerkUserId });
      if (notFound !== undefined) return Promise.reject(new ReportNotFoundError(notFound));
      return Promise.resolve({
        state: "not_ready" as const,
        status: "pending" as const,
        reportReference,
      });
    },
  };
  const app = express();
  registerReportDeliveryRoutes(app, service as ReportDeliveryService, identity);
  const server = app.listen(0) as Server;
  servers.add(server);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address() as AddressInfo;
  return { baseUrl: `http://127.0.0.1:${address.port}`, lookups };
}

function closeServer(server: Server): Promise<void> {
  if (!servers.delete(server) || !server.listening) return Promise.resolve();
  return new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}
