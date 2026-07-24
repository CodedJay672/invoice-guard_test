import assert from "node:assert/strict";
import test from "node:test";

import type Anthropic from "@anthropic-ai/sdk";

import type { AiInterpretationInput } from "@workspace/validation/ai-interpretation";

import { AI_INTERPRETATION_OUTPUT_JSON_SCHEMA, AnthropicAiInterpretationClient } from "./client.js";
import {
  AI_INTERPRETATION_DISCLAIMER,
  AI_INTERPRETATION_MAX_TOKENS,
  AI_INTERPRETATION_MODEL,
  AI_INTERPRETATION_PROMPT_VERSION,
  AI_INTERPRETATION_SYSTEM_PROMPT,
} from "./prompt.js";
import { AiInterpretationTransportError } from "./types.js";

const input: AiInterpretationInput = {
  overview: { companyName: "ACME LIMITED", status: "active" },
  charges: { records: [] },
  insolvency: { records: [] },
  officers: { activeCount: 2 },
  filing_history: { status: "up to date" },
  ccj: null,
  fair_payment_code: null,
};

const validOutput = {
  summary: `The supplied records describe ACME LIMITED as active. ${AI_INTERPRETATION_DISCLAIMER}`,
  overview: "ACME LIMITED is recorded as active. This describes its status in the supplied record.",
  charges:
    "The supplied data records no charges. A charge is security registered over company assets.",
  insolvency:
    "The supplied data records no insolvency entries. Insolvency is a formal process concerning an inability to pay debts.",
  officers:
    "The supplied record lists two active officers. Officers are people formally appointed to company roles.",
  filing_history:
    "The supplied filing status is up to date. Filing history is the record of documents submitted to Companies House.",
  ccj: null,
  fair_payment_code: null,
};

void test("sends the locked prompt, model, token limit, schema, and request options", async () => {
  const calls: unknown[] = [];
  const client = createClient((...args: unknown[]) => {
    calls.push(args);
    return Promise.resolve(response(validOutput));
  });

  const result = await client.interpret(input);

  assert.equal(result.status, "ready");
  assert.equal(result.model, AI_INTERPRETATION_MODEL);
  assert.equal(result.promptVersion, AI_INTERPRETATION_PROMPT_VERSION);
  const [body, options] = calls[0] as [Record<string, unknown>, Record<string, unknown>];
  assert.equal(body.model, "claude-haiku-4-5-20251001");
  assert.equal(body.max_tokens, AI_INTERPRETATION_MAX_TOKENS);
  assert.equal(body.temperature, 0);
  assert.equal(body.system, AI_INTERPRETATION_SYSTEM_PROMPT);
  assert.deepEqual(body.output_config, {
    format: { type: "json_schema", schema: AI_INTERPRETATION_OUTPUT_JSON_SCHEMA },
  });
  assert.deepEqual(body.messages, [{ role: "user", content: JSON.stringify(input) }]);
  assert.deepEqual(options, { timeout: 30_000, maxRetries: 0 });
});

void test("preserves nullable unavailable and non-entitled categories", async () => {
  const result = await createClient(() => Promise.resolve(response(validOutput))).interpret(input);
  assert.equal(result.status, "ready");
  if (result.status === "ready") {
    assert.equal(result.output.ccj, null);
    assert.equal(result.output.fair_payment_code, null);
  }
});

void test("withholds null mismatches, unsafe wording, and altered disclaimers", async () => {
  const cases = [
    { ...validOutput, ccj: "No CCJs were found." },
    { ...validOutput, overview: "You should avoid this company. It is high risk." },
    { ...validOutput, summary: "The supplied records describe ACME LIMITED as active." },
  ];

  for (const output of cases) {
    const result = await createClient(() => Promise.resolve(response(output))).interpret(input);
    assert.equal(result.status, "safety_fallback");
    assert.equal("output" in result, false);
  }
});

void test("turns refusal, truncation, malformed JSON, and extra keys into unavailable output", async () => {
  const cases = [
    response(validOutput, "refusal"),
    response(validOutput, "max_tokens"),
    response("not-json"),
    response({ ...validOutput, unexpected: "field" }),
  ];

  for (const apiResponse of cases) {
    const result = await createClient(() => Promise.resolve(apiResponse)).interpret(input);
    assert.equal(result.status, "unavailable");
    assert.equal("output" in result, false);
  }
});

void test("surfaces transport failures for the BullMQ retry layer", async () => {
  const client = createClient(() => Promise.reject(new Error("network unavailable")));
  await assert.rejects(() => client.interpret(input), AiInterpretationTransportError);
});

function createClient(
  create: (...args: unknown[]) => Promise<unknown>,
): AnthropicAiInterpretationClient {
  const anthropic = { messages: { create } } as unknown as Anthropic;
  return new AnthropicAiInterpretationClient({
    apiKey: "sk-ant-test",
    client: anthropic,
    now: () => new Date("2026-07-02T12:00:00.000Z"),
  });
}

function response(output: unknown, stopReason = "end_turn"): Record<string, unknown> {
  const text = typeof output === "string" ? output : JSON.stringify(output);
  return {
    id: "msg_test",
    type: "message",
    role: "assistant",
    model: AI_INTERPRETATION_MODEL,
    content: [{ type: "text", text, citations: null }],
    stop_reason: stopReason,
    stop_sequence: null,
    usage: { input_tokens: 100, output_tokens: 200 },
    _request_id: "req_test",
  };
}
