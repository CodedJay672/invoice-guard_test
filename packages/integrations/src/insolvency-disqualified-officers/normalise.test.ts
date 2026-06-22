import assert from "node:assert/strict";
import test from "node:test";

import { normaliseInsolvencyDisqualifiedOfficersResponse } from "./normalise.js";

void test("insolvency and disqualified officers normalisation detects insolvency flag", () => {
  const result = normaliseInsolvencyDisqualifiedOfficersResponse("87654321", {
    insolvencyFlag: true,
    disqualifiedDirectorsFlag: false,
  });

  assert.equal(result.status, "success");
  assert.equal(result.status === "success" ? result.data.insolvencyFlag : false, true);
});

void test("insolvency and disqualified officers normalisation detects disqualified officers", () => {
  const result = normaliseInsolvencyDisqualifiedOfficersResponse("SC123456", {
    disqualifiedOfficers: [{ officerName: "Alex Example" }],
  });

  assert.equal(result.status, "success");
  assert.equal(result.status === "success" ? result.data.disqualifiedDirectorsFlag : false, true);
});

void test("insolvency and disqualified officers normalisation returns structured provider failure", () => {
  const result = normaliseInsolvencyDisqualifiedOfficersResponse("12345678", {
    disqualifiedOfficers: "not-an-array",
  });

  assert.equal(result.status, "failed");
  assert.equal(
    result.status === "failed" ? result.errorCode : undefined,
    "integration_invalid_response",
  );
});

void test("insolvency normalisation rejects an evidence-free object", () => {
  const result = normaliseInsolvencyDisqualifiedOfficersResponse("12345678", {});

  assert.equal(result.status, "failed");
});
