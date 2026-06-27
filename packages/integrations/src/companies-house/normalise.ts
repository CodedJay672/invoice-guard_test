import { createProviderFailure, createProviderSuccess, type ProviderResult } from "../provider.js";

import type {
  CompaniesHouseChargesFoundation,
  CompaniesHouseCompanyProfile,
  CompaniesHouseCompanySummary,
  CompaniesHouseFilingHistoryFoundation,
  CompaniesHouseOfficerCount,
  CompaniesHouseInsolvencyFoundation,
  CompaniesHouseRegisteredOfficeAddress,
  CompaniesHouseSearchResult,
} from "./types.js";

const provider = "companies_house";

interface RawCompaniesHouseAddress {
  locality?: unknown;
  region?: unknown;
  country?: unknown;
}

interface RawCompaniesHouseSearchItem {
  company_number?: unknown;
  company_name?: unknown;
  title?: unknown;
  company_status?: unknown;
  company_type?: unknown;
  date_of_creation?: unknown;
  address?: RawCompaniesHouseAddress;
}

interface RawCompaniesHouseProfile {
  company_number?: unknown;
  company_name?: unknown;
  company_status?: unknown;
  type?: unknown;
  date_of_creation?: unknown;
  registered_office_address?: RawCompaniesHouseAddress;
  sic_codes?: unknown;
}

interface RawCompaniesHouseOfficerResponse {
  active_count?: unknown;
  items?: unknown;
}

interface RawCompaniesHouseListResponse {
  items?: unknown;
}

interface RawCompaniesHouseInsolvencyResponse {
  cases?: unknown;
  status?: unknown;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normaliseAddress(rawAddress: RawCompaniesHouseAddress | undefined): {
  locality: string | undefined;
  region: string | undefined;
  country: string | undefined;
} {
  return {
    locality: asString(rawAddress?.locality),
    region: asString(rawAddress?.region),
    country: asString(rawAddress?.country),
  };
}

function normaliseSearchItem(
  item: RawCompaniesHouseSearchItem,
): CompaniesHouseCompanySummary | null {
  const companiesHouseNumber = asString(item.company_number);
  const companyName = asString(item.company_name) ?? asString(item.title);
  const companyStatus = asString(item.company_status);

  if (!companiesHouseNumber || !companyName || !companyStatus) {
    return null;
  }

  return {
    companiesHouseNumber,
    companyName,
    companyStatus,
    companyType: asString(item.company_type),
    incorporationDate: asString(item.date_of_creation),
    registeredOfficeAddress: normaliseAddress(item.address),
    sicCodes: [],
  };
}

export function normaliseCompaniesHouseRegisteredOfficeAddressResponse(
  payload: unknown,
): ProviderResult<CompaniesHouseRegisteredOfficeAddress> {
  const address = normaliseAddress(payload as RawCompaniesHouseAddress);

  if (!address.locality && !address.region && !address.country) {
    return createProviderFailure(provider, {
      code: "integration_invalid_response",
      message: "Companies House registered office response did not include a usable address.",
      retryable: false,
    });
  }

  return createProviderSuccess(provider, address);
}

export function normaliseCompaniesHouseInsolvencyResponse(
  companyNumber: string,
  payload: unknown,
): ProviderResult<CompaniesHouseInsolvencyFoundation> {
  const response = payload as RawCompaniesHouseInsolvencyResponse;

  return createProviderSuccess(provider, {
    companiesHouseNumber: companyNumber,
    cases: Array.isArray(response.cases) ? response.cases : [],
    status: asString(response.status),
  });
}

function normaliseProfile(
  rawProfile: RawCompaniesHouseProfile,
): CompaniesHouseCompanyProfile | null {
  const companiesHouseNumber = asString(rawProfile.company_number);
  const companyName = asString(rawProfile.company_name);
  const companyStatus = asString(rawProfile.company_status);

  if (!companiesHouseNumber || !companyName || !companyStatus) {
    return null;
  }

  return {
    companiesHouseNumber,
    companyName,
    companyStatus,
    companyType: asString(rawProfile.type),
    incorporationDate: asString(rawProfile.date_of_creation),
    registeredOfficeAddress: normaliseAddress(rawProfile.registered_office_address),
    sicCodes: asStringArray(rawProfile.sic_codes),
    activeDirectorCount: undefined,
  };
}

export function normaliseCompaniesHouseSearchResponse(
  payload: unknown,
): ProviderResult<CompaniesHouseSearchResult> {
  const items = (payload as RawCompaniesHouseListResponse | undefined)?.items;

  if (!Array.isArray(items)) {
    return createProviderFailure(provider, {
      code: "integration_invalid_response",
      message: "Companies House search response did not include a valid items array.",
      retryable: false,
    });
  }

  return createProviderSuccess(provider, {
    matches: items
      .map((item) => normaliseSearchItem(item as RawCompaniesHouseSearchItem))
      .filter((item): item is CompaniesHouseCompanySummary => item !== null),
  });
}

export function normaliseCompaniesHouseProfileResponse(
  payload: unknown,
  activeDirectorCount: number | undefined,
): ProviderResult<CompaniesHouseCompanyProfile> {
  const profile = normaliseProfile(payload as RawCompaniesHouseProfile);

  if (!profile) {
    return createProviderFailure(provider, {
      code: "integration_invalid_response",
      message: "Companies House profile response was missing required company identity fields.",
      retryable: false,
    });
  }

  return createProviderSuccess(provider, {
    ...profile,
    activeDirectorCount,
  });
}

export function normaliseCompaniesHouseOfficerCountResponse(
  companyNumber: string,
  payload: unknown,
): ProviderResult<CompaniesHouseOfficerCount> {
  const rawResponse = payload as RawCompaniesHouseOfficerResponse;
  const activeCount = asNumber(rawResponse.active_count);

  if (activeCount !== undefined) {
    return createProviderSuccess(provider, {
      companiesHouseNumber: companyNumber,
      activeDirectorCount: activeCount,
    });
  }

  if (Array.isArray(rawResponse.items)) {
    return createProviderSuccess(provider, {
      companiesHouseNumber: companyNumber,
      activeDirectorCount: rawResponse.items.length,
    });
  }

  return createProviderFailure(provider, {
    code: "integration_invalid_response",
    message: "Companies House officers response did not include an active officer count.",
    retryable: false,
  });
}

export function normaliseCompaniesHouseFilingHistoryResponse(
  companyNumber: string,
  payload: unknown,
): ProviderResult<CompaniesHouseFilingHistoryFoundation> {
  const items = (payload as RawCompaniesHouseListResponse | undefined)?.items;

  return createProviderSuccess(provider, {
    companiesHouseNumber: companyNumber,
    filings: Array.isArray(items) ? items : [],
  });
}

export function normaliseCompaniesHouseChargesResponse(
  companyNumber: string,
  payload: unknown,
): ProviderResult<CompaniesHouseChargesFoundation> {
  const items = (payload as RawCompaniesHouseListResponse | undefined)?.items;

  return createProviderSuccess(provider, {
    companiesHouseNumber: companyNumber,
    charges: Array.isArray(items) ? items : [],
  });
}
