import type { ProviderMode, ProviderResult } from "../provider.js";

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
  locality: string | undefined;
  region: string | undefined;
  country: string | undefined;
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
  registeredOfficeAddress: CompaniesHouseRegisteredOfficeAddress;
  sicCodes: string[];
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
