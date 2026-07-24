import Anthropic from "@anthropic-ai/sdk";

import {
  aiInterpretationInputSchema,
  aiInterpretationOutputSchema,
  type AiInterpretationInput,
  type AiInterpretationOutput,
} from "@workspace/validation/ai-interpretation";

import {
  AI_INTERPRETATION_DISCLAIMER,
  AI_INTERPRETATION_MAX_TOKENS,
  AI_INTERPRETATION_MODEL,
  AI_INTERPRETATION_PROMPT_VERSION,
  AI_INTERPRETATION_SYSTEM_PROMPT,
  AI_INTERPRETATION_TIMEOUT_MS,
} from "./prompt.js";
import {
  AiInterpretationTransportError,
  type AiInterpretationArtifact,
  type AiInterpretationClient,
  type AiInterpretationFailureReason,
} from "./types.js";

const CATEGORY_KEYS = [
  "overview",
  "charges",
  "insolvency",
  "officers",
  "filing_history",
  "ccj",
  "fair_payment_code",
] as const;

const nullableString = { anyOf: [{ type: "string" }, { type: "null" }] } as const;
export const AI_INTERPRETATION_OUTPUT_JSON_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    overview: nullableString,
    charges: nullableString,
    insolvency: nullableString,
    officers: nullableString,
    filing_history: nullableString,
    ccj: nullableString,
    fair_payment_code: nullableString,
  },
  required: ["summary", ...CATEGORY_KEYS],
  additionalProperties: false,
} as const;

const PROHIBITED_PATTERNS = [
  /\bwe recommend\b/i,
  /\byou should\b/i,
  /\bavoid\b/i,
  /\bdo not\b/i,
  /\b(?:high|low|medium) risk\b/i,
  /\brisk (?:score|rating|label)\b/i,
  /\b(?:safe|risky) (?:company|business|choice|option)\b/i,
  /\b(?:trade|extend credit|grant credit)\b.{0,40}\b(?:should|shouldn't|not)\b/i,
  /```|(^|\n)\s{0,3}#{1,6}\s/m,
] as const;

export interface AnthropicAiInterpretationClientOptions {
  apiKey: string;
  timeoutMs?: number | undefined;
  now?: (() => Date) | undefined;
  client?: Anthropic | undefined;
}

export class AnthropicAiInterpretationClient implements AiInterpretationClient {
  private readonly client: Anthropic;
  private readonly timeoutMs: number;
  private readonly now: () => Date;

  constructor(options: AnthropicAiInterpretationClientOptions) {
    this.timeoutMs = options.timeoutMs ?? AI_INTERPRETATION_TIMEOUT_MS;
    this.now = options.now ?? (() => new Date());
    this.client =
      options.client ??
      new Anthropic({ apiKey: options.apiKey, maxRetries: 0, timeout: this.timeoutMs });
  }

  async interpret(rawInput: AiInterpretationInput): Promise<AiInterpretationArtifact> {
    const input = aiInterpretationInputSchema.parse(rawInput);
    let requestId: string | null = null;

    try {
      const response = await this.client.messages.create(
        {
          model: AI_INTERPRETATION_MODEL,
          max_tokens: AI_INTERPRETATION_MAX_TOKENS,
          temperature: 0,
          system: AI_INTERPRETATION_SYSTEM_PROMPT,
          messages: [{ role: "user", content: JSON.stringify(input) }],
          output_config: {
            format: { type: "json_schema", schema: AI_INTERPRETATION_OUTPUT_JSON_SCHEMA },
          },
        },
        { timeout: this.timeoutMs, maxRetries: 0 },
      );
      requestId = response._request_id ?? null;
      const generatedAt = this.now().toISOString();

      if (response.stop_reason === "max_tokens") {
        return failureArtifact("unavailable", "truncated", generatedAt, requestId);
      }
      if (response.stop_reason === "refusal") {
        return failureArtifact("unavailable", "refusal", generatedAt, requestId);
      }

      const textBlocks = response.content.filter((block) => block.type === "text");
      if (textBlocks.length !== 1) {
        return failureArtifact("unavailable", "invalid_output", generatedAt, requestId);
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(textBlocks[0]?.text ?? "");
      } catch {
        return failureArtifact("unavailable", "invalid_output", generatedAt, requestId);
      }

      const outputResult = aiInterpretationOutputSchema.safeParse(parsed);
      if (!outputResult.success) {
        return failureArtifact("unavailable", "invalid_output", generatedAt, requestId);
      }
      if (!nullsMirrorInput(input, outputResult.data)) {
        return failureArtifact("safety_fallback", "null_mismatch", generatedAt, requestId);
      }
      if (!isSafeOutput(outputResult.data)) {
        return failureArtifact("safety_fallback", "safety_violation", generatedAt, requestId);
      }

      return {
        status: "ready",
        model: AI_INTERPRETATION_MODEL,
        promptVersion: AI_INTERPRETATION_PROMPT_VERSION,
        generatedAt,
        requestId,
        output: outputResult.data,
      };
    } catch (error) {
      if (error instanceof AiInterpretationTransportError) throw error;
      const sdkRequestId =
        error instanceof Anthropic.APIError && typeof error.requestID === "string"
          ? error.requestID
          : requestId;
      throw new AiInterpretationTransportError(
        "Anthropic interpretation request failed.",
        sdkRequestId,
        error,
      );
    }
  }
}

function nullsMirrorInput(input: AiInterpretationInput, output: AiInterpretationOutput): boolean {
  return CATEGORY_KEYS.every((key) => (input[key] === null ? output[key] === null : true));
}

function isSafeOutput(output: AiInterpretationOutput): boolean {
  if (!output.summary.endsWith(AI_INTERPRETATION_DISCLAIMER)) return false;
  const copy = [output.summary, ...CATEGORY_KEYS.map((key) => output[key] ?? "")].join("\n");
  return PROHIBITED_PATTERNS.every((pattern) => !pattern.test(copy));
}

function failureArtifact(
  status: "unavailable" | "safety_fallback",
  reason: AiInterpretationFailureReason,
  generatedAt: string,
  requestId: string | null,
): AiInterpretationArtifact {
  return {
    status,
    model: AI_INTERPRETATION_MODEL,
    promptVersion: AI_INTERPRETATION_PROMPT_VERSION,
    generatedAt,
    requestId,
    reason,
  };
}
