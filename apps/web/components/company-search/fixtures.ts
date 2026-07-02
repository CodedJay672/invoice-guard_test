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
  "preview-ready",
  "standard",
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

const basePreview: FreePreviewPayload = {
  company: {
    ...company,
    industryLabel: "Non-specialised wholesale trade",
    activeDirectorCount: 2,
    lastFetchedAt: "2026-07-02T10:00:00.000Z",
  },
  companyAge: "8 years, 2 months old",
  sourceStatuses: [
    {
      provider: "companies_house",
      status: "success",
      checkedAt: "2026-07-02T10:00:00.000Z",
    },
  ],
  notYetCheckedSources: [
    {
      source: "london_gazette",
      label: "London Gazette notices",
      status: "not_yet_checked",
      message: "Available in paid reports when entitled.",
    },
    {
      source: "insolvency_disqualified_officers",
      label: "Insolvency and disqualified officers",
      status: "not_yet_checked",
      message: "Available in paid reports when entitled.",
    },
    {
      source: "registry_trust",
      label: "Registry Trust court records",
      status: "not_yet_checked",
      message: "Retrieved only after confirmed payment.",
    },
    {
      source: "ai_interpretation",
      label: "AI report interpretation",
      status: "not_yet_checked",
      message: "Generated only for paid reports.",
    },
  ],
  courtRecordsPrompt: {
    label: "COURT RECORDS — NOT YET CHECKED",
    heading: "Has this company ever been taken to court over an unpaid debt?",
    body: "Court records are not included in the free Companies House preview. They are retrieved only after a paid report is purchased.",
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
};

const standardPreview: FreePreviewPayload = {
  ...basePreview,
  company: {
    ...basePreview.company,
    companyStatus: "dissolved",
    activeDirectorCount: 0,
  },
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
  }

  const selectedCompanyBase: SearchFixtureState = {
    ...base,
    query: "acme",
    matches: [company],
    searchStatus: "results",
  };

  switch (fixtureName) {
    case "preview-ready":
      return { ...selectedCompanyBase, preview: basePreview, previewStatus: "ready" };
    case "standard":
      return { ...selectedCompanyBase, preview: standardPreview, previewStatus: "ready" };
    case "ready-cta":
      return {
        ...selectedCompanyBase,
        preview: basePreview,
        previewStatus: "ready",
        tierCtasReady: true,
      };
    default:
      return base;
  }
}

export const fallbackTierCards = tierCards;
