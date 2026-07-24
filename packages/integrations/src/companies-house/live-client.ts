import { createProviderFailure, type ProviderMode, type ProviderResult } from "../provider.js";

import {
  normaliseCompaniesHouseChargesResponse,
  normaliseCompaniesHouseFilingHistoryResponse,
  normaliseCompaniesHouseInsolvencyResponse,
  normaliseCompaniesHouseOfficerCountResponse,
  normaliseCompaniesHouseOfficersResponse,
  normaliseCompaniesHouseProfileResponse,
  normaliseCompaniesHouseRegisteredOfficeAddressResponse,
  normaliseCompaniesHouseSearchResponse,
  normaliseCompaniesHouseDisqualifiedOfficerSearchResponse,
  normaliseCompaniesHouseCorporateDisqualifiedOfficerResponse,
  normaliseCompaniesHouseNaturalDisqualifiedOfficerResponse,
} from "./normalise.js";
import type {
  CompaniesHouseChargesFoundation,
  CompaniesHouseClient,
  CompaniesHouseClientConfig,
  CompaniesHouseCompanyNumberInput,
  CompaniesHousePaginatedInput,
  CompaniesHouseCompanyProfile,
  CompaniesHouseFilingHistoryFoundation,
  CompaniesHouseOfficerCount,
  CompaniesHouseOfficers,
  CompaniesHouseAddressHistory,
  CompaniesHouseInsolvencyFoundation,
  CompaniesHouseRegisteredOfficeAddress,
  CompaniesHouseSearchInput,
  CompaniesHouseSearchResult,
  CompaniesHouseDisqualifiedOfficerSearchInput,
  CompaniesHouseDisqualifiedOfficerSearchResult,
  CompaniesHouseCorporateOfficerInput,
  CompaniesHouseCorporateDisqualifiedOfficer,
  CompaniesHouseNaturalOfficerInput,
  CompaniesHouseNaturalDisqualifiedOfficer,
} from "../../../types/src/companies-house.js";

const provider = "companies_house";

export class LiveCompaniesHouseClient implements CompaniesHouseClient {
  readonly mode: ProviderMode = "live";

  readonly provider = provider;

  constructor(private readonly config: CompaniesHouseClientConfig) {}

  async searchCompanies(
    input: CompaniesHouseSearchInput,
  ): Promise<ProviderResult<CompaniesHouseSearchResult>> {
    const payload = await this.request(
      `/alphabetical-search/companies?q=${encodeURIComponent(input.query)}`,
    );

    if (payload.status === "failed") {
      return payload;
    }

    return normaliseCompaniesHouseSearchResponse(payload.data);
  }

  async searchDisqualifiedOfficers(
    input: CompaniesHouseDisqualifiedOfficerSearchInput,
  ): Promise<ProviderResult<CompaniesHouseDisqualifiedOfficerSearchResult>> {
    const itemsPerPage = input.itemsPerPage ?? 10;
    const startIndex = input.startIndex ?? 0;
    const payload = await this.request(
      `/search/disqualified-officers?q=${encodeURIComponent(input.query)}&items_per_page=${itemsPerPage}&start_index=${startIndex}`,
    );
    return payload.status === "failed"
      ? payload
      : normaliseCompaniesHouseDisqualifiedOfficerSearchResponse(
          payload.data,
          input.subtype ?? "corporate",
        );
  }

  async getCorporateDisqualifiedOfficer(
    input: CompaniesHouseCorporateOfficerInput,
  ): Promise<ProviderResult<CompaniesHouseCorporateDisqualifiedOfficer>> {
    const payload = await this.request(
      `/disqualified-officers/corporate/${encodeURIComponent(input.officerId)}`,
    );
    return payload.status === "failed"
      ? payload
      : normaliseCompaniesHouseCorporateDisqualifiedOfficerResponse(payload.data);
  }

  async getNaturalDisqualifiedOfficer(
    input: CompaniesHouseNaturalOfficerInput,
  ): Promise<ProviderResult<CompaniesHouseNaturalDisqualifiedOfficer>> {
    const payload = await this.request(
      `/disqualified-officers/natural/${encodeURIComponent(input.officerId)}`,
    );
    return payload.status === "failed"
      ? payload
      : normaliseCompaniesHouseNaturalDisqualifiedOfficerResponse(payload.data);
  }

  async getCompanyProfile(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseCompanyProfile>> {
    const [profilePayload, officerCount, registeredOfficeAddress] = await Promise.all([
      this.request(`/company/${encodeURIComponent(input.companyNumber)}`),
      this.getActiveOfficerCount(input),
      this.getRegisteredOfficeAddress(input),
    ]);

    if (profilePayload.status === "failed") {
      return profilePayload;
    }

    const profile = normaliseCompaniesHouseProfileResponse(
      profilePayload.data,
      officerCount.status === "success" ? officerCount.data.activeDirectorCount : undefined,
    );

    if (profile.status === "failed") {
      return profile;
    }

    return {
      ...profile,
      data: {
        ...profile.data,
        registeredOfficeAddress:
          registeredOfficeAddress.status === "success"
            ? registeredOfficeAddress.data
            : profile.data.registeredOfficeAddress,
      },
    };
  }

  async getRegisteredOfficeAddress(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseRegisteredOfficeAddress>> {
    const payload = await this.request(
      `/company/${encodeURIComponent(input.companyNumber)}/registered-office-address`,
    );

    return payload.status === "failed"
      ? payload
      : normaliseCompaniesHouseRegisteredOfficeAddressResponse(payload.data);
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

  async getOfficers(
    input: CompaniesHousePaginatedInput,
  ): Promise<ProviderResult<CompaniesHouseOfficers>> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 25;
    const startIndex = (page - 1) * limit;
    const payload = await this.request(
      `/company/${encodeURIComponent(input.companyNumber)}/officers?items_per_page=${limit}&start_index=${startIndex}`,
    );
    return payload.status === "failed"
      ? payload
      : normaliseCompaniesHouseOfficersResponse(input.companyNumber, payload.data, page, limit);
  }

  async getRegisteredOfficeAddressHistory(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseAddressHistory>> {
    const [address, filings] = await Promise.all([
      this.getRegisteredOfficeAddress(input),
      this.request(
        `/company/${encodeURIComponent(input.companyNumber)}/filing-history?category=address&items_per_page=100`,
      ),
    ]);
    if (address.status === "failed") return address;
    if (filings.status === "failed") return filings;
    const items = (filings.data as { items?: unknown }).items;
    return {
      provider,
      status: "success",
      checkedAt: new Date().toISOString(),
      data: {
        companiesHouseNumber: input.companyNumber,
        currentAddress: address.data,
        changeFilings: Array.isArray(items)
          ? items.map((item) => {
              const filing = item as { date?: unknown; description?: unknown };
              return {
                filedAt: typeof filing.date === "string" ? filing.date : undefined,
                description:
                  typeof filing.description === "string" ? filing.description : undefined,
              };
            })
          : [],
      },
    };
  }

  async getFilingHistory(
    input: CompaniesHousePaginatedInput,
  ): Promise<ProviderResult<CompaniesHouseFilingHistoryFoundation>> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 25;
    const payload = await this.request(
      `/company/${encodeURIComponent(input.companyNumber)}/filing-history?items_per_page=${limit}&start_index=${(page - 1) * limit}`,
    );

    if (payload.status === "failed") {
      return payload;
    }

    return normaliseCompaniesHouseFilingHistoryResponse(
      input.companyNumber,
      payload.data,
      page,
      limit,
    );
  }

  async getCharges(
    input: CompaniesHousePaginatedInput,
  ): Promise<ProviderResult<CompaniesHouseChargesFoundation>> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 25;
    const payload = await this.request(
      `/company/${encodeURIComponent(input.companyNumber)}/charges?items_per_page=${limit}&start_index=${(page - 1) * limit}`,
    );

    if (payload.status === "failed") {
      return payload;
    }

    return normaliseCompaniesHouseChargesResponse(input.companyNumber, payload.data, page, limit);
  }

  async getInsolvency(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseInsolvencyFoundation>> {
    const payload = await this.request(
      `/company/${encodeURIComponent(input.companyNumber)}/insolvency`,
    );

    return payload.status === "failed"
      ? payload
      : normaliseCompaniesHouseInsolvencyResponse(input.companyNumber, payload.data);
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
