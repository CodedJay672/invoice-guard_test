import assert from "node:assert/strict";
import test from "node:test";

import { createRegistryTrustClient } from "./client.js";

void test("Registry Trust mock returns deterministic normalized judgements", async () => {
  const client = createRegistryTrustClient({ mode: "mock" });
  const result = await client.checkCompany({ companyNumber: "01234561" });
  assert.equal(result.status, "success");
  if (result.status === "success") {
    assert.equal(result.data.judgements.length, 1);
    assert.equal(result.data.judgements[0]?.amountPence, 125_000);
  }
});

void test("Registry Trust live mode fails closed without a verified contract", () => {
  assert.throws(() => createRegistryTrustClient({ mode: "live" }), /verified production contract/);
});
