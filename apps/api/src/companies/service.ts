import type { ProviderFailed } from "@workspace/integrations";

import type {
  CompanyPayload,
  CompanySearchResponsePayload,
  CompanyServiceDependencies,
} from "./types.js";
import { toSearchMatchPayload } from "./types.js";

export class CompanyProviderError extends Error {
  constructor(readonly failure: ProviderFailed) {
    super(failure.errorMessage);
  }
}

export class CompanyService {
  constructor(private readonly dependencies: CompanyServiceDependencies) {}

  async searchCompanies(query: string): Promise<CompanySearchResponsePayload> {
    const result = await this.dependencies.companiesHouseClient.searchCompanies({
      query,
      itemsPerPage: 10,
    });

    if (result.status === "failed") {
      throw new CompanyProviderError(result);
    }

    return {
      matches: result.data.matches.map(toSearchMatchPayload),
    };
  }

  async getCompanyProfile(companyNumber: string): Promise<CompanyPayload> {
    const result = await this.dependencies.companiesHouseClient.getCompanyProfile({
      companyNumber,
    });

    if (result.status === "failed") {
      throw new CompanyProviderError(result);
    }

    return this.dependencies.companyRepository.upsertCompany(result.data);
  }

  async recordSearch(input: {
    clerkUserId: string | undefined;
    ipHash: string | undefined;
    query: string;
    matchedCompaniesCount: number;
    selectedCompaniesHouseNumber: string | undefined;
  }): Promise<void> {
    await this.dependencies.searchLogRepository.recordSearch(input);
  }
}
