import assert from "node:assert/strict";
import test from "node:test";

import type { AiInterpretationInput } from "@workspace/validation/ai-interpretation";

import { ReportGenerationError } from "../report-generation/types.js";
import { generateAiInterpretation } from "./service.js";
import type { AiInterpretationClient } from "./types.js";
import { AiInterpretationTransportError } from "./types.js";

const input: AiInterpretationInput = {
  overview: {},
  charges: null,
  insolvency: null,
  officers: null,
  filing_history: null,
  ccj: null,
  fair_payment_code: null,
};

void test("unsafe or unavailable interpretations make the factual report partial", async () => {
  const client: AiInterpretationClient = {
    interpret: () =>
      Promise.resolve({
        status: "safety_fallback",
        model: "claude-haiku-4-5-20251001",
        promptVersion: "v1",
        generatedAt: "2026-07-02T12:00:00.000Z",
        requestId: "req_test",
        reason: "safety_violation",
      }),
  };

  const result = await generateAiInterpretation(client, input);
  assert.equal(result.reportOutcome, "partial");
  assert.equal(result.artifact.status, "safety_fallback");
});

void test("transport failures become retryable report-generation failures", async () => {
  const client: AiInterpretationClient = {
    interpret: () => Promise.reject(new AiInterpretationTransportError("timeout", null)),
  };

  await assert.rejects(
    () => generateAiInterpretation(client, input),
    (error: unknown) => error instanceof ReportGenerationError && error.retryable,
  );
});
