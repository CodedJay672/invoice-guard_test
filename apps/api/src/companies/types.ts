import type {
  CompaniesHouseClient,
  CompaniesHouseCompanyProfile,
  CompaniesHouseCompanySummary,
  InsolvencyDisqualifiedOfficersClient,
  LondonGazetteClient,
  ProviderName,
  ProviderStatus,
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

export type FreePreviewPath = "adverse" | "clean" | "standard";

export type FreePreviewAdverseFlag =
  | "insolvency"
  | "disqualified_director"
  | "gazette_strikeoff"
  | "gazette_windingup";

export interface FreePreviewSourceStatus {
  provider: ProviderName;
  status: ProviderStatus;
  checkedAt: string;
}

export interface FreePreviewFlagsPayload {
  insolvencyFlag: boolean;
  disqualifiedDirectorsFlag: boolean;
  gazetteStrikeoffFlag: boolean;
  gazetteWindingupFlag: boolean;
}

export interface FreePreviewBannerPayload {
  flag: FreePreviewAdverseFlag;
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
  kind: "director_network" | "recent_activity" | "full_clearance";
  heading: string | undefined;
  question: string | undefined;
  blurredAnswer: string | undefined;
  lockTag: string | undefined;
  body: string;
  button: string | undefined;
  smallText: string | undefined;
}

export interface FreePreviewTierCardPayload {
  tier: "basic" | "standard" | "premium";
  name: string;
  price: string;
  includesPdf: boolean;
  includedItems: string[];
  cta: string;
}

export interface FreePreviewPayload {
  company: CompanyPayload;
  companyAge: string | undefined;
  previewPath: FreePreviewPath;
  freeSourceFlags: FreePreviewFlagsPayload;
  adverseBanners: FreePreviewBannerPayload[];
  cleanReassurance: string | undefined;
  courtRecordsPrompt: FreePreviewCourtRecordsPromptPayload;
  curiosityCards: FreePreviewCuriosityCardPayload[];
  tierCards: FreePreviewTierCardPayload[];
  sourceStatuses: FreePreviewSourceStatus[];
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
  londonGazetteClient: LondonGazetteClient;
  insolvencyDisqualifiedOfficersClient: InsolvencyDisqualifiedOfficersClient;
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
