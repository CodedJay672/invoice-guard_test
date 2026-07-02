export const paidReportTiers = ["basic", "standard", "premium"] as const;

export type PaidReportTier = (typeof paidReportTiers)[number];

export const paidReportFixtureNames = [
  "complete",
  "partial",
  "foundational-failure",
  "source-statuses",
  "registry-recheck",
  "registry-escalation",
  "ai-loading",
  "ai-ready",
  "ai-unavailable",
  "ai-partial",
  "ai-safety-fallback",
] as const;

export type PaidReportFixtureName = (typeof paidReportFixtureNames)[number];

export type PaidSourceStatus =
  | { status: "success"; label: string; checkedAt: string; detail: string }
  | { status: "failed"; label: string; checkedAt: string; detail: string }
  | { status: "unavailable"; label: string; detail: string }
  | { status: "stale"; label: string; checkedAt: string; detail: string }
  | { status: "pending"; label: string; detail: string }
  | { status: "not_entitled"; label: string; detail: string };

export type AiInterpretation =
  | { status: "loading"; heading: string; message: string }
  | { status: "ready"; heading: string; generatedAt: string; paragraphs: string[] }
  | {
      status: "partial_source";
      heading: string;
      generatedAt: string;
      unavailableSources: string[];
      paragraphs: string[];
    }
  | { status: "unavailable"; heading: string; message: string }
  | { status: "safety_fallback"; heading: string; message: string };

export interface PaidReportFact {
  label: string;
  value: string;
}

export interface PaidReportSection {
  id: string;
  title: string;
  description: string;
  facts: PaidReportFact[];
}

export type RegistryRecovery =
  | { kind: "free_recheck"; message: string; actionLabel: string }
  | { kind: "premium_escalation"; message: string; actionLabel: string };

export interface PaidReportFixture {
  tier: PaidReportTier;
  tierLabel: string;
  companyName: string;
  companyNumber: string;
  reportReference: string;
  generatedAt: string;
  outcome: "complete" | "partial" | "refund_required";
  sources: PaidSourceStatus[];
  sections: PaidReportSection[];
  interpretation: AiInterpretation;
  recovery?: RegistryRecovery;
}

const checkedAt = "2 July 2026, 10:00 BST";

const companyOverview: PaidReportSection = {
  id: "company-overview",
  title: "Company overview",
  description: "Canonical identity and current Companies House position.",
  facts: [
    { label: "Company status", value: "Active" },
    { label: "Incorporated", value: "12 April 2018" },
    { label: "Registered area", value: "Manchester, Greater Manchester" },
    { label: "Industry", value: "Non-specialised wholesale trade" },
  ],
};

const basicSections: PaidReportSection[] = [
  companyOverview,
  {
    id: "court-records",
    title: "Court records",
    description: "Registry Trust records included with every paid report.",
    facts: [
      { label: "County Court Judgements", value: "1 record found" },
      { label: "Court and year", value: "Manchester County Court, 2024" },
    ],
  },
  {
    id: "directors",
    title: "Directors",
    description: "Current Companies House appointments.",
    facts: [
      { label: "Active directors", value: "2" },
      { label: "Appointments", value: "A. Morgan — 2018; J. Patel — 2021" },
    ],
  },
  {
    id: "address-history",
    title: "Registered address history",
    description: "Recorded registered-office changes.",
    facts: [
      { label: "Current address since", value: "18 September 2022" },
      { label: "Previous registered offices", value: "1 recorded address" },
    ],
  },
];

const standardSections: PaidReportSection[] = [
  ...basicSections.map((section) =>
    section.id === "court-records"
      ? {
          ...section,
          facts: [
            ...section.facts,
            { label: "Judgement amount", value: "£2,460" },
            { label: "Satisfaction status", value: "Not shown as satisfied" },
          ],
        }
      : section,
  ),
  {
    id: "filing-compliance",
    title: "Recent filing compliance",
    description: "Recent accounts and confirmation-statement position.",
    facts: [
      { label: "Latest accounts", value: "Filed on time" },
      { label: "Confirmation statement", value: "Next due 18 November 2026" },
    ],
  },
  {
    id: "registered-charges",
    title: "Registered charges",
    description: "Charges recorded at Companies House.",
    facts: [
      { label: "Outstanding charges", value: "1" },
      { label: "Charge holder", value: "Example Commercial Bank plc" },
    ],
  },
];

const premiumSections: PaidReportSection[] = [
  ...standardSections,
  {
    id: "director-depth",
    title: "Director and related-company checks",
    description: "Deeper appointment and related-company records.",
    facts: [
      { label: "Other active appointments", value: "3 across 2 directors" },
      { label: "Related insolvency records", value: "No records found in checked sources" },
    ],
  },
  {
    id: "fair-payment-code",
    title: "Fair Payment Code",
    description: "Small Business Commissioner public status.",
    facts: [{ label: "Membership", value: "No current award found" }],
  },
  {
    id: "confidence-indicator",
    title: "Evidence coverage",
    description: "Completeness of the sources checked for this report, not a risk score.",
    facts: [{ label: "Source coverage", value: "All entitled sources completed" }],
  },
];

const readyInterpretation: AiInterpretation = {
  status: "ready",
  heading: "AI interpretation",
  generatedAt: checkedAt,
  paragraphs: [
    "ACME SUPPLIES LIMITED is an active private company incorporated in 2018. Its recent Companies House filing position is shown as up to date in the records checked for this report.",
    "One County Court Judgement from 2024 was found in the Registry Trust data checked. The report records the judgement details separately; this interpretation does not make a credit decision or provide financial or legal advice.",
  ],
};

function baseSources(tier: PaidReportTier): PaidSourceStatus[] {
  return [
    {
      status: "success",
      label: "Companies House",
      checkedAt,
      detail: "Company profile, officers, filings and charges retrieved.",
    },
    {
      status: "success",
      label: "Registry Trust court records",
      checkedAt,
      detail: "Court records check completed after confirmed payment.",
    },
    {
      status: tier === "basic" ? "not_entitled" : "success",
      label: "London Gazette",
      ...(tier === "basic"
        ? { detail: "This source is not included in the Basic report." }
        : { checkedAt, detail: "Relevant notices check completed." }),
    } as PaidSourceStatus,
    {
      status: tier === "premium" ? "success" : "not_entitled",
      label: "Insolvency and disqualified officers",
      ...(tier === "premium"
        ? { checkedAt, detail: "Premium depth check completed." }
        : {
            detail: `This source is not included in the ${tier === "basic" ? "Basic" : "Standard"} report.`,
          }),
    } as PaidSourceStatus,
    {
      status: tier === "premium" ? "success" : "not_entitled",
      label: "Fair Payment Code",
      ...(tier === "premium"
        ? { checkedAt, detail: "Public award status retrieved." }
        : {
            detail: `This source is not included in the ${tier === "basic" ? "Basic" : "Standard"} report.`,
          }),
    } as PaidSourceStatus,
  ];
}

function sectionsForTier(tier: PaidReportTier): PaidReportSection[] {
  if (tier === "premium") return premiumSections;
  if (tier === "standard") return standardSections;
  return basicSections;
}

function tierLabel(tier: PaidReportTier): string {
  return `${tier.charAt(0).toUpperCase()}${tier.slice(1)}`;
}

export function resolvePaidReportTier(value: string | undefined): PaidReportTier {
  return paidReportTiers.includes(value as PaidReportTier) ? (value as PaidReportTier) : "basic";
}

export function resolvePaidReportFixtureName(value: string | undefined): PaidReportFixtureName {
  return paidReportFixtureNames.includes(value as PaidReportFixtureName)
    ? (value as PaidReportFixtureName)
    : "complete";
}

export function getPaidReportFixture(
  tier: PaidReportTier,
  fixtureName: PaidReportFixtureName,
): PaidReportFixture {
  const fixture: PaidReportFixture = {
    tier,
    tierLabel: tierLabel(tier),
    companyName: "ACME SUPPLIES LIMITED",
    companyNumber: "12345678",
    reportReference: "IG-2026-000184",
    generatedAt: checkedAt,
    outcome: "complete",
    sources: baseSources(tier),
    sections: sectionsForTier(tier),
    interpretation: readyInterpretation,
  };

  if (fixtureName === "partial" || fixtureName === "ai-partial") {
    return {
      ...fixture,
      outcome: "partial",
      sources: fixture.sources.map((source) =>
        source.label === "Registry Trust court records"
          ? {
              status: "failed",
              label: source.label,
              checkedAt,
              detail:
                "Court records could not be retrieved. Other completed sections remain available.",
            }
          : source,
      ),
      sections: fixture.sections.filter((section) => section.id !== "court-records"),
      interpretation: {
        status: "partial_source",
        heading: "AI interpretation — limited sources",
        generatedAt: checkedAt,
        unavailableSources: ["Registry Trust court records"],
        paragraphs: [
          "The available Companies House records show an active company with two current directors. Court records could not be retrieved, so this interpretation makes no statement about County Court Judgements.",
        ],
      },
      recovery:
        tier === "premium"
          ? {
              kind: "premium_escalation",
              message: "Premium court-record failure is available for an operational review.",
              actionLabel: "Report an issue",
            }
          : {
              kind: "free_recheck",
              message:
                "This report is eligible for one free court-record recheck within seven days.",
              actionLabel: "Request free recheck",
            },
    };
  }

  if (fixtureName === "foundational-failure") {
    return {
      ...fixture,
      outcome: "refund_required",
      sources: [
        {
          status: "failed",
          label: "Companies House",
          checkedAt,
          detail:
            "Foundational company records could not be retrieved, so the report cannot be delivered.",
        },
        ...fixture.sources.slice(1).map<PaidSourceStatus>((source) => ({
          status: "unavailable",
          label: source.label,
          detail: "Not used because the foundational company check failed.",
        })),
      ],
      sections: [],
      interpretation: {
        status: "unavailable",
        heading: "AI interpretation unavailable",
        message:
          "No interpretation was generated because foundational company records were unavailable.",
      },
    };
  }

  if (fixtureName === "source-statuses") {
    return {
      ...fixture,
      outcome: "partial",
      sources: [
        { status: "success", label: "Companies House", checkedAt, detail: "Records retrieved." },
        { status: "failed", label: "Registry Trust", checkedAt, detail: "Retrieval failed." },
        { status: "unavailable", label: "London Gazette", detail: "Service unavailable." },
        { status: "stale", label: "Fair Payment Code", checkedAt, detail: "Refresh required." },
        { status: "pending", label: "Director depth check", detail: "Check still in progress." },
        { status: "not_entitled", label: "Premium PDF", detail: "Not included in this tier." },
      ],
    };
  }

  if (fixtureName === "registry-recheck" || fixtureName === "registry-escalation") {
    const premiumEscalation = fixtureName === "registry-escalation" || tier === "premium";
    return {
      ...getPaidReportFixture(tier, "partial"),
      recovery: premiumEscalation
        ? {
            kind: "premium_escalation",
            message: "Premium court-record failure is available for an operational review.",
            actionLabel: "Report an issue",
          }
        : {
            kind: "free_recheck",
            message: "This report is eligible for one free court-record recheck within seven days.",
            actionLabel: "Request free recheck",
          },
    };
  }

  if (fixtureName === "ai-loading") {
    return {
      ...fixture,
      interpretation: {
        status: "loading",
        heading: "Preparing AI interpretation",
        message: "The factual report is available while the interpretation is prepared.",
      },
    };
  }

  if (fixtureName === "ai-unavailable") {
    return {
      ...fixture,
      interpretation: {
        status: "unavailable",
        heading: "AI interpretation unavailable",
        message:
          "The interpretation could not be generated. The checked facts remain available below.",
      },
    };
  }

  if (fixtureName === "ai-safety-fallback") {
    return {
      ...fixture,
      interpretation: {
        status: "safety_fallback",
        heading: "AI interpretation withheld",
        message:
          "The generated wording did not meet InvoiceGuard's factual-language requirements, so it is not displayed. Review the checked facts directly.",
      },
    };
  }

  return fixture;
}
