import type {
  FreeCompanyCharge,
  FreeCompanyTabPayload,
  FreePreviewPayload,
  ProviderPayload,
} from "@workspace/types";

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
  transactionId?: string;
  providerPayload?: ProviderPayload;
  descriptionValues?: Record<string, string>;
  subcategory?: string;
  barcode?: string;
  paperFiled?: boolean;
  annotations?: Array<{
    annotation?: string | undefined;
    date?: string | undefined;
    description?: string | undefined;
  }>;
  associatedFilings?: Array<{
    date?: string | undefined;
    description?: string | undefined;
    type?: string | undefined;
  }>;
  resolutions?: Array<{
    category?: string | undefined;
    description?: string | undefined;
    documentId?: string | undefined;
    receivedOn?: string | undefined;
    subcategory?: string | undefined;
    type?: string | undefined;
  }>;
}

export interface ChargeRecord {
  createdOn: string;
  deliveredOn?: string;
  status: string;
  classification: string;
  personsEntitled: string;
  description: string;
  chargeCode?: string;
  tags?: string[];
  satisfiedOn?: string;
  particularsType?: string;
}

export interface OfficerRecord {
  name: string;
  role: string;
  appointedOn: string;
  resignedOn?: string;
  occupation?: string;
  residence?: string;
  nationality?: string;
  dateOfBirth?: string;
  identityVerificationDueOn?: string;
}

export interface InsolvencyCaseRecord {
  type: string;
  status: string;
  startedOn: string;
  practitioner: string;
  practitioners?: Array<{
    name: string;
    role?: string;
    appointedOn?: string;
    ceasedToActOn?: string;
  }>;
  notes: string;
}

export interface CompanyWorkspaceFixture {
  tab: CompanyWorkspaceTab;
  title: string;
  description: string;
  source: SourceState;
  facts?: WorkspaceFact[] | undefined;
  overviewCompany?: FreePreviewPayload["company"] | undefined;
  providerPayload?: ProviderPayload | undefined;
  filings?: FilingRecord[] | undefined;
  charges?: ChargeRecord[] | undefined;
  officers?: OfficerRecord[] | undefined;
  insolvencyCases?: InsolvencyCaseRecord[] | undefined;
  summary?: string | undefined;
  lockedInterpretation?:
    | {
        title: string;
        body: string;
        blurredLines: string[];
      }
    | undefined;
  pagination?: { page: number; totalPages: number } | undefined;
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
  { id: "ai-summary", label: "AI Summary", href: "ai-summary" },
  { id: "charges", label: "Charges", href: "charges" },
  { id: "insolvency", label: "Insolvency", href: "insolvency" },
  { id: "officers", label: "Officers", href: "officers" },
  { id: "filing-history", label: "Filing History", href: "filing-history" },
  { id: "ccj", label: "CCJs", href: "ccj" },
  { id: "fpc", label: "Fair Payment Code", href: "fpc" },
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
  confirmationStatement: {
    lastMadeUpTo: "2026-04-12",
    nextMadeUpTo: "2027-04-12",
    nextDue: "2027-04-26",
    overdue: false,
  },
  sicDescriptions: ["Non-specialised wholesale trade"],
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

export function toCompanyWorkspaceFixture(payload: FreeCompanyTabPayload): CompanyWorkspaceFixture {
  const base = {
    tab: payload.tab,
    source: {
      status: "available" as const,
      label: "Available from Companies House",
      detail: "Public record returned by Companies House.",
      checkedAt: payload.source.checkedAt,
    },
    providerPayload: payload.providerPayload,
  };
  if (payload.tab === "overview") {
    const company = payload.company;
    return {
      ...base,
      title: "Company overview",
      description: "Core profile, address, accounts, and filing indicators from Companies House.",
      overviewCompany: company,
      facts: [
        { label: "Company number", value: company.companiesHouseNumber },
        { label: "Company status", value: company.companyStatus },
        { label: "Company type", value: company.companyType?.toUpperCase() ?? "Not listed" },
        { label: "Incorporated", value: formatDisplayDate(company.incorporationDate) },
        { label: "Active officers", value: String(company.activeDirectorCount ?? 0) },
        { label: "SIC codes", value: company.sicCodes.join(", ") || "Not listed" },
        { label: "Next accounts due", value: formatDisplayDate(company.accounts?.next_due) },
        { label: "Accounts overdue", value: company.accounts?.overdue ? "Yes" : "No" },
      ],
    };
  }
  if (payload.tab === "filing-history")
    return {
      ...base,
      title: "Filing history",
      description: "Recent filings returned by Companies House.",
      pagination: payload.pagination,
      filings: payload.filings.map((item) => {
        const descriptionValues = {
          ...descriptionValuesForFiling(payload.providerPayload, item.transactionId),
          ...descriptionValuesFromFilingPayload(item.providerPayload),
          ...item.descriptionValues,
        };
        return {
          date: item.date ?? "",
          type: item.type ?? "Not listed",
          description: item.description ?? "Description not listed",
          category: item.category ?? "Not listed",
          pages: item.pages === undefined ? "Not listed" : `${item.pages} pages`,
          ...(item.transactionId ? { transactionId: item.transactionId } : {}),
          ...(item.providerPayload ? { providerPayload: item.providerPayload } : {}),
          ...(Object.keys(descriptionValues).length ? { descriptionValues } : {}),
          ...(item.subcategory ? { subcategory: item.subcategory } : {}),
          ...(item.barcode ? { barcode: item.barcode } : {}),
          ...(item.paperFiled !== undefined ? { paperFiled: item.paperFiled } : {}),
          ...(item.annotations?.length ? { annotations: item.annotations } : {}),
          ...(item.associatedFilings?.length ? { associatedFilings: item.associatedFilings } : {}),
          ...(item.resolutions?.length ? { resolutions: item.resolutions } : {}),
        };
      }),
    };
  if (payload.tab === "charges")
    return {
      ...base,
      title: "Registered charges",
      description: "Charges registered at Companies House.",
      pagination: payload.pagination,
      charges: payload.charges.map((item) => ({
        createdOn: item.createdOn ?? "",
        ...(item.deliveredOn ? { deliveredOn: item.deliveredOn } : {}),
        status: item.status ?? (item.satisfiedOn ? "Satisfied" : "Status not listed"),
        classification: item.classification ?? "Registered charge",
        personsEntitled: item.personsEntitled.join(", ") || "Not listed",
        description: item.description ?? "Description not listed",
        ...(item.chargeCode ? { chargeCode: item.chargeCode } : {}),
        ...(item.satisfiedOn ? { satisfiedOn: item.satisfiedOn } : {}),
        ...(item.particularsType ? { particularsType: item.particularsType } : {}),
        tags: chargeTags(item),
      })),
      summary: `${payload.pagination.totalResults} charge${payload.pagination.totalResults === 1 ? "" : "s"} total`,
      lockedInterpretation: lockedInterpretation("charges"),
    };
  if (payload.tab === "officers")
    return {
      ...base,
      title: "Officers",
      description: "Current and resigned officers listed by Companies House.",
      pagination: payload.pagination,
      officers: payload.officers.map((item) => {
        const dateOfBirth = formatDateOfBirth(item.dateOfBirth);
        return {
          name: item.name,
          role: item.role ?? "Role not listed",
          appointedOn: item.appointedOn ?? "",
          ...(item.resignedOn ? { resignedOn: item.resignedOn } : {}),
          ...(item.occupation ? { occupation: item.occupation } : {}),
          ...(item.countryOfResidence ? { residence: item.countryOfResidence } : {}),
          ...(item.nationality ? { nationality: item.nationality } : {}),
          ...(dateOfBirth ? { dateOfBirth } : {}),
          ...(item.identityVerificationDetails?.appointmentVerificationStatementDueOn
            ? {
                identityVerificationDueOn:
                  item.identityVerificationDetails.appointmentVerificationStatementDueOn,
              }
            : {}),
        };
      }),
      summary: `${payload.activeCount ?? payload.officers.filter((item) => !item.resignedOn).length} active director${(payload.activeCount ?? payload.officers.filter((item) => !item.resignedOn).length) === 1 ? "" : "s"} - ${payload.resignedCount ?? payload.officers.filter((item) => item.resignedOn).length} resignation${(payload.resignedCount ?? payload.officers.filter((item) => item.resignedOn).length) === 1 ? "" : "s"}`,
      lockedInterpretation: lockedInterpretation("officers"),
    };
  return {
    ...base,
    title: "Insolvency",
    description: "Companies House insolvency cases associated with this company.",
    insolvencyCases: payload.cases.map((item) => ({
      type: item.type ?? "Case type not listed",
      status: item.status ?? payload.status ?? "Status not listed",
      startedOn: item.startedOn ?? "",
      practitioner:
        item.practitioners
          .map((practitioner) => practitioner.name)
          .filter((name): name is string => Boolean(name))
          .join(", ") || "Not listed",
      practitioners: item.practitioners
        .filter((practitioner) => practitioner.name)
        .map((practitioner) => ({
          name: practitioner.name ?? "Not listed",
          ...(practitioner.role ? { role: practitioner.role } : {}),
          ...(practitioner.appointedOn ? { appointedOn: practitioner.appointedOn } : {}),
          ...(practitioner.ceasedToActOn ? { ceasedToActOn: practitioner.ceasedToActOn } : {}),
        })),
      notes: item.notes.join(" ") || "No notes supplied.",
    })),
    lockedInterpretation: lockedInterpretation("insolvency"),
  };
}

export function failedCompanyWorkspaceFixture(
  tab: Exclude<CompanyWorkspaceTab, "ccj" | "fpc" | "ai-summary">,
): CompanyWorkspaceFixture {
  return failedFixture(tab);
}

export function descriptionValuesForFiling(
  providerPayload: ProviderPayload | undefined,
  transactionId: string | undefined,
): Record<string, string> | undefined {
  if (!transactionId) return undefined;
  const items = providerPayload?.items;
  if (!Array.isArray(items)) return undefined;
  const rawFiling = items.find(
    (item) =>
      item !== null &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      item.transaction_id === transactionId,
  );
  if (!rawFiling || typeof rawFiling !== "object" || Array.isArray(rawFiling)) return undefined;
  const rawValues = rawFiling.description_values;
  if (!rawValues || typeof rawValues !== "object" || Array.isArray(rawValues)) return undefined;
  const values = Object.entries(rawValues).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === "string" && entry[1].trim().length > 0,
  );
  return values.length ? Object.fromEntries(values) : undefined;
}

export function descriptionValuesFromFilingPayload(
  providerPayload: ProviderPayload | undefined,
): Record<string, string> | undefined {
  const rawValues = providerPayload?.description_values;
  if (!rawValues || typeof rawValues !== "object" || Array.isArray(rawValues)) return undefined;
  const values = Object.entries(rawValues).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === "string" && entry[1].trim().length > 0,
  );
  return values.length ? Object.fromEntries(values) : undefined;
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
        overviewCompany: fixtureCompany,
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
        summary: "1 charge total - 1 outstanding - 0 satisfied",
        charges: [
          {
            createdOn: "2021-08-17",
            deliveredOn: "2021-08-23",
            status: "outstanding",
            classification: "Outstanding Charge",
            personsEntitled: "Swishfund LTD",
            description:
              "Charge over all assets of the company under a fixed and floating arrangement.",
            chargeCode: "1266 2009 0001",
            tags: [
              "Fixed charge",
              "Floating charge",
              "All property and undertaking",
              "Negative pledge",
            ],
          },
        ],
        lockedInterpretation: lockedInterpretation("charges"),
      };
    case "officers":
      return {
        ...base,
        title: "Officers",
        description: "Current and resigned officers listed by Companies House.",
        summary: "2 active directors - 0 resignations",
        officers: [
          {
            name: "BROWN, Daniel Tony",
            role: "Director",
            appointedOn: "2020-06-11",
            occupation: "Company director",
            residence: "United Kingdom",
            nationality: "British",
            dateOfBirth: "May 1985",
            identityVerificationDueOn: "2025-11-18",
          },
          {
            name: "HANLON, Reece Dean",
            role: "Director & PSC",
            appointedOn: "2021-10-18",
            occupation: "Director",
            residence: "England",
            nationality: "British",
            dateOfBirth: "March 1991",
            identityVerificationDueOn: "2025-11-18",
          },
        ],
        lockedInterpretation: lockedInterpretation("officers"),
      };
    case "insolvency":
      return {
        ...base,
        title: "Insolvency",
        description: "Companies House insolvency cases associated with this company.",
        insolvencyCases: [
          {
            type: "Creditors Voluntary Liquidation",
            status: "active",
            startedOn: "2024-02-26",
            practitioner: "Steven Phillip Ross, Allan David Kelly",
            practitioners: [
              { name: "Steven Phillip Ross", appointedOn: "2024-02-26" },
              { name: "Allan David Kelly", appointedOn: "2024-02-26" },
            ],
            notes: "Creditors Voluntary Liquidation (CVL)",
          },
        ],
        lockedInterpretation: lockedInterpretation("insolvency"),
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

function lockedInterpretation(
  tab: "charges" | "insolvency" | "officers",
): NonNullable<CompanyWorkspaceFixture["lockedInterpretation"]> {
  const labels = {
    charges: {
      title: "InvoiceGuard Interpretation",
      body: "Charge interpretation is generated only in paid reports.",
      blurredLines: [
        "This paid interpretation explains the charge holder, security type, and what the registered charge may mean for unpaid invoices.",
        "It uses Companies House charge facts and does not replace legal or financial advice.",
      ],
    },
    insolvency: {
      title: "InvoiceGuard Interpretation",
      body: "Insolvency interpretation is generated only in paid reports.",
      blurredLines: [
        "This paid interpretation explains the insolvency process, practitioner appointments, and source limitations.",
        "It uses Companies House insolvency facts and does not replace legal or financial advice.",
      ],
    },
    officers: {
      title: "InvoiceGuard Interpretation",
      body: "Officer interpretation is generated only in paid reports.",
      blurredLines: [
        "This paid interpretation summarizes director tenure, resignations, verification due dates, and source limitations.",
        "It uses Companies House officer facts and does not replace legal or financial advice.",
      ],
    },
  };

  return labels[tab];
}

function chargeTags(item: FreeCompanyCharge): string[] {
  const text = [item.classification, item.description].filter(Boolean).join(" ").toLowerCase();
  return [
    text.includes("fixed") ? "Fixed charge" : undefined,
    text.includes("floating") ? "Floating charge" : undefined,
    text.includes("undertaking") || text.includes("property")
      ? "All property and undertaking"
      : undefined,
    text.includes("negative pledge") ? "Negative pledge" : undefined,
  ].filter((tag): tag is string => Boolean(tag));
}

function formatDateOfBirth(
  value: { month?: number | undefined; year?: number | undefined } | undefined,
): string | undefined {
  if (!value?.month && !value?.year) return undefined;
  if (!value.month) return value.year ? String(value.year) : undefined;
  const month = new Intl.DateTimeFormat("en-GB", { month: "long" }).format(
    new Date(Date.UTC(2000, value.month - 1, 1)),
  );
  return value.year ? `${month} ${value.year}` : month;
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
