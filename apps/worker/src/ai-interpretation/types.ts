import type {
  AiInterpretationInput,
  AiInterpretationOutput,
} from "@workspace/validation/ai-interpretation";

import type { AI_INTERPRETATION_MODEL, AI_INTERPRETATION_PROMPT_VERSION } from "./prompt.js";

export type AiInterpretationFailureReason =
  | "invalid_output"
  | "null_mismatch"
  | "refusal"
  | "safety_violation"
  | "truncated"
  | "unavailable";

export type AiInterpretationArtifact =
  | {
      status: "ready";
      model: typeof AI_INTERPRETATION_MODEL;
      promptVersion: typeof AI_INTERPRETATION_PROMPT_VERSION;
      generatedAt: string;
      requestId: string | null;
      output: AiInterpretationOutput;
    }
  | {
      status: "unavailable" | "safety_fallback";
      model: typeof AI_INTERPRETATION_MODEL;
      promptVersion: typeof AI_INTERPRETATION_PROMPT_VERSION;
      generatedAt: string;
      requestId: string | null;
      reason: AiInterpretationFailureReason;
    };

export interface AiInterpretationClient {
  interpret(input: AiInterpretationInput): Promise<AiInterpretationArtifact>;
}

export class AiInterpretationTransportError extends Error {
  constructor(
    message: string,
    readonly requestId: string | null,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AiInterpretationTransportError";
  }
}
