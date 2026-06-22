import type {
  CompanySearchMatchPayload,
  FreePreviewPayload,
} from "@workspace/validation/companies";

export type SearchStatus =
  | "idle"
  | "typing"
  | "loading"
  | "results"
  | "empty"
  | "invalid"
  | "rate_limited"
  | "error";

export type PreviewStatus = "idle" | "loading" | "ready" | "error";

export const searchFixtureNames = [
  "idle",
  "typing",
  "search-loading",
  "results",
  "no-results",
  "invalid-query",
  "rate-limited",
  "provider-error",
  "preview-loading",
  "clean",
  "adverse",
  "standard",
  "source-failed",
  "ready-cta",
] as const;

export type SearchFixtureName = (typeof searchFixtureNames)[number];

export interface SearchFixtureState {
  query: string;
  matches: CompanySearchMatchPayload[];
  preview: FreePreviewPayload | undefined;
  searchStatus: SearchStatus;
  previewStatus: PreviewStatus;
  message: string | undefined;
  tierCtasReady: boolean;
}

const company: CompanySearchMatchPayload = {
  companiesHouseNumber: "12345678",
  companyName: "ACME SUPPLIES LIMITED",
  companyStatus: "active",
  companyType: "ltd",
  incorporationDate: "2018-04-12",
  registeredOfficeAddress: {
    locality: "Manchester",
    region: "Greater Manchester",
    country: "England",
  },
  sicCodes: ["46900"],
};

const secondCompany: CompanySearchMatchPayload = {
  ...company,
  companiesHouseNumber: "87654321",
  companyName: "ACME SERVICES UK LIMITED",
  registeredOfficeAddress: {
    locality: "Leeds",
    region: "West Yorkshire",
    country: "England",
  },
};

const tierCards: FreePreviewPayload["tierCards"] = [
  {
    tier: "basic",
    name: "Basic",
    price: "£7.99",
    includesPdf: false,
    includedItems: [
      "Court records check",
      "Director names and appointment dates",
      "Registered address history",
    ],
    cta: "Unlock Basic Report",
  },
  {
    tier: "standard",
    name: "Standard",
    price: "£14.99",
    includesPdf: false,
    includedItems: [
      "Everything in Basic",
      "CCJ amounts and satisfaction status",
      "Recent filings and registered charges",
    ],
    cta: "Unlock Standard Report",
  },
  {
    tier: "premium",
    name: "Premium",
    price: "£27.00",
    includesPdf: true,
    includedItems: [
      "Everything in Standard",
      "Director and insolvency depth checks",
      "Branded PDF and timestamped reference",
    ],
    cta: "Unlock Premium Report",
  },
];

const sourceStatuses: FreePreviewPayload["sourceStatuses"] = [
  {
    provider: "companies_house",
    status: "success",
    checkedAt: "2026-06-22T10:00:00.000Z",
  },
  {
    provider: "insolvency_disqualified_officers",
    status: "success",
    checkedAt: "2026-06-22T10:00:01.000Z",
  },
  {
    provider: "london_gazette",
    status: "success",
    checkedAt: "2026-06-22T10:00:02.000Z",
  },
];

const basePreview: FreePreviewPayload = {
  company: {
    ...company,
    industryLabel: "Non-specialised wholesale trade",
    activeDirectorCount: 2,
    lastFetchedAt: "2026-06-22T10:00:00.000Z",
  },
  companyAge: "8 years, 2 months old",
  previewPath: "clean",
  freeSourceFlags: {
    insolvencyFlag: false,
    disqualifiedDirectorsFlag: false,
    gazetteStrikeoffFlag: false,
    gazetteWindingupFlag: false,
  },
  adverseBanners: [],
  cleanReassurance:
    "No insolvency events, director disqualifications, or gazette notices found on the free check.",
  courtRecordsPrompt: {
    label: "COURT RECORDS — NOT YET CHECKED",
    heading: "Has this company ever been taken to court over an unpaid debt?",
    body: "Court records are held separately and are not included in the free check. They are retrieved only after a paid report is purchased.",
    questionLine: "Find out whether this company has CCJs on record.",
    button: "Check the Court Records",
    smallText: "Included in all paid reports. Basic from £7.99.",
  },
  curiosityCards: [
    {
      kind: "director_network",
      question: "How many other UK companies are these directors connected to?",
      blurredAnswer: "Network not yet mapped",
      lockTag: "Unlock to see the full director network",
      body: "Includes active roles, recent resignations, and dissolved-company connections.",
    },
    {
      kind: "recent_activity",
      question: "Has anything changed at this company in the last 12 months?",
      blurredAnswer: "Changes not yet mapped",
      lockTag: "Unlock to see recent activity",
      body: "Covers appointments, resignations, address changes, charges, and account submissions.",
    },
  ],
  tierCards,
  sourceStatuses,
};

const adversePreview: FreePreviewPayload = {
  ...basePreview,
  previewPath: "adverse",
  cleanReassurance: undefined,
  freeSourceFlags: {
    insolvencyFlag: true,
    disqualifiedDirectorsFlag: false,
    gazetteStrikeoffFlag: true,
    gazetteWindingupFlag: false,
  },
  adverseBanners: [
    {
      flag: "insolvency",
      message: "Insolvency or administration records found in the checked source.",
    },
    {
      flag: "gazette_strikeoff",
      message: "A compulsory strike-off notice was found in the London Gazette.",
    },
  ],
  curiosityCards: [],
};

const standardPreview: FreePreviewPayload = {
  ...basePreview,
  company: {
    ...basePreview.company,
    companyStatus: "dissolved",
    activeDirectorCount: 0,
  },
  previewPath: "standard",
  cleanReassurance: undefined,
  curiosityCards: [],
};

const sourceFailedPreview: FreePreviewPayload = {
  ...basePreview,
  previewPath: "source_failed",
  cleanReassurance: undefined,
  freeSourceFlags: {
    insolvencyFlag: false,
    disqualifiedDirectorsFlag: false,
    gazetteStrikeoffFlag: null,
    gazetteWindingupFlag: null,
  },
  curiosityCards: [],
  sourceStatuses: [
    sourceStatuses[0]!,
    sourceStatuses[1]!,
    {
      provider: "london_gazette",
      status: "failed",
      checkedAt: "2026-06-22T10:00:02.000Z",
      message: "Data could not be retrieved",
    },
  ],
};

export function isSearchFixtureName(value: string | undefined): value is SearchFixtureName {
  return searchFixtureNames.some((name) => name === value);
}

export function getSearchFixtureState(
  fixtureName: SearchFixtureName | undefined,
): SearchFixtureState {
  const base: SearchFixtureState = {
    query: "",
    matches: [],
    preview: undefined,
    searchStatus: "idle",
    previewStatus: "idle",
    message: undefined,
    tierCtasReady: false,
  };

  switch (fixtureName) {
    case "typing":
      return { ...base, query: "acme", searchStatus: "typing" };
    case "search-loading":
      return { ...base, query: "acme", searchStatus: "loading" };
    case "results":
      return { ...base, query: "acme", matches: [company, secondCompany], searchStatus: "results" };
    case "no-results":
      return { ...base, query: "unknown company", searchStatus: "empty" };
    case "invalid-query":
      return {
        ...base,
        query: "a",
        searchStatus: "invalid",
        message: "Enter at least 2 characters.",
      };
    case "rate-limited":
      return {
        ...base,
        query: "acme",
        searchStatus: "rate_limited",
        message: "Anonymous search limit reached. Please try again later.",
      };
    case "provider-error":
      return {
        ...base,
        query: "acme",
        searchStatus: "error",
        message: "Company data could not be retrieved right now.",
      };
    case "preview-loading":
      return {
        ...base,
        query: "acme",
        matches: [company],
        searchStatus: "results",
        previewStatus: "loading",
      };
    case "clean":
      return { ...base, preview: basePreview, previewStatus: "ready" };
    case "adverse":
      return { ...base, preview: adversePreview, previewStatus: "ready" };
    case "standard":
      return { ...base, preview: standardPreview, previewStatus: "ready" };
    case "source-failed":
      return { ...base, preview: sourceFailedPreview, previewStatus: "ready" };
    case "ready-cta":
      return {
        ...base,
        preview: basePreview,
        previewStatus: "ready",
        tierCtasReady: true,
      };
    default:
      return base;
  }
}

export const fallbackTierCards = tierCards;
