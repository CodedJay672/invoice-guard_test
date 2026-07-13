import "server-only";

import {
  apiErrorResponseSchema,
  companySearchApiResponseSchema,
  type CompanySearchMatchPayload,
} from "@workspace/validation";
import type { ProviderPayload } from "@workspace/types";
import type { CompanySearchResponsePayload } from "@workspace/types";
import { assertWebProxyProductionConfig, loadWebProxyConfig } from "@workspace/config/web";
import { SearchStatus } from "@/components/company-search/fixtures";

export async function searchCompanies(query: string): Promise<{
  searchStatus: SearchStatus;
  matches: CompanySearchMatchPayload[];
  message: string;
  providerPayload?: ProviderPayload;
}> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return {
      searchStatus: "invalid",
      matches: [],
      message: "Enter at least 2 characters.",
    };
  }

  const config = loadWebProxyConfig();
  assertWebProxyProductionConfig(config);
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), config.timeoutMs);

  try {
    const url = new URL("/companies/search", config.apiBaseUrl);
    url.searchParams.set("q", trimmedQuery);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal: abortController.signal,
    });
    const body = (await response.json()) as unknown;

    if (!response.ok) {
      const error = apiErrorResponseSchema.safeParse(body);
      const code = error.success ? error.data.error.code : "company_search_failed";

      return {
        searchStatus: code === "anonymous_search_rate_limited" ? "rate_limited" : "error",
        matches: [],
        message: error.success
          ? error.data.error.message
          : "Company data could not be retrieved right now.",
      };
    }

    const parsed = companySearchApiResponseSchema.safeParse(body);

    if (!parsed.success) {
      throw new Error("Company search returned an invalid response.");
    }

    const data = parsed.data.data as CompanySearchResponsePayload;

    return {
      searchStatus: data.matches.length > 0 ? "results" : "empty",
      matches: data.matches,
      message: "",
      ...(data.providerPayload ? { providerPayload: data.providerPayload } : {}),
    };
  } catch {
    return {
      searchStatus: "error",
      matches: [],
      message: "Company data could not be retrieved right now.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
