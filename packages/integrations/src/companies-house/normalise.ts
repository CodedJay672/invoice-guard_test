import { createProviderFailure, createProviderSuccess, type ProviderResult } from "../provider.js";

import type {
  CompaniesHouseChargesFoundation,
  CompaniesHouseCompanyProfile,
  CompaniesHouseCompanySummary,
  CompaniesHouseFilingHistoryFoundation,
  CompaniesHousePagination,
  CompaniesHouseOfficerCount,
  CompaniesHouseOfficers,
  CompaniesHouseInsolvencyFoundation,
  CompaniesHouseRegisteredOfficeAddress,
  CompaniesHouseSearchResult,
  ProviderPayload,
} from "@workspace/types";

const provider = "companies_house";

function asProviderPayload(value: unknown): ProviderPayload | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  try {
    return JSON.parse(JSON.stringify(value)) as ProviderPayload;
  } catch {
    return undefined;
  }
}

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
  confirmation_statement?: {
    last_made_up_to?: unknown;
    next_made_up_to?: unknown;
    next_due?: unknown;
    overdue?: unknown;
  };
  has_been_liquidated?: unknown;
  has_charges?: unknown;
  has_insolvency_history?: unknown;
}

interface RawCompaniesHouseOfficerResponse {
  active_count?: unknown;
  resigned_count?: unknown;
  items?: unknown;
  items_per_page?: unknown;
  start_index?: unknown;
  total_results?: unknown;
}

interface RawCompaniesHouseOfficer {
  name?: unknown;
  officer_role?: unknown;
  appointed_on?: unknown;
  resigned_on?: unknown;
  occupation?: unknown;
  country_of_residence?: unknown;
  nationality?: unknown;
  date_of_birth?: {
    month?: unknown;
    year?: unknown;
  };
  identity_verification_details?: {
    appointment_verification_end_on?: unknown;
    appointment_verification_start_on?: unknown;
    appointment_verification_statement_due_on?: unknown;
    identity_verified_on?: unknown;
    preferred_name?: unknown;
  };
}

interface RawCompaniesHouseListResponse {
  items?: unknown;
  items_per_page?: unknown;
  start_index?: unknown;
  total_count?: unknown;
  total_results?: unknown;
}

interface RawCompaniesHouseInsolvencyResponse {
  cases?: unknown;
  status?: unknown;
}

interface RawCompaniesHouseFiling {
  date?: unknown;
  type?: unknown;
  description?: unknown;
  category?: unknown;
  pages?: unknown;
  transaction_id?: unknown;
  description_values?: unknown;
  subcategory?: unknown;
  barcode?: unknown;
  paper_filed?: unknown;
  annotations?: unknown;
  associated_filings?: unknown;
  resolutions?: unknown;
}

interface RawCompaniesHouseCharge {
  created_on?: unknown;
  delivered_on?: unknown;
  satisfied_on?: unknown;
  status?: unknown;
  charge_code?: unknown;
  classification?: unknown;
  persons_entitled?: unknown;
  particulars?: unknown;
}

interface RawCompaniesHouseInsolvencyCase {
  type?: unknown;
  number?: unknown;
  status?: unknown;
  dates?: unknown;
  practitioners?: unknown;
  notes?: unknown;
}

interface RawCompaniesHouseInsolvencyPractitioner {
  name?: unknown;
  role?: unknown;
  appointed_on?: unknown;
  ceased_to_act_on?: unknown;
  address?: unknown;
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

function pagination(
  response: RawCompaniesHouseListResponse,
  page: number,
  limit: number,
): CompaniesHousePagination {
  const totalResults = asNumber(response.total_results) ?? asNumber(response.total_count) ?? 0;
  return {
    page,
    limit,
    totalResults,
    totalPages: totalResults === 0 ? 0 : Math.ceil(totalResults / limit),
  };
}

function normaliseOptionalAddress(
  value: unknown,
): CompaniesHouseRegisteredOfficeAddress | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  return normaliseAddress(value as RawCompaniesHouseAddress);
}

function normaliseAddress(rawAddress: RawCompaniesHouseAddress | undefined): {
  premises: string | undefined;
  careOf: string | undefined;
  addressLine_1: string | undefined;
  addressLine_2: string | undefined;
  locality: string | undefined;
  region: string | undefined;
  country: string | undefined;
  postalCode: string | undefined;
  poBox: string | undefined;
} {
  return {
    premises: asString(rawAddress?.premises),
    careOf: asString(rawAddress?.care_of),
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

function normaliseDescriptionValues(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entries = Object.entries(value)
    .map(([key, entry]) => [key, asString(entry)] as const)
    .filter((entry): entry is readonly [string, string] => Boolean(entry[1]));
  return entries.length ? Object.fromEntries(entries) : undefined;
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
    confirmationStatement: undefined,
    cessationDate: undefined,
    has_been_liquidated: undefined,
    has_charges: undefined,
    has_insolvency_history: undefined,
    providerPayload: asProviderPayload(item),
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
    cases: Array.isArray(response.cases)
      ? response.cases.map((value) => {
          const item = value as RawCompaniesHouseInsolvencyCase;
          const dates = Array.isArray(item.dates)
            ? item.dates.map((entry) => entry as { date?: unknown; type?: unknown })
            : [];
          return {
            type: asString(item.type),
            number: asString(item.number),
            status: asString(item.status) ?? asString(response.status),
            startedOn: asString(dates[0]?.date),
            practitioners: Array.isArray(item.practitioners)
              ? item.practitioners
                  .map((entry) => {
                    const practitioner = entry as RawCompaniesHouseInsolvencyPractitioner;
                    return {
                      name: asString(practitioner.name),
                      role: asString(practitioner.role),
                      appointedOn: asString(practitioner.appointed_on),
                      ceasedToActOn: asString(practitioner.ceased_to_act_on),
                      address: normaliseOptionalAddress(
                        Array.isArray(practitioner.address)
                          ? practitioner.address[0]
                          : practitioner.address,
                      ),
                    };
                  })
                  .filter((practitioner) => practitioner.name !== undefined)
              : [],
            notes: asStringArray(item.notes),
          };
        })
      : [],
    status: asString(response.status),
    providerPayload: asProviderPayload(payload),
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
    confirmationStatement: rawProfile.confirmation_statement
      ? {
          lastMadeUpTo: asString(rawProfile.confirmation_statement.last_made_up_to),
          nextMadeUpTo: asString(rawProfile.confirmation_statement.next_made_up_to),
          nextDue: asString(rawProfile.confirmation_statement.next_due),
          overdue: asBoolean(rawProfile.confirmation_statement.overdue),
        }
      : undefined,
    cessationDate: asString(rawProfile.date_of_cessation),
    has_been_liquidated: asBoolean(rawProfile.has_been_liquidated),
    has_charges: asBoolean(rawProfile.has_charges),
    has_insolvency_history: asBoolean(rawProfile.has_insolvency_history),
    activeDirectorCount: undefined,
    providerPayload: asProviderPayload(rawProfile),
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
    providerPayload: asProviderPayload(payload),
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
  page = 1,
  limit = 25,
): ProviderResult<CompaniesHouseOfficers> {
  const rawResponse = payload as RawCompaniesHouseOfficerResponse;
  const items = rawResponse.items;
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
        occupation: asString(item.occupation),
        countryOfResidence: asString(item.country_of_residence),
        nationality: asString(item.nationality),
        dateOfBirth: item.date_of_birth
          ? {
              month: asNumber(item.date_of_birth.month),
              year: asNumber(item.date_of_birth.year),
            }
          : undefined,
        identityVerificationDetails: item.identity_verification_details
          ? {
              appointmentVerificationEndOn: asString(
                item.identity_verification_details.appointment_verification_end_on,
              ),
              appointmentVerificationStartOn: asString(
                item.identity_verification_details.appointment_verification_start_on,
              ),
              appointmentVerificationStatementDueOn: asString(
                item.identity_verification_details.appointment_verification_statement_due_on,
              ),
              identityVerifiedOn: asString(item.identity_verification_details.identity_verified_on),
              preferredName: asString(item.identity_verification_details.preferred_name),
            }
          : undefined,
      })),
    activeCount: asNumber(rawResponse.active_count),
    resignedCount: asNumber(rawResponse.resigned_count),
    pagination: pagination(rawResponse, page, limit),
    providerPayload: asProviderPayload(payload),
  });
}

export function normaliseCompaniesHouseFilingHistoryResponse(
  companyNumber: string,
  payload: unknown,
  page = 1,
  limit = 25,
): ProviderResult<CompaniesHouseFilingHistoryFoundation> {
  const items = (payload as RawCompaniesHouseListResponse | undefined)?.items;

  return createProviderSuccess(provider, {
    companiesHouseNumber: companyNumber,
    filings: Array.isArray(items)
      ? items.map((value) => {
          const item = value as RawCompaniesHouseFiling;
          return {
            date: asString(item.date),
            type: asString(item.type),
            description: asString(item.description),
            category: asString(item.category),
            pages: asNumber(item.pages),
            transactionId: asString(item.transaction_id),
            descriptionValues: normaliseDescriptionValues(item.description_values),
            subcategory: asString(item.subcategory),
            barcode: asString(item.barcode),
            paperFiled: asBoolean(item.paper_filed),
            annotations: Array.isArray(item.annotations)
              ? item.annotations.map((entry) => {
                  const value = entry as {
                    annotation?: unknown;
                    date?: unknown;
                    description?: unknown;
                  };
                  return {
                    annotation: asString(value.annotation),
                    date: asString(value.date),
                    description: asString(value.description),
                  };
                })
              : undefined,
            associatedFilings: Array.isArray(item.associated_filings)
              ? item.associated_filings.map((entry) => {
                  const value = entry as { date?: unknown; description?: unknown; type?: unknown };
                  return {
                    date: asString(value.date),
                    description: asString(value.description),
                    type: asString(value.type),
                  };
                })
              : undefined,
            resolutions: Array.isArray(item.resolutions)
              ? item.resolutions.map((entry) => {
                  const value = entry as {
                    category?: unknown;
                    description?: unknown;
                    document_id?: unknown;
                    receive_date?: unknown;
                    subcategory?: unknown;
                    type?: unknown;
                  };
                  return {
                    category: asString(value.category),
                    description: asString(value.description),
                    documentId: asString(value.document_id),
                    receivedOn: asString(value.receive_date),
                    subcategory: asString(value.subcategory),
                    type: asString(value.type),
                  };
                })
              : undefined,
          };
        })
      : [],
    pagination: pagination(payload as RawCompaniesHouseListResponse, page, limit),
    providerPayload: asProviderPayload(payload),
  });
}

export function normaliseCompaniesHouseChargesResponse(
  companyNumber: string,
  payload: unknown,
  page = 1,
  limit = 25,
): ProviderResult<CompaniesHouseChargesFoundation> {
  const items = (payload as RawCompaniesHouseListResponse | undefined)?.items;

  return createProviderSuccess(provider, {
    companiesHouseNumber: companyNumber,
    charges: Array.isArray(items)
      ? items.map((value) => {
          const item = value as RawCompaniesHouseCharge;
          const classification = item.classification as { description?: unknown } | undefined;
          const particulars = item.particulars as { description?: unknown } | undefined;
          const particularsWithFlags = item.particulars as
            | {
                type?: unknown;
                contains_fixed_charge?: unknown;
                contains_floating_charge?: unknown;
                contains_negative_pledge?: unknown;
              }
            | undefined;
          const satisfiedOn = asString(item.satisfied_on);
          return {
            createdOn: asString(item.created_on),
            deliveredOn: asString(item.delivered_on),
            satisfiedOn,
            status: asString(item.status) ?? (satisfiedOn ? "satisfied" : "outstanding"),
            classification: asString(classification?.description),
            personsEntitled: Array.isArray(item.persons_entitled)
              ? item.persons_entitled
                  .map((entry) => asString((entry as { name?: unknown }).name))
                  .filter((v): v is string => Boolean(v))
              : [],
            description: asString(particulars?.description),
            chargeCode: asString(item.charge_code),
            particularsType: asString(particularsWithFlags?.type),
            containsFixedCharge: asBoolean(particularsWithFlags?.contains_fixed_charge),
            containsFloatingCharge: asBoolean(particularsWithFlags?.contains_floating_charge),
            containsNegativePledge: asBoolean(particularsWithFlags?.contains_negative_pledge),
          };
        })
      : [],
    pagination: pagination(payload as RawCompaniesHouseListResponse, page, limit),
    providerPayload: asProviderPayload(payload),
  });
}
