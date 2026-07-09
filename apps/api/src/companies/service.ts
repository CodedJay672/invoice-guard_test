import type { ProviderFailed } from "@workspace/integrations";

import type {
  CompanyPayload,
  CompanySearchResponsePayload,
  CompanyServiceDependencies,
  FreePreviewCuriosityCardPayload,
  FreePreviewPayload,
} from "./types.js";
import { toSearchMatchPayload } from "./types.js";

export class CompanyProviderError extends Error {
  constructor(readonly failure: ProviderFailed) {
    super(failure.errorMessage);
  }
}

export class CompanyService {
  constructor(private readonly dependencies: CompanyServiceDependencies) {}

  async searchCompanies(query: string): Promise<CompanySearchResponsePayload> {
    const result = await this.dependencies.companiesHouseClient.searchCompanies({
      query,
      itemsPerPage: 10,
    });

    if (result.status === "failed") {
      throw new CompanyProviderError(result);
    }

    return {
      matches: result.data.matches.map(toSearchMatchPayload),
    };
  }

  async getCompanyProfile(companyNumber: string): Promise<CompanyPayload> {
    const result = await this.dependencies.companiesHouseClient.getCompanyProfile({
      companyNumber,
    });

    if (result.status === "failed") {
      throw new CompanyProviderError(result);
    }

    return this.dependencies.companyRepository.upsertCompany(result.data);
  }

  async getFreePreview(companyNumber: string): Promise<FreePreviewPayload> {
    const companyResult = await this.dependencies.companiesHouseClient.getCompanyProfile({
      companyNumber,
    });

    if (companyResult.status === "failed") {
      throw new CompanyProviderError(companyResult);
    }

    const company = await this.dependencies.companyRepository.upsertCompany(companyResult.data);
    const reportProducts = await this.dependencies.reportProductRepository.listActive();

    return {
      company,
      companyAge: describeCompanyAge(company.incorporationDate),
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
          source: "fair_payment_code",
          label: "Fair Payment Code status",
          status: "not_yet_checked",
          message: "Included only in paid full reports.",
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
        body: "County Court Judgements are held by Registry Trust, a separate official UK register from Companies House. They show whether any court has ordered this company to pay a debt and whether that debt has been settled or remains outstanding. Court records are not included in the free check. They are only retrieved when you unlock a paid report.",
        questionLine: "Find out whether this company has CCJs on record.",
        button: "Check the Court Records",
        smallText: "Included in paid full reports. Single report GBP 20.",
      },
      curiosityCards: buildCuriosityCards(company.activeDirectorCount),
      tierCards: reportProducts.map((product) => ({
        tier: product.tier,
        name: product.name,
        price: formatPrice(product.pricePence),
        includesPdf: product.includesPdf,
        includedItems: product.includedItems,
        cta: product.tier === "single_report" ? "Buy 1 Report" : `Buy ${product.name}`,
      })),
      sourceStatuses: [
        {
          provider: "companies_house",
          status: "success",
          checkedAt: companyResult.checkedAt,
        },
      ],
    };
  }

  async recordSearch(input: {
    clerkUserId: string | undefined;
    ipHash: string | undefined;
    query: string;
    matchedCompaniesCount: number;
    selectedCompaniesHouseNumber: string | undefined;
  }): Promise<void> {
    await this.dependencies.searchLogRepository.recordSearch(input);
  }
}

function buildCuriosityCards(
  activeDirectorCount: number | undefined,
): FreePreviewCuriosityCardPayload[] {
  const directorCount = activeDirectorCount ?? 0;

  return [
    {
      kind: "director_network" as const,
      heading: undefined,
      question: `How many other UK companies are these ${directorCount} directors connected to right now?`,
      blurredAnswer: "Network not yet mapped",
      lockTag: "Unlock to see the full director network",
      body: "Includes active roles, recent resignations, and any dissolved companies connected to these directors.",
      button: undefined,
      smallText: undefined,
    },
    {
      kind: "recent_activity" as const,
      heading: undefined,
      question: "Has anything changed at this company in the last 12 months?",
      blurredAnswer: "Changes not yet mapped",
      lockTag: "Unlock to see recent activity",
      body: "Covers director appointments, resignations, address changes, new charges registered, and account submissions.",
      button: undefined,
      smallText: undefined,
    },
  ];
}

function formatPrice(pricePence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pricePence / 100);
}

function describeCompanyAge(incorporationDate: string | undefined): string | undefined {
  if (!incorporationDate) {
    return undefined;
  }

  const incorporatedAt = new Date(incorporationDate);

  if (Number.isNaN(incorporatedAt.getTime())) {
    return undefined;
  }

  const now = new Date();
  let years = now.getUTCFullYear() - incorporatedAt.getUTCFullYear();
  let months = now.getUTCMonth() - incorporatedAt.getUTCMonth();

  if (now.getUTCDate() < incorporatedAt.getUTCDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0) {
    return months === 1 ? "1 month old" : `${Math.max(months, 0)} months old`;
  }

  if (months === 0) {
    return years === 1 ? "1 year old" : `${years} years old`;
  }

  const yearText = years === 1 ? "1 year" : `${years} years`;
  const monthText = months === 1 ? "1 month" : `${months} months`;

  return `${yearText}, ${monthText} old`;
}
