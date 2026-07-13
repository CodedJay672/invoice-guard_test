import type { CompaniesHouseClient, FreeCompanyTab, FreeCompanyTabPayload } from "@workspace/types";

import { CompanyProviderError } from "./service.js";
import type { CompanyRepository } from "./types.js";
import type { CompanyTabCache } from "./tab-cache.js";

export const companyTabCacheTtlSeconds = 15 * 60;

export class CompanyTabService {
  constructor(
    private readonly dependencies: {
      companiesHouseClient: CompaniesHouseClient;
      companyRepository: CompanyRepository;
      cache: CompanyTabCache;
    },
  ) {}

  async getTab(
    companyNumber: string,
    tab: FreeCompanyTab,
    page = 1,
    limit = 25,
  ): Promise<FreeCompanyTabPayload> {
    const cacheKey = `invoiceguard:company-tab:${companyNumber}:${tab}:${page}:${limit}`;
    const cached = await this.dependencies.cache.get(cacheKey);
    if (cached) return cached;

    const payload = await this.fetchTab(companyNumber, tab, page, limit);
    await this.dependencies.cache.set(cacheKey, payload, companyTabCacheTtlSeconds);
    return payload;
  }

  private async fetchTab(
    companyNumber: string,
    tab: FreeCompanyTab,
    page: number,
    limit: number,
  ): Promise<FreeCompanyTabPayload> {
    if (tab === "overview") {
      const result = await this.dependencies.companiesHouseClient.getCompanyProfile({
        companyNumber,
      });
      if (result.status === "failed") throw new CompanyProviderError(result);
      const company = await this.dependencies.companyRepository.upsertCompany(result.data);
      return {
        tab,
        companyNumber: company.companiesHouseNumber,
        source: { provider: "companies_house", checkedAt: result.checkedAt },
        company,
        providerPayload: result.data.providerPayload,
      };
    }
    if (tab === "filing-history") {
      const result = await this.dependencies.companiesHouseClient.getFilingHistory({
        companyNumber,
        page,
        limit,
      });
      if (result.status === "failed") throw new CompanyProviderError(result);
      return {
        tab,
        companyNumber: result.data.companiesHouseNumber,
        source: { provider: "companies_house", checkedAt: result.checkedAt },
        filings: result.data.filings,
        pagination: result.data.pagination,
        providerPayload: result.data.providerPayload,
      };
    }
    if (tab === "charges") {
      const result = await this.dependencies.companiesHouseClient.getCharges({
        companyNumber,
        page,
        limit,
      });
      if (result.status === "failed") throw new CompanyProviderError(result);
      return {
        tab,
        companyNumber: result.data.companiesHouseNumber,
        source: { provider: "companies_house", checkedAt: result.checkedAt },
        charges: result.data.charges,
        pagination: result.data.pagination,
        providerPayload: result.data.providerPayload,
      };
    }
    if (tab === "officers") {
      const result = await this.dependencies.companiesHouseClient.getOfficers({
        companyNumber,
        page,
        limit,
      });
      if (result.status === "failed") throw new CompanyProviderError(result);
      return {
        tab,
        companyNumber: result.data.companiesHouseNumber,
        source: { provider: "companies_house", checkedAt: result.checkedAt },
        officers: result.data.officers,
        activeCount: result.data.activeCount,
        resignedCount: result.data.resignedCount,
        pagination: result.data.pagination,
        providerPayload: result.data.providerPayload,
      };
    }
    const result = await this.dependencies.companiesHouseClient.getInsolvency({ companyNumber });
    if (result.status === "failed") throw new CompanyProviderError(result);
    return {
      tab,
      companyNumber: result.data.companiesHouseNumber,
      source: { provider: "companies_house", checkedAt: result.checkedAt },
      cases: result.data.cases,
      status: result.data.status,
      providerPayload: result.data.providerPayload,
    };
  }
}
