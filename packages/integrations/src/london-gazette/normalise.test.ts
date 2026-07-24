import assert from "node:assert/strict";
import test from "node:test";

import { normaliseLondonGazetteResponse } from "./normalise.js";

void test("London Gazette normalisation detects strike-off notices", () => {
  const result = normaliseLondonGazetteResponse("87654321", {
    notices: [{ id: "1", title: "Compulsory strike-off notice" }],
  });

  assert.equal(result.status, "success");
  assert.equal(result.status === "success" ? result.data.gazetteStrikeoffFlag : false, true);
  assert.equal(result.status === "success" ? result.data.gazetteWindingupFlag : true, false);
});

void test("London Gazette normalisation detects winding-up notices", () => {
  const result = normaliseLondonGazetteResponse("SC123456", {
    notices: [{ id: "1", title: "Winding-up petition notice" }],
  });

  assert.equal(result.status, "success");
  assert.equal(result.status === "success" ? result.data.gazetteWindingupFlag : false, true);
});

void test("London Gazette normalisation returns structured provider failure", () => {
  const result = normaliseLondonGazetteResponse("12345678", { notices: "not-an-array" });

  assert.equal(result.status, "failed");
  assert.equal(
    result.status === "failed" ? result.errorCode : undefined,
    "integration_invalid_response",
  );
});

void test("London Gazette normalisation rejects an evidence-free object", () => {
  const result = normaliseLondonGazetteResponse("12345678", {});

  assert.equal(result.status, "failed");
});
