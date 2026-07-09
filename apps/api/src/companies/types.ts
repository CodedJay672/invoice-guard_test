import {
  CompaniesHouseClient,
  CompaniesHouseCompanyProfile,
  CompaniesHouseCompanySummary,
  CompaniesHouseRegisteredOfficeAddress,
} from "@workspace/types";
import type {
  CompanyAddressPayload,
  CompanyPayload,
  CompanySearchMatchPayload,
  CompanySearchResponsePayload,
  FreePreviewCourtRecordsPromptPayload,
  FreePreviewCuriosityCardPayload,
  FreePreviewPayload,
  FreePreviewTierCardPayload,
  ReportProductCode,
} from "@workspace/types";
import type { ReportProductRepository } from "../report-products/repository.js";

export type {
  CompanyAddressPayload,
  CompanyPayload,
  CompanySearchMatchPayload,
  CompanySearchResponsePayload,
  FreePreviewCourtRecordsPromptPayload,
  FreePreviewCuriosityCardPayload,
  FreePreviewPayload,
  FreePreviewTierCardPayload,
  ReportProductCode,
};

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
  reportProductRepository: ReportProductRepository;
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
    cessationDate: summary.cessationDate,
    registeredOfficeAddress: toCompanyAddressPayload(summary.registeredOfficeAddress),
    sicCodes: summary.sicCodes,
    accounts: summary.accounts,
  };
}

export function toCompanyAddressPayload(
  address: CompaniesHouseRegisteredOfficeAddress,
): CompanyAddressPayload {
  return {
    addressLine1: address.addressLine_1,
    addressLine2: address.addressLine_2,
    locality: address.locality,
    region: address.region,
    country: address.country,
    postalCode: address.postalCode,
    poBox: address.poBox,
  };
}
