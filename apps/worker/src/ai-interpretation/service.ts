import type { AiInterpretationInput } from "@workspace/validation/ai-interpretation";

import { ReportGenerationError } from "../report-generation/types.js";
import type { AiInterpretationArtifact, AiInterpretationClient } from "./types.js";
import { AiInterpretationTransportError } from "./types.js";

export interface AiInterpretationStepResult {
  artifact: AiInterpretationArtifact;
  reportOutcome: "ready" | "partial";
}

export async function generateAiInterpretation(
  client: AiInterpretationClient,
  input: AiInterpretationInput,
): Promise<AiInterpretationStepResult> {
  try {
    const artifact = await client.interpret(input);
    return {
      artifact,
      reportOutcome: artifact.status === "ready" ? "ready" : "partial",
    };
  } catch (error) {
    if (error instanceof AiInterpretationTransportError) {
      throw new ReportGenerationError("Anthropic interpretation request failed.", true);
    }
    throw error;
  }
}
