export interface CompanyAddressPayload {
  premises?: string | undefined;
  careOf?: string | undefined;
  addressLine1?: string | undefined;
  addressLine2?: string | undefined;
  locality?: string | undefined;
  region?: string | undefined;
  country?: string | undefined;
  postalCode?: string | undefined;
  poBox?: string | undefined;
}

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type ProviderPayload = { [key: string]: JsonValue };

export interface CompanyConfirmationStatementPayload {
  lastMadeUpTo?: string | undefined;
  nextMadeUpTo?: string | undefined;
  nextDue?: string | undefined;
  overdue?: boolean | undefined;
}

export interface CompanyAccountsPayload {
  accounting_reference_date: {
    day?: number | undefined;
    month?: number | undefined;
  };
  last_accounts: {
    made_up_to?: string | undefined;
    period_end_on?: string | undefined;
    period_start_on?: string | undefined;
    type?: string | undefined;
  };
  next_accounts: {
    due_on?: string | undefined;
    overdue?: boolean | undefined;
    period_end_on?: string | undefined;
    period_start_on?: string | undefined;
  };
  next_due?: string | undefined;
  next_made_up_to?: string | undefined;
  overdue?: boolean | undefined;
}

export interface CompanySearchMatchPayload {
  companiesHouseNumber: string;
  companyName: string;
  companyStatus: string;
  companyType?: string | undefined;
  incorporationDate?: string | undefined;
  cessationDate?: string | undefined;
  registeredOfficeAddress: CompanyAddressPayload;
  sicCodes: string[];
  accounts?: CompanyAccountsPayload | undefined;
  confirmationStatement?: CompanyConfirmationStatementPayload | undefined;
  sicDescriptions?: string[] | undefined;
  providerPayload?: ProviderPayload | undefined;
}

export interface CompanyPayload extends CompanySearchMatchPayload {
  industryLabel?: string | undefined;
  activeDirectorCount?: number | undefined;
  lastFetchedAt?: string | undefined;
}

export interface CompanySearchResponsePayload {
  matches: CompanySearchMatchPayload[];
  providerPayload?: ProviderPayload | undefined;
}

export type ReportProductCode = "single_report" | "starter_pack" | "business_pack" | "agency_pack";

export interface FreePreviewSourceStatusSuccess {
  provider: "companies_house";
  status: "success";
  checkedAt: string;
}

export interface FreePreviewSourceStatusFailed {
  provider: "companies_house";
  status: "failed";
  checkedAt: string;
  message: "Data could not be retrieved";
}

export type FreePreviewSourceStatus =
  | FreePreviewSourceStatusSuccess
  | FreePreviewSourceStatusFailed;

export interface FreePreviewNotYetCheckedSource {
  source:
    | "london_gazette"
    | "insolvency_disqualified_officers"
    | "registry_trust"
    | "fair_payment_code"
    | "ai_interpretation";
  label: string;
  status: "not_yet_checked";
  message: string;
}

export interface FreePreviewCourtRecordsPromptPayload {
  label: string;
  heading: string;
  body: string;
  questionLine: string;
  button: string;
  smallText: string;
}

export interface FreePreviewCuriosityCardPayload {
  kind: "director_network" | "recent_activity";
  heading?: string | undefined;
  question?: string | undefined;
  blurredAnswer?: string | undefined;
  lockTag?: string | undefined;
  body: string;
  button?: string | undefined;
  smallText?: string | undefined;
}

export interface FreePreviewTierCardPayload {
  tier: ReportProductCode;
  name: string;
  price: string;
  pricePence: number;
  creditQuantity: number;
  includesPdf: boolean;
  includedItems: string[];
  cta: string;
}

export interface FreePreviewPayload {
  company: CompanyPayload;
  companyAge?: string | undefined;
  notYetCheckedSources: FreePreviewNotYetCheckedSource[];
  courtRecordsPrompt: FreePreviewCourtRecordsPromptPayload;
  curiosityCards: FreePreviewCuriosityCardPayload[];
  tierCards: FreePreviewTierCardPayload[];
  sourceStatuses: FreePreviewSourceStatus[];
}

export type FreeCompanyTab = "overview" | "filing-history" | "charges" | "officers" | "insolvency";

export interface FreeCompanyTabSource {
  provider: "companies_house";
  checkedAt: string;
}

export interface FreeCompanyTabPagination {
  page: number;
  limit: number;
  totalResults: number;
  totalPages: number;
}

export interface FreeCompanyFiling {
  date?: string | undefined;
  type?: string | undefined;
  description?: string | undefined;
  category?: string | undefined;
  pages?: number | undefined;
  transactionId?: string | undefined;
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

export interface FreeCompanyCharge {
  createdOn?: string | undefined;
  deliveredOn?: string | undefined;
  satisfiedOn?: string | undefined;
  status?: string | undefined;
  classification?: string | undefined;
  personsEntitled: string[];
  description?: string | undefined;
  chargeCode?: string | undefined;
  particularsType?: string | undefined;
  containsFixedCharge?: boolean | undefined;
  containsFloatingCharge?: boolean | undefined;
  containsNegativePledge?: boolean | undefined;
}

export interface FreeCompanyOfficer {
  name: string;
  role?: string | undefined;
  appointedOn?: string | undefined;
  resignedOn?: string | undefined;
  occupation?: string | undefined;
  countryOfResidence?: string | undefined;
  nationality?: string | undefined;
  dateOfBirth?:
    | {
        month?: number | undefined;
        year?: number | undefined;
      }
    | undefined;
  identityVerificationDetails?:
    | {
        appointmentVerificationEndOn?: string | undefined;
        appointmentVerificationStartOn?: string | undefined;
        appointmentVerificationStatementDueOn?: string | undefined;
        identityVerifiedOn?: string | undefined;
        preferredName?: string | undefined;
      }
    | undefined;
}

export interface FreeCompanyInsolvencyCase {
  type?: string | undefined;
  number?: string | undefined;
  status?: string | undefined;
  startedOn?: string | undefined;
  practitioners: FreeCompanyInsolvencyPractitioner[];
  notes: string[];
}

export interface FreeCompanyInsolvencyPractitioner {
  name?: string | undefined;
  role?: string | undefined;
  appointedOn?: string | undefined;
  ceasedToActOn?: string | undefined;
  address?: CompanyAddressPayload | undefined;
}

export type FreeCompanyTabPayload =
  | {
      tab: "overview";
      companyNumber: string;
      source: FreeCompanyTabSource;
      company: CompanyPayload;
      providerPayload?: ProviderPayload | undefined;
    }
  | {
      tab: "filing-history";
      companyNumber: string;
      source: FreeCompanyTabSource;
      filings: FreeCompanyFiling[];
      pagination: FreeCompanyTabPagination;
      providerPayload?: ProviderPayload | undefined;
    }
  | {
      tab: "charges";
      companyNumber: string;
      source: FreeCompanyTabSource;
      charges: FreeCompanyCharge[];
      pagination: FreeCompanyTabPagination;
      providerPayload?: ProviderPayload | undefined;
    }
  | {
      tab: "officers";
      companyNumber: string;
      source: FreeCompanyTabSource;
      officers: FreeCompanyOfficer[];
      activeCount?: number | undefined;
      resignedCount?: number | undefined;
      pagination: FreeCompanyTabPagination;
      providerPayload?: ProviderPayload | undefined;
    }
  | {
      tab: "insolvency";
      companyNumber: string;
      source: FreeCompanyTabSource;
      cases: FreeCompanyInsolvencyCase[];
      status?: string | undefined;
      providerPayload?: ProviderPayload | undefined;
    };
