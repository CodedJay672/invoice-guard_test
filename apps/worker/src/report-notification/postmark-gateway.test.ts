/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-base-to-string, @typescript-eslint/require-await */
import assert from "node:assert/strict";
import test from "node:test";

import { HttpPostmarkGateway } from "./postmark-gateway.js";

void test("Postmark gateway sends minimal transactional multipart content", async () => {
  let body: Record<string, unknown> = {};
  const gateway = new HttpPostmarkGateway({
    apiKey: "secret",
    from: "reports@invoiceguard.co.uk",
    messageStream: "outbound",
    fetch: async (_url, init) => {
      body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return Response.json({
        ErrorCode: 0,
        MessageID: "pm-1",
        SubmittedAt: "2026-07-03T10:00:00.000Z",
      });
    },
  });
  const result = await gateway.send({
    to: "owner@example.com",
    reportId: "report-1",
    subject: "Ready",
    htmlBody: "<p>Ready</p>",
    textBody: "Ready",
  });
  assert.equal(result.kind, "accepted");
  assert.equal(body["MessageStream"], "outbound");
  assert.equal(body["TrackOpens"], false);
  assert.equal(body["TrackLinks"], "None");
  assert.deepEqual(body["Metadata"], { reportId: "report-1" });
});

void test("transport uncertainty is ambiguous while explicit failures are rejected", async () => {
  const ambiguous = new HttpPostmarkGateway({
    apiKey: "secret",
    from: "reports@invoiceguard.co.uk",
    messageStream: "outbound",
    fetch: async () => {
      throw new Error("timeout");
    },
  });
  assert.deepEqual(await ambiguous.send(message()), {
    kind: "ambiguous",
    code: "postmark_transport_ambiguous",
  });

  const rejected = new HttpPostmarkGateway({
    apiKey: "secret",
    from: "reports@invoiceguard.co.uk",
    messageStream: "outbound",
    fetch: async () => Response.json({ ErrorCode: 406, Message: "inactive" }, { status: 422 }),
  });
  assert.deepEqual(await rejected.send(message()), {
    kind: "rejected",
    code: "postmark_406",
    retryable: false,
  });
});

function message() {
  return {
    to: "owner@example.com",
    reportId: "report-1",
    subject: "Ready",
    htmlBody: "html",
    textBody: "text",
  };
}
