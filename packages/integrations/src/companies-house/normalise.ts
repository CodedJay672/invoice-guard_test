import { createProviderFailure, createProviderSuccess, type ProviderResult } from "../provider.js";

import type {
  CompaniesHouseChargesFoundation,
  CompaniesHouseCompanyProfile,
  CompaniesHouseCompanySummary,
  CompaniesHouseFilingHistoryFoundation,
  CompaniesHouseOfficerCount,
  CompaniesHouseOfficers,
  CompaniesHouseInsolvencyFoundation,
  CompaniesHouseRegisteredOfficeAddress,
  CompaniesHouseSearchResult,
} from "../../../types/src/companies-house.js";

const provider = "companies_house";

interface RawCompaniesHouseAddress {
  address_line_1: unknown;
  address_line_2: unknown;
  care_of: unknown;
  country: unknown;
  locality: unknown;
  po_box: unknown;
  postal_code: unknown;
  premises: unknown;
  region: unknown;
}

interface RawCompaniesHouseAccount {
  accounting_reference_date?: {
    day?: unknown;
    month?: unknown;
  };
  last_accounts?: {
    made_up_to?: unknown;
    period_end_on?: unknown;
    period_start_on?: unknown;
    type?: unknown;
  };
  next_accounts?: {
    due_on?: unknown;
    overdue?: unknown;
    period_end_on?: unknown;
    period_start_on?: unknown;
  };
  next_due?: unknown;
  next_made_up_to?: unknown;
  overdue?: unknown;
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
  date_of_cessation?: unknown;
  registered_office_address?: RawCompaniesHouseAddress;
  sic_codes?: unknown;
  accounts?: RawCompaniesHouseAccount;
  has_been_liquidated?: unknown;
  has_charges?: unknown;
  has_insolvency_history?: unknown;
}

interface RawCompaniesHouseOfficerResponse {
  active_count?: unknown;
  items?: unknown;
}

interface RawCompaniesHouseOfficer {
  name?: unknown;
  officer_role?: unknown;
  appointed_on?: unknown;
  resigned_on?: unknown;
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
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function normaliseAddress(rawAddress: RawCompaniesHouseAddress | undefined): {
  addressLine_1: string | undefined;
  addressLine_2: string | undefined;
  locality: string | undefined;
  region: string | undefined;
  country: string | undefined;
  postalCode: string | undefined;
  poBox: string | undefined;
} {
  return {
    addressLine_1: asString(rawAddress?.address_line_1),
    addressLine_2: asString(rawAddress?.address_line_2),
    locality: asString(rawAddress?.locality),
    region: asString(rawAddress?.region),
    country: asString(rawAddress?.country),
    postalCode: asString(rawAddress?.postal_code),
    poBox: asString(rawAddress?.po_box),
  };
}

function normaliseAccounts(
  rawAccounts: RawCompaniesHouseAccount | undefined,
): CompaniesHouseCompanySummary["accounts"] {
  if (!rawAccounts || typeof rawAccounts !== "object") {
    return undefined;
  }

  return {
    accounting_reference_date: {
      day: asNumber(rawAccounts.accounting_reference_date?.day),
      month: asNumber(rawAccounts.accounting_reference_date?.month),
    },
    last_accounts: {
      made_up_to: asString(rawAccounts.last_accounts?.made_up_to),
      period_end_on: asString(rawAccounts.last_accounts?.period_end_on),
      period_start_on: asString(rawAccounts.last_accounts?.period_start_on),
      type: asString(rawAccounts.last_accounts?.type),
    },
    next_accounts: {
      due_on: asString(rawAccounts.next_accounts?.due_on),
      overdue: asBoolean(rawAccounts.next_accounts?.overdue),
      period_end_on: asString(rawAccounts.next_accounts?.period_end_on),
      period_start_on: asString(rawAccounts.next_accounts?.period_start_on),
    },
    next_due: asString(rawAccounts.next_due),
    next_made_up_to: asString(rawAccounts.next_made_up_to),
    overdue: asBoolean(rawAccounts.overdue),
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
    accounts: undefined,
    cessationDate: undefined,
    has_been_liquidated: undefined,
    has_charges: undefined,
    has_insolvency_history: undefined,
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
    accounts: normaliseAccounts(rawProfile.accounts),
    cessationDate: asString(rawProfile.date_of_cessation),
    has_been_liquidated: rawProfile.has_been_liquidated as boolean,
    has_charges: rawProfile.has_charges as boolean,
    has_insolvency_history: rawProfile.has_insolvency_history as boolean,
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

export function normaliseCompaniesHouseOfficersResponse(
  companyNumber: string,
  payload: unknown,
): ProviderResult<CompaniesHouseOfficers> {
  const items = (payload as RawCompaniesHouseOfficerResponse).items;
  if (!Array.isArray(items)) {
    return createProviderFailure(provider, {
      code: "integration_invalid_response",
      message: "Companies House officers response did not include an items array.",
      retryable: false,
    });
  }
  return createProviderSuccess(provider, {
    companiesHouseNumber: companyNumber,
    officers: items
      .map((item) => item as RawCompaniesHouseOfficer)
      .filter((item) => asString(item.name) !== undefined)
      .map((item) => ({
        name: asString(item.name)!,
        role: asString(item.officer_role),
        appointedOn: asString(item.appointed_on),
        resignedOn: asString(item.resigned_on),
      })),
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
