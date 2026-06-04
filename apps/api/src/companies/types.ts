import type {
  CompaniesHouseClient,
  CompaniesHouseCompanyProfile,
  CompaniesHouseCompanySummary,
} from "@workspace/integrations";

export interface CompanyAddressPayload {
  locality: string | undefined;
  region: string | undefined;
  country: string | undefined;
}

export interface CompanyPayload {
  companiesHouseNumber: string;
  companyName: string;
  companyStatus: string;
  companyType: string | undefined;
  incorporationDate: string | undefined;
  registeredOfficeAddress: CompanyAddressPayload;
  sicCodes: string[];
  industryLabel: string | undefined;
  activeDirectorCount: number | undefined;
  lastFetchedAt: string | undefined;
}

export interface CompanySearchMatchPayload {
  companiesHouseNumber: string;
  companyName: string;
  companyStatus: string;
  companyType: string | undefined;
  incorporationDate: string | undefined;
  registeredOfficeAddress: CompanyAddressPayload;
  sicCodes: string[];
}

export interface CompanySearchResponsePayload {
  matches: CompanySearchMatchPayload[];
}

export interface CompanyRepository {
  upsertCompany(profile: CompaniesHouseCompanyProfile): Promise<CompanyPayload>;
}

export interface CompanySearchLogInput {
  clerkUserId: string | undefined;
  ipHash: string | undefined;
  query: string;
  matchedCompaniesCount: number;
  selectedCompaniesHouseNumber: string | undefined;
}

export interface SearchLogRepository {
  recordSearch(input: CompanySearchLogInput): Promise<void>;
}

export interface CompanyServiceDependencies {
  companiesHouseClient: CompaniesHouseClient;
  companyRepository: CompanyRepository;
  searchLogRepository: SearchLogRepository;
}

export function toSearchMatchPayload(
  summary: CompaniesHouseCompanySummary,
): CompanySearchMatchPayload {
  return {
    companiesHouseNumber: summary.companiesHouseNumber,
    companyName: summary.companyName,
    companyStatus: summary.companyStatus,
    companyType: summary.companyType,
    incorporationDate: summary.incorporationDate,
    registeredOfficeAddress: summary.registeredOfficeAddress,
    sicCodes: summary.sicCodes,
  };
}
