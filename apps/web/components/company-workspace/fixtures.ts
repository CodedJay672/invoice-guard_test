import type { FreePreviewPayload } from "@workspace/types";

export type CompanyWorkspaceTab =
  | "overview"
  | "ai-summary"
  | "charges"
  | "insolvency"
  | "officers"
  | "filing-history"
  | "ccj"
  | "fpc";

export type CompanyWorkspaceSourceStatus =
  | "available"
  | "not_yet_checked"
  | "failed"
  | "paid_placeholder";

export type CompanyWorkspaceFixtureName = "populated" | "empty" | "loading" | "failed";

export type CompanyWorkspaceEnvironment = "development" | "test" | "production";

export interface SourceState {
  status: CompanyWorkspaceSourceStatus;
  label: string;
  detail: string;
  checkedAt?: string;
}

export interface WorkspaceFact {
  label: string;
  value: string;
}

export interface FilingRecord {
  date: string;
  type: string;
  description: string;
  category: string;
  pages: string;
}

export interface ChargeRecord {
  createdOn: string;
  status: string;
  classification: string;
  personsEntitled: string;
  description: string;
}

export interface OfficerRecord {
  name: string;
  role: string;
  appointedOn: string;
  resignedOn?: string;
  occupation?: string;
  residence?: string;
}

export interface InsolvencyCaseRecord {
  type: string;
  status: string;
  startedOn: string;
  practitioner: string;
  notes: string;
}

export interface CompanyWorkspaceFixture {
  tab: CompanyWorkspaceTab;
  title: string;
  description: string;
  source: SourceState;
  facts?: WorkspaceFact[] | undefined;
  filings?: FilingRecord[] | undefined;
  charges?: ChargeRecord[] | undefined;
  officers?: OfficerRecord[] | undefined;
  insolvencyCases?: InsolvencyCaseRecord[] | undefined;
  pendingPlaceholder?:
    | {
        title: string;
        body: string;
      }
    | undefined;
  paidPlaceholder?:
    | {
        label: string;
        title: string;
        body: string;
        blurredLines?: string[];
      }
    | undefined;
}

export const companyWorkspaceTabs: Array<{
  id: CompanyWorkspaceTab;
  label: string;
  href: string;
}> = [
  { id: "overview", label: "Overview", href: "overview" },
  { id: "filing-history", label: "Filing History", href: "filing-history" },
  { id: "charges", label: "Charges", href: "charges" },
  { id: "officers", label: "Officers", href: "officers" },
  { id: "insolvency", label: "Insolvency", href: "insolvency" },
  { id: "ccj", label: "CCJs", href: "ccj" },
  { id: "fpc", label: "Fair Payment Code", href: "fpc" },
  { id: "ai-summary", label: "AI Summary", href: "ai-summary" },
];

export const companyWorkspaceFixtureNames: CompanyWorkspaceFixtureName[] = [
  "populated",
  "empty",
  "loading",
  "failed",
];

export const fixtureCompany: FreePreviewPayload["company"] = {
  companiesHouseNumber: "12345678",
  companyName: "ACME SUPPLIES LIMITED",
  companyStatus: "active",
  companyType: "ltd",
  incorporationDate: "2018-04-12",
  cessationDate: "",
  industryLabel: "Non-specialised wholesale trade",
  activeDirectorCount: 2,
  lastFetchedAt: "2026-07-10T09:30:00.000Z",
  sicCodes: ["46900"],
  accounts: {
    accounting_reference_date: { day: 30, month: 4 },
    last_accounts: {
      made_up_to: "2025-04-30",
      period_end_on: "2025-04-30",
      period_start_on: "2024-05-01",
      type: "micro-entity",
    },
    next_accounts: {
      due_on: "2027-01-31",
      overdue: false,
      period_end_on: "2026-04-30",
      period_start_on: "2025-05-01",
    },
    next_due: "2027-01-31",
    next_made_up_to: "2026-04-30",
    overdue: false,
  },
  registeredOfficeAddress: {
    addressLine1: "10 Market Street",
    locality: "Manchester",
    region: "Greater Manchester",
    country: "England",
    postalCode: "M1 1AA",
  },
};

const checkedAt = "2026-07-10T09:30:00.000Z";

export function isCompanyWorkspaceFixtureName(
  value: string | undefined,
): value is CompanyWorkspaceFixtureName {
  return companyWorkspaceFixtureNames.some((name) => name === value);
}

export function resolveCompanyWorkspaceFixtureName(
  value: string | string[] | undefined,
  environment: CompanyWorkspaceEnvironment,
): CompanyWorkspaceFixtureName | undefined {
  if (
    environment === "production" ||
    Array.isArray(value) ||
    !isCompanyWorkspaceFixtureName(value)
  ) {
    return undefined;
  }

  return value;
}

export function getCompanyWorkspaceFixture(
  tab: CompanyWorkspaceTab,
  fixtureName: CompanyWorkspaceFixtureName | undefined,
  environment: CompanyWorkspaceEnvironment,
): CompanyWorkspaceFixture {
  if (isPaidTab(tab)) {
    return paidFixture(tab);
  }

  if (environment === "production") {
    return productionPendingFixture(tab);
  }

  const state = fixtureName ?? "populated";

  if (state === "loading") return loadingFixture(tab);
  if (state === "failed") return failedFixture(tab);
  if (state === "empty") return emptyFixture(tab);

  return populatedFixture(tab);
}

function isPaidTab(tab: CompanyWorkspaceTab): boolean {
  return tab === "ccj" || tab === "fpc" || tab === "ai-summary";
}

function availableSource(): SourceState {
  return {
    status: "available",
    label: "Available from Companies House",
    detail: "Public record position at time of generation",
    checkedAt,
  };
}

function populatedFixture(tab: CompanyWorkspaceTab): CompanyWorkspaceFixture {
  const base = {
    tab,
    source: availableSource(),
  };

  switch (tab) {
    case "overview":
      return {
        ...base,
        title: "Company overview",
        description: "Core profile, address, accounts, and filing indicators from Companies House.",
        facts: [
          { label: "Company number", value: fixtureCompany.companiesHouseNumber },
          { label: "Company status", value: fixtureCompany.companyStatus },
          {
            label: "Company type",
            value: fixtureCompany.companyType?.toUpperCase() ?? "Not listed",
          },
          { label: "Incorporated", value: formatDisplayDate(fixtureCompany.incorporationDate) },
          { label: "Active officers", value: String(fixtureCompany.activeDirectorCount ?? 0) },
          { label: "SIC codes", value: fixtureCompany.sicCodes.join(", ") },
          {
            label: "Next accounts due",
            value: formatDisplayDate(fixtureCompany.accounts?.next_due),
          },
          { label: "Accounts overdue", value: fixtureCompany.accounts?.overdue ? "Yes" : "No" },
        ],
      };
    case "filing-history":
      return {
        ...base,
        title: "Filing history",
        description: "Recent filings returned by Companies House.",
        filings: [
          {
            date: "2026-05-04",
            type: "AA",
            description: "Accounts for a micro company made up to 30 April 2025",
            category: "Accounts",
            pages: "8 pages",
          },
          {
            date: "2026-04-12",
            type: "CS01",
            description: "Confirmation statement made on 12 April 2026 with no updates",
            category: "Confirmation statement",
            pages: "3 pages",
          },
          {
            date: "2025-11-18",
            type: "AP01",
            description: "Appointment of Ms Priya Shah as a director",
            category: "Officers",
            pages: "2 pages",
          },
        ],
      };
    case "charges":
      return {
        ...base,
        title: "Registered charges",
        description: "Charges registered at Companies House.",
        charges: [
          {
            createdOn: "2023-09-14",
            status: "Outstanding",
            classification: "A registered charge",
            personsEntitled: "Example Bank PLC",
            description: "Fixed and floating charge over company assets.",
          },
          {
            createdOn: "2021-02-03",
            status: "Satisfied",
            classification: "Debenture",
            personsEntitled: "Northern Finance Limited",
            description: "Charge satisfied in full on 16 June 2024.",
          },
        ],
      };
    case "officers":
      return {
        ...base,
        title: "Officers",
        description: "Current and resigned officers listed by Companies House.",
        officers: [
          {
            name: "PRIYA SHAH",
            role: "Director",
            appointedOn: "2025-11-18",
            occupation: "Operations Director",
            residence: "England",
          },
          {
            name: "MARTIN HUGHES",
            role: "Director",
            appointedOn: "2018-04-12",
            occupation: "Company Director",
            residence: "United Kingdom",
          },
          {
            name: "ELENA CARTER",
            role: "Director",
            appointedOn: "2019-06-20",
            resignedOn: "2024-12-01",
            occupation: "Finance Consultant",
            residence: "England",
          },
        ],
      };
    case "insolvency":
      return {
        ...base,
        title: "Insolvency",
        description: "Companies House insolvency cases associated with this company.",
        insolvencyCases: [
          {
            type: "Creditors voluntary liquidation",
            status: "Records found",
            startedOn: "2024-03-22",
            practitioner: "Jordan Blake, Example Insolvency LLP",
            notes: "Case details returned by Companies House.",
          },
        ],
      };
    default:
      return paidFixture(tab);
  }
}

function emptyFixture(tab: CompanyWorkspaceTab): CompanyWorkspaceFixture {
  const labels = tabLabels(tab);
  return {
    tab,
    title: labels.title,
    description: labels.description,
    source: availableSource(),
    facts: tab === "overview" ? populatedFixture("overview").facts : undefined,
    filings: tab === "filing-history" ? [] : undefined,
    charges: tab === "charges" ? [] : undefined,
    officers: tab === "officers" ? [] : undefined,
    insolvencyCases: tab === "insolvency" ? [] : undefined,
  };
}

function loadingFixture(tab: CompanyWorkspaceTab): CompanyWorkspaceFixture {
  const labels = tabLabels(tab);
  return {
    tab,
    title: labels.title,
    description: "Checking Companies House.",
    source: {
      status: "available",
      label: "Available from Companies House",
      detail: "Loading public record data.",
    },
  };
}

function failedFixture(tab: CompanyWorkspaceTab): CompanyWorkspaceFixture {
  const labels = tabLabels(tab);
  return {
    tab,
    title: labels.title,
    description: labels.description,
    source: {
      status: "failed",
      label: "Data could not be retrieved",
      detail: "Companies House did not return this tab data in the current check.",
      checkedAt,
    },
  };
}

function productionPendingFixture(tab: CompanyWorkspaceTab): CompanyWorkspaceFixture {
  const labels = tabLabels(tab);
  return {
    tab,
    title: labels.title,
    description: labels.description,
    source: {
      status: "available",
      label: "Available from Companies House",
      detail: "This free tab is reserved for Companies House data and will be wired in 12D.",
    },
    pendingPlaceholder: {
      title: "Companies House tab data pending",
      body: "This free tab will use Companies House data in 12D. No paid source or AI call was made for this placeholder.",
    },
    facts: tab === "overview" ? [] : undefined,
    filings: tab === "filing-history" ? [] : undefined,
    charges: tab === "charges" ? [] : undefined,
    officers: tab === "officers" ? [] : undefined,
    insolvencyCases: tab === "insolvency" ? [] : undefined,
  };
}

function paidFixture(tab: CompanyWorkspaceTab): CompanyWorkspaceFixture {
  if (tab === "ai-summary") {
    return {
      tab,
      title: "AI Summary",
      description: "Paid overview interpretation generated from Companies House overview data.",
      source: {
        status: "paid_placeholder",
        label: "Paid AI summary",
        detail: "No AI call is made for free users.",
      },
      paidPlaceholder: {
        label: "Paid feature",
        title: "AI Summary is available after purchase",
        body: "The paid AI Summary tab summarizes Companies House overview data only. It does not provide legal, financial, or credit advice.",
        blurredLines: [
          "Overview interpretation placeholder",
          "Key profile observations",
          "Source limitations and checked facts",
        ],
      },
    };
  }

  if (tab === "ccj") {
    return {
      tab,
      title: "County Court Judgements",
      description: "Registry Trust court records are checked only after confirmed payment.",
      source: {
        status: "not_yet_checked",
        label: "Source not yet checked",
        detail: "No CCJ conclusion is available in the free company view.",
      },
      paidPlaceholder: {
        label: "Paid source",
        title: "Court records are not yet checked",
        body: "CCJ data is retrieved from Registry Trust only after a paid report is purchased.",
      },
    };
  }

  return {
    tab,
    title: "Fair Payment Code",
    description: "Fair Payment Code status is included only in paid full reports.",
    source: {
      status: "not_yet_checked",
      label: "Source not yet checked",
      detail: "Fair Payment Code is not checked during free search or preview.",
    },
    paidPlaceholder: {
      label: "Paid source",
      title: "Fair Payment Code is not yet checked",
      body: "This source remains paid-only and is not called for free users.",
    },
  };
}

function tabLabels(
  tab: CompanyWorkspaceTab,
): Pick<CompanyWorkspaceFixture, "title" | "description"> {
  switch (tab) {
    case "overview":
      return {
        title: "Company overview",
        description: "Core profile, address, accounts, and filing indicators from Companies House.",
      };
    case "filing-history":
      return {
        title: "Filing history",
        description: "Recent filings returned by Companies House.",
      };
    case "charges":
      return {
        title: "Registered charges",
        description: "Charges registered at Companies House.",
      };
    case "officers":
      return {
        title: "Officers",
        description: "Current and resigned officers listed by Companies House.",
      };
    case "insolvency":
      return {
        title: "Insolvency",
        description: "Companies House insolvency cases associated with this company.",
      };
    case "ai-summary":
      return {
        title: "AI Summary",
        description: "Paid overview interpretation generated from Companies House overview data.",
      };
    case "ccj":
      return {
        title: "County Court Judgements",
        description: "Registry Trust court records are checked only after confirmed payment.",
      };
    case "fpc":
      return {
        title: "Fair Payment Code",
        description: "Fair Payment Code status is included only in paid full reports.",
      };
  }
}

function formatDisplayDate(value: string | undefined): string {
  if (!value) return "Not listed";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
