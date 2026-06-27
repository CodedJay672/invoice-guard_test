import {
  createProviderSuccess,
  type ProviderAdapter,
  type ProviderMode,
  type ProviderResult,
} from "../provider.js";

import type {
  CompaniesHouseChargesFoundation,
  CompaniesHouseClient,
  CompaniesHouseCompanyNumberInput,
  CompaniesHouseCompanyProfile,
  CompaniesHouseFilingHistoryFoundation,
  CompaniesHouseOfficerCount,
  CompaniesHouseInsolvencyFoundation,
  CompaniesHouseRegisteredOfficeAddress,
  CompaniesHouseSearchInput,
  CompaniesHouseSearchResult,
} from "./types.js";

const mockCompanies: CompaniesHouseCompanyProfile[] = [
  {
    companiesHouseNumber: "12345678",
    companyName: "ACME SUPPLIES LIMITED",
    companyStatus: "active",
    companyType: "ltd",
    incorporationDate: "2018-04-12",
    registeredOfficeAddress: {
      locality: "Manchester",
      region: "Greater Manchester",
      country: "England",
    },
    sicCodes: ["46900"],
    activeDirectorCount: 2,
  },
  {
    companiesHouseNumber: "87654321",
    companyName: "NORTHSTAR FABRICATION LTD",
    companyStatus: "active",
    companyType: "ltd",
    incorporationDate: "2015-09-03",
    registeredOfficeAddress: {
      locality: "Bristol",
      region: undefined,
      country: "England",
    },
    sicCodes: ["25110"],
    activeDirectorCount: 1,
  },
  {
    companiesHouseNumber: "SC123456",
    companyName: "RIVER CLYDE DESIGN LIMITED",
    companyStatus: "dissolved",
    companyType: "ltd",
    incorporationDate: "2011-01-24",
    registeredOfficeAddress: {
      locality: "Glasgow",
      region: undefined,
      country: "Scotland",
    },
    sicCodes: ["74100"],
    activeDirectorCount: 0,
  },
];

export class MockCompaniesHouseClient implements CompaniesHouseClient {
  readonly mode: ProviderMode = "mock";

  readonly provider = "companies_house" as const;

  searchCompanies(
    input: CompaniesHouseSearchInput,
  ): Promise<ProviderResult<CompaniesHouseSearchResult>> {
    const query = input.query.trim().toLowerCase();
    const limit = input.itemsPerPage ?? 10;
    const matches = mockCompanies
      .filter(
        (company) =>
          company.companyName.toLowerCase().includes(query) ||
          company.companiesHouseNumber.toLowerCase() === query,
      )
      .slice(0, limit)
      .map(({ activeDirectorCount: _activeDirectorCount, ...summary }) => summary);

    return Promise.resolve(createProviderSuccess(this.provider, { matches }));
  }

  getCompanyProfile(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseCompanyProfile>> {
    const company = findMockCompany(input.companyNumber);

    return Promise.resolve(createProviderSuccess(this.provider, company));
  }

  getActiveOfficerCount(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseOfficerCount>> {
    const company = findMockCompany(input.companyNumber);

    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: company.companiesHouseNumber,
        activeDirectorCount: company.activeDirectorCount ?? 0,
      }),
    );
  }

  getRegisteredOfficeAddress(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseRegisteredOfficeAddress>> {
    return Promise.resolve(
      createProviderSuccess(
        this.provider,
        findMockCompany(input.companyNumber).registeredOfficeAddress,
      ),
    );
  }

  getFilingHistory(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseFilingHistoryFoundation>> {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: input.companyNumber,
        filings: [],
      }),
    );
  }

  getCharges(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseChargesFoundation>> {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: input.companyNumber,
        charges: [],
      }),
    );
  }

  getInsolvency(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseInsolvencyFoundation>> {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: input.companyNumber,
        cases: [],
        status: "none",
      }),
    );
  }
}

export class MockCompaniesHouseSearchAdapter implements ProviderAdapter<
  CompaniesHouseSearchInput,
  CompaniesHouseSearchResult
> {
  readonly provider = "companies_house" as const;

  readonly mode: ProviderMode = "mock";

  private readonly client = new MockCompaniesHouseClient();

  fetch(input: CompaniesHouseSearchInput): Promise<ProviderResult<CompaniesHouseSearchResult>> {
    return this.client.searchCompanies(input);
  }
}

function findMockCompany(companyNumber: string): CompaniesHouseCompanyProfile {
  const normalizedCompanyNumber = companyNumber.trim().toLowerCase();
  const company = mockCompanies.find(
    (item) => item.companiesHouseNumber.toLowerCase() === normalizedCompanyNumber,
  );
  const fallbackCompany = mockCompanies[0];

  if (!fallbackCompany) {
    throw new Error("Mock Companies House fixtures are not configured.");
  }

  return company ?? fallbackCompany;
}
