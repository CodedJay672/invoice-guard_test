import { createProviderFailure, type ProviderMode, type ProviderResult } from "@workspace/types";

import { normaliseInsolvencyDisqualifiedOfficersResponse } from "./normalise.js";
import type {
  InsolvencyDisqualifiedOfficersClient,
  InsolvencyDisqualifiedOfficersClientConfig,
  InsolvencyDisqualifiedOfficersFreePreviewFlags,
  InsolvencyDisqualifiedOfficersInput,
} from "./types.js";

const provider = "insolvency_disqualified_officers";

export class LiveInsolvencyDisqualifiedOfficersClient implements InsolvencyDisqualifiedOfficersClient {
  readonly mode: ProviderMode = "live";

  readonly provider = provider;

  constructor(private readonly config: InsolvencyDisqualifiedOfficersClientConfig) {}

  async checkCompany(
    input: InsolvencyDisqualifiedOfficersInput,
  ): Promise<ProviderResult<InsolvencyDisqualifiedOfficersFreePreviewFlags>> {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), this.config.timeoutMs);

    try {
      const url = new URL(this.config.baseUrl);
      url.searchParams.set("companyNumber", input.companyNumber);

      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: abortController.signal,
      });

      if (!response.ok) {
        return createProviderFailure(provider, {
          code: "integration_provider_error",
          message: "Insolvency and disqualified officers check returned an unsuccessful response.",
          retryable: response.status >= 500 || response.status === 429,
          statusCode: response.status,
        });
      }

      return normaliseInsolvencyDisqualifiedOfficersResponse(
        input.companyNumber,
        (await response.json()) as unknown,
      );
    } catch (error) {
      const isTimeout = error instanceof Error && error.name === "AbortError";

      return createProviderFailure(provider, {
        code: isTimeout ? "integration_timeout" : "integration_network_error",
        message: isTimeout
          ? "Insolvency and disqualified officers request timed out."
          : "Insolvency and disqualified officers request failed before a response was received.",
        retryable: true,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}
