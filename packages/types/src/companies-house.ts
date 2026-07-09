import type { ProviderMode, ProviderResult } from "@workspace/integrations";

export interface CompaniesHouseClientConfig {
  mode: ProviderMode;
  baseUrl: string;
  timeoutMs: number;
  apiKey: string | undefined;
}

export interface CompaniesHouseSearchInput {
  query: string;
  itemsPerPage?: number;
}

export interface CompaniesHouseCompanyNumberInput {
  companyNumber: string;
}

export interface CompaniesHouseRegisteredOfficeAddress {
  addressLine_1: string | undefined;
  addressLine_2: string | undefined;
  locality: string | undefined;
  region: string | undefined;
  country: string | undefined;
  postalCode: string | undefined;
  poBox: string | undefined;
}

export interface CompaniesHouseInsolvencyFoundation {
  companiesHouseNumber: string;
  cases: unknown[];
  status: string | undefined;
}

export interface CompaniesHouseCompanySummary {
  companiesHouseNumber: string;
  companyName: string;
  companyStatus: string;
  companyType: string | undefined;
  incorporationDate: string | undefined;
  cessationDate: string | undefined;
  registeredOfficeAddress: CompaniesHouseRegisteredOfficeAddress;
  sicCodes: string[];
  accounts:
    | {
        accounting_reference_date: {
          day: number | undefined;
          month: number | undefined;
        };
        last_accounts: {
          made_up_to: string | undefined;
          period_end_on: string | undefined;
          period_start_on: string | undefined;
          type: string | undefined;
        };
        next_accounts: {
          due_on: string | undefined;
          overdue: boolean | undefined;
          period_end_on: string | undefined;
          period_start_on: string | undefined;
        };
        next_due: string | undefined;
        next_made_up_to: string | undefined;
        overdue: boolean | undefined;
      }
    | undefined;
  has_been_liquidated: boolean | undefined;
  has_charges: boolean | undefined;
  has_insolvency_history: boolean | undefined;
}

export interface CompaniesHouseCompanyProfile extends CompaniesHouseCompanySummary {
  activeDirectorCount: number | undefined;
}

export interface CompaniesHouseSearchResult {
  matches: CompaniesHouseCompanySummary[];
}

export interface CompaniesHouseOfficerCount {
  companiesHouseNumber: string;
  activeDirectorCount: number;
}

export interface CompaniesHouseOfficer {
  name: string;
  role: string | undefined;
  appointedOn: string | undefined;
  resignedOn: string | undefined;
}

export interface CompaniesHouseOfficers {
  companiesHouseNumber: string;
  officers: CompaniesHouseOfficer[];
}

export interface CompaniesHouseAddressHistoryEntry {
  filedAt: string | undefined;
  description: string | undefined;
}

export interface CompaniesHouseAddressHistory {
  companiesHouseNumber: string;
  currentAddress: CompaniesHouseRegisteredOfficeAddress;
  changeFilings: CompaniesHouseAddressHistoryEntry[];
}

export interface CompaniesHouseFilingHistoryFoundation {
  companiesHouseNumber: string;
  filings: unknown[];
}

export interface CompaniesHouseChargesFoundation {
  companiesHouseNumber: string;
  charges: unknown[];
}

export interface CompaniesHouseClient {
  searchCompanies(
    input: CompaniesHouseSearchInput,
  ): Promise<ProviderResult<CompaniesHouseSearchResult>>;
  getCompanyProfile(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseCompanyProfile>>;
  getRegisteredOfficeAddress(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseRegisteredOfficeAddress>>;
  getActiveOfficerCount(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseOfficerCount>>;
  getOfficers(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseOfficers>>;
  getRegisteredOfficeAddressHistory(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseAddressHistory>>;
  getFilingHistory(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseFilingHistoryFoundation>>;
  getCharges(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseChargesFoundation>>;
  getInsolvency(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseInsolvencyFoundation>>;
}
