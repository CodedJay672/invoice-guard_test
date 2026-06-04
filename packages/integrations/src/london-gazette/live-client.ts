import { createProviderFailure, type ProviderMode, type ProviderResult } from "../provider.js";

import { normaliseLondonGazetteResponse } from "./normalise.js";
import type {
  LondonGazetteClient,
  LondonGazetteClientConfig,
  LondonGazetteCompanyInput,
  LondonGazetteFreePreviewFlags,
} from "./types.js";

const provider = "london_gazette";

export class LiveLondonGazetteClient implements LondonGazetteClient {
  readonly mode: ProviderMode = "live";

  readonly provider = provider;

  constructor(private readonly config: LondonGazetteClientConfig) {}

  async checkCompanyNotices(
    input: LondonGazetteCompanyInput,
  ): Promise<ProviderResult<LondonGazetteFreePreviewFlags>> {
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
          message: "London Gazette returned an unsuccessful response.",
          retryable: response.status >= 500 || response.status === 429,
          statusCode: response.status,
        });
      }

      return normaliseLondonGazetteResponse(
        input.companyNumber,
        (await response.json()) as unknown,
      );
    } catch (error) {
      const isTimeout = error instanceof Error && error.name === "AbortError";

      return createProviderFailure(provider, {
        code: isTimeout ? "integration_timeout" : "integration_network_error",
        message: isTimeout
          ? "London Gazette request timed out."
          : "London Gazette request failed before a response was received.",
        retryable: true,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}
