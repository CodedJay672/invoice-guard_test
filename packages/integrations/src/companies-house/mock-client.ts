import {
  createProviderSuccess,
  type ProviderAdapter,
  type ProviderMode,
  type ProviderResult,
} from "@workspace/types";

import type {
  CompaniesHouseChargesFoundation,
  CompaniesHouseClient,
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
} from "@workspace/types";

const mockCompanies: CompaniesHouseCompanyProfile[] = [
  {
    companiesHouseNumber: "12345678",
    companyName: "ACME SUPPLIES LIMITED",
    companyStatus: "active",
    companyType: "ltd",
    incorporationDate: "2018-04-12",
    accounts: undefined,
    cessationDate: "",
    has_been_liquidated: false,
    has_charges: false,
    has_insolvency_history: false,
    registeredOfficeAddress: {
      addressLine_1: "",
      addressLine_2: "",
      poBox: "",
      postalCode: "",
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
    accounts: undefined,
    cessationDate: "",
    has_been_liquidated: false,
    has_charges: false,
    has_insolvency_history: false,
    registeredOfficeAddress: {
      addressLine_1: "",
      addressLine_2: "",
      poBox: "",
      postalCode: "",
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
    accounts: undefined,
    cessationDate: "",
    has_been_liquidated: false,
    has_charges: false,
    has_insolvency_history: false,
    registeredOfficeAddress: {
      addressLine_1: "",
      addressLine_2: "",
      poBox: "",
      postalCode: "",
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

  getOfficers(
    input: CompaniesHousePaginatedInput,
  ): Promise<ProviderResult<CompaniesHouseOfficers>> {
    const company = findMockCompany(input.companyNumber);
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: company.companiesHouseNumber,
        officers: Array.from({ length: company.activeDirectorCount ?? 0 }, (_, index) => ({
          name: `MOCK DIRECTOR ${index + 1}`,
          role: "director",
          appointedOn: "2020-01-01",
          resignedOn: undefined,
          occupation: "Company director",
          countryOfResidence: "United Kingdom",
          nationality: "British",
          dateOfBirth: { month: 6, year: 1985 },
          identityVerificationDetails: {
            appointmentVerificationEndOn: undefined,
            appointmentVerificationStartOn: undefined,
            appointmentVerificationStatementDueOn: "2025-11-18",
            identityVerifiedOn: undefined,
            preferredName: undefined,
          },
        })),
        activeCount: company.activeDirectorCount ?? 0,
        resignedCount: 0,
        pagination: {
          page: input.page ?? 1,
          limit: input.limit ?? 25,
          totalResults: company.activeDirectorCount ?? 0,
          totalPages: (company.activeDirectorCount ?? 0) ? 1 : 0,
        },
      }),
    );
  }

  getRegisteredOfficeAddressHistory(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseAddressHistory>> {
    const company = findMockCompany(input.companyNumber);
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: company.companiesHouseNumber,
        currentAddress: company.registeredOfficeAddress,
        changeFilings: [],
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
    input: CompaniesHousePaginatedInput,
  ): Promise<ProviderResult<CompaniesHouseFilingHistoryFoundation>> {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: input.companyNumber,
        filings: [],
        pagination: {
          page: input.page ?? 1,
          limit: input.limit ?? 25,
          totalResults: 0,
          totalPages: 0,
        },
      }),
    );
  }

  getCharges(
    input: CompaniesHousePaginatedInput,
  ): Promise<ProviderResult<CompaniesHouseChargesFoundation>> {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        companiesHouseNumber: input.companyNumber,
        charges: [],
        pagination: {
          page: input.page ?? 1,
          limit: input.limit ?? 25,
          totalResults: 0,
          totalPages: 0,
        },
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

  searchDisqualifiedOfficers(
    input: import("@workspace/types").CompaniesHouseDisqualifiedOfficerSearchInput,
  ): Promise<
    ProviderResult<import("@workspace/types").CompaniesHouseDisqualifiedOfficerSearchResult>
  > {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        items: [],
        itemsPerPage: input.itemsPerPage ?? 10,
        startIndex: input.startIndex ?? 0,
        totalResults: 0,
        providerPayload: {
          items: [],
          items_per_page: input.itemsPerPage ?? 10,
          start_index: input.startIndex ?? 0,
          total_results: 0,
        },
      }),
    );
  }

  getCorporateDisqualifiedOfficer(
    input: import("@workspace/types").CompaniesHouseCorporateOfficerInput,
  ): Promise<
    ProviderResult<import("@workspace/types").CompaniesHouseCorporateDisqualifiedOfficer>
  > {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        name: "Example Corporate Officer",
        companyNumber: "00000000",
        countryOfRegistration: "United Kingdom",
        personNumber: input.officerId,
        kind: "corporate-disqualification",
        disqualifications: [],
        permissionsToAct: [],
        providerPayload: { name: "Example Corporate Officer", person_number: input.officerId },
      }),
    );
  }

  getNaturalDisqualifiedOfficer(
    input: import("@workspace/types").CompaniesHouseNaturalOfficerInput,
  ): Promise<ProviderResult<import("@workspace/types").CompaniesHouseNaturalDisqualifiedOfficer>> {
    return Promise.resolve(
      createProviderSuccess(this.provider, {
        forename: "Example",
        surname: "Officer",
        personNumber: input.officerId,
        kind: "natural-disqualification",
        disqualifications: [],
        permissionsToAct: [],
        providerPayload: {
          forename: "Example",
          surname: "Officer",
          person_number: input.officerId,
        },
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
