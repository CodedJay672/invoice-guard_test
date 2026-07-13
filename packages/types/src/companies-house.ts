import type { ProviderMode, ProviderResult } from "@workspace/integrations";
import type { ProviderPayload } from "./company.js";

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

export interface CompaniesHousePaginatedInput extends CompaniesHouseCompanyNumberInput {
  page?: number;
  limit?: number;
}

export interface CompaniesHousePagination {
  page: number;
  limit: number;
  totalResults: number;
  totalPages: number;
}

export interface CompaniesHouseRegisteredOfficeAddress {
  premises?: string | undefined;
  careOf?: string | undefined;
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
  cases: CompaniesHouseInsolvencyCase[];
  status: string | undefined;
  providerPayload?: ProviderPayload | undefined;
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
  confirmationStatement?:
    | {
        lastMadeUpTo: string | undefined;
        nextMadeUpTo: string | undefined;
        nextDue: string | undefined;
        overdue: boolean | undefined;
      }
    | undefined;
  has_charges: boolean | undefined;
  has_insolvency_history: boolean | undefined;
  providerPayload?: ProviderPayload | undefined;
}

export interface CompaniesHouseCompanyProfile extends CompaniesHouseCompanySummary {
  activeDirectorCount: number | undefined;
}

export interface CompaniesHouseSearchResult {
  matches: CompaniesHouseCompanySummary[];
  providerPayload?: ProviderPayload | undefined;
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
  occupation: string | undefined;
  countryOfResidence: string | undefined;
  nationality: string | undefined;
  dateOfBirth:
    | {
        month: number | undefined;
        year: number | undefined;
      }
    | undefined;
  identityVerificationDetails:
    | {
        appointmentVerificationEndOn: string | undefined;
        appointmentVerificationStartOn: string | undefined;
        appointmentVerificationStatementDueOn: string | undefined;
        identityVerifiedOn: string | undefined;
        preferredName: string | undefined;
      }
    | undefined;
}

export interface CompaniesHouseOfficers {
  companiesHouseNumber: string;
  officers: CompaniesHouseOfficer[];
  activeCount: number | undefined;
  resignedCount: number | undefined;
  pagination: CompaniesHousePagination;
  providerPayload?: ProviderPayload | undefined;
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

export interface CompaniesHouseFiling {
  date: string | undefined;
  type: string | undefined;
  description: string | undefined;
  category: string | undefined;
  pages: number | undefined;
  transactionId: string | undefined;
  providerPayload?: ProviderPayload | undefined;
  descriptionValues?: Record<string, string> | undefined;
  subcategory?: string | undefined;
  barcode?: string | undefined;
  paperFiled?: boolean | undefined;
  annotations?:
    | Array<{
        annotation?: string | undefined;
        date?: string | undefined;
        description?: string | undefined;
      }>
    | undefined;
  associatedFilings?:
    | Array<{
        date?: string | undefined;
        description?: string | undefined;
        type?: string | undefined;
      }>
    | undefined;
  resolutions?:
    | Array<{
        category?: string | undefined;
        description?: string | undefined;
        documentId?: string | undefined;
        receivedOn?: string | undefined;
        subcategory?: string | undefined;
        type?: string | undefined;
      }>
    | undefined;
}

export interface CompaniesHouseFilingHistoryFoundation {
  companiesHouseNumber: string;
  filings: CompaniesHouseFiling[];
  pagination: CompaniesHousePagination;
  providerPayload?: ProviderPayload | undefined;
}

export interface CompaniesHouseCharge {
  createdOn: string | undefined;
  deliveredOn: string | undefined;
  satisfiedOn: string | undefined;
  status: string | undefined;
  classification: string | undefined;
  personsEntitled: string[];
  description: string | undefined;
  chargeCode: string | undefined;
  particularsType?: string | undefined;
  containsFixedCharge?: boolean | undefined;
  containsFloatingCharge?: boolean | undefined;
  containsNegativePledge?: boolean | undefined;
}

export interface CompaniesHouseChargesFoundation {
  companiesHouseNumber: string;
  charges: CompaniesHouseCharge[];
  pagination: CompaniesHousePagination;
  providerPayload?: ProviderPayload | undefined;
}

export interface CompaniesHouseInsolvencyCase {
  type: string | undefined;
  number: string | undefined;
  status: string | undefined;
  startedOn: string | undefined;
  practitioners: CompaniesHouseInsolvencyPractitioner[];
  notes: string[];
}

export interface CompaniesHouseInsolvencyPractitioner {
  name: string | undefined;
  role: string | undefined;
  appointedOn: string | undefined;
  ceasedToActOn: string | undefined;
  address: CompaniesHouseRegisteredOfficeAddress | undefined;
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
  getOfficers(input: CompaniesHousePaginatedInput): Promise<ProviderResult<CompaniesHouseOfficers>>;
  getRegisteredOfficeAddressHistory(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseAddressHistory>>;
  getFilingHistory(
    input: CompaniesHousePaginatedInput,
  ): Promise<ProviderResult<CompaniesHouseFilingHistoryFoundation>>;
  getCharges(
    input: CompaniesHousePaginatedInput,
  ): Promise<ProviderResult<CompaniesHouseChargesFoundation>>;
  getInsolvency(
    input: CompaniesHouseCompanyNumberInput,
  ): Promise<ProviderResult<CompaniesHouseInsolvencyFoundation>>;
}
