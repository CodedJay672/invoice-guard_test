export interface CompanyAddressPayload {
  addressLine1?: string | undefined;
  addressLine2?: string | undefined;
  locality?: string | undefined;
  region?: string | undefined;
  country?: string | undefined;
  postalCode?: string | undefined;
  poBox?: string | undefined;
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
}

export interface CompanyPayload extends CompanySearchMatchPayload {
  industryLabel?: string | undefined;
  activeDirectorCount?: number | undefined;
  lastFetchedAt?: string | undefined;
}

export interface CompanySearchResponsePayload {
  matches: CompanySearchMatchPayload[];
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
