import { createProviderFailure, type ProviderMode, type ProviderResult } from "../provider.js";

import {
  normaliseCompaniesHouseChargesResponse,
  normaliseCompaniesHouseFilingHistoryResponse,
  normaliseCompaniesHouseOfficerCountResponse,
  normaliseCompaniesHouseProfileResponse,
  normaliseCompaniesHouseSearchResponse,
} from "./normalise.js";
import type {
  CompaniesHouseChargesFoundation,
  CompaniesHouseClient,
  CompaniesHouseClientConfig,
  CompaniesHouseCompanyNumberInput,
  CompaniesHouseCompanyProfile,
  CompaniesHouseFilingHistoryFoundation,
  CompaniesHouseOfficerCount,
  CompaniesHouseSearchInput,
  CompaniesHouseSearchResult,
} from "./types.js";

const provider = "companies_house";

export class LiveCompaniesHouseClient implements CompaniesHouseClient {
  readonly mode: ProviderMode = "live";

  readonly provider = provider;

  constructor(private readonly config: CompaniesHouseClientConfig) {}

  async searchCompanies(
    input: CompaniesHouseSearchInput,
  ): Promise<ProviderResult<CompaniesHouseSearchResult>> {
    const payload = await this.request(
      `/search/companies?q=${encodeURIComponent(input.query)}&items_per_page=${input.itemsPerPage ?? 10}`,
    );

    if (payload.status === "failed") {
      return payload;
    }

    return normaliseCompaniesHouseSearchResponse(payload.data);
  }

  async getCompanyProfile(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseCompanyProfile>> {
    const [profilePayload, officerCount] = await Promise.all([
      this.request(`/company/${encodeURIComponent(input.companyNumber)}`),
      this.getActiveOfficerCount(input),
    ]);

    if (profilePayload.status === "failed") {
      return profilePayload;
    }

    return normaliseCompaniesHouseProfileResponse(
      profilePayload.data,
      officerCount.status === "success" ? officerCount.data.activeDirectorCount : undefined,
    );
  }

  async getActiveOfficerCount(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseOfficerCount>> {
    const payload = await this.request(
      `/company/${encodeURIComponent(input.companyNumber)}/officers?items_per_page=1`,
    );

    if (payload.status === "failed") {
      return payload;
    }

    return normaliseCompaniesHouseOfficerCountResponse(input.companyNumber, payload.data);
  }

  async getFilingHistory(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseFilingHistoryFoundation>> {
    const payload = await this.request(
      `/company/${encodeURIComponent(input.companyNumber)}/filing-history?items_per_page=25`,
    );

    if (payload.status === "failed") {
      return payload;
    }

    return normaliseCompaniesHouseFilingHistoryResponse(input.companyNumber, payload.data);
  }

  async getCharges(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseChargesFoundation>> {
    const payload = await this.request(
      `/company/${encodeURIComponent(input.companyNumber)}/charges?items_per_page=25`,
    );

    if (payload.status === "failed") {
      return payload;
    }

    return normaliseCompaniesHouseChargesResponse(input.companyNumber, payload.data);
  }

  private async request(path: string): Promise<ProviderResult<unknown>> {
    if (!this.config.apiKey) {
      return createProviderFailure(provider, {
        code: "integration_auth_error",
        message: "Companies House API key is required in live provider mode.",
        retryable: false,
      });
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(`${this.config.baseUrl}${path}`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.config.apiKey}:`).toString("base64")}`,
          Accept: "application/json",
        },
        signal: abortController.signal,
      });

      if (!response.ok) {
        return createProviderFailure(provider, {
          code: response.status === 401 ? "integration_auth_error" : "integration_provider_error",
          message: "Companies House returned an unsuccessful response.",
          retryable: response.status >= 500 || response.status === 429,
          statusCode: response.status,
        });
      }

      return {
        provider,
        status: "success",
        checkedAt: new Date().toISOString(),
        data: (await response.json()) as unknown,
      };
    } catch (error) {
      const isTimeout = error instanceof Error && error.name === "AbortError";

      return createProviderFailure(provider, {
        code: isTimeout ? "integration_timeout" : "integration_network_error",
        message: isTimeout
          ? "Companies House request timed out."
          : "Companies House request failed before a response was received.",
        retryable: true,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}
