import type { ProviderFailed } from "@workspace/integrations";

import type {
  CompanyPayload,
  CompanySearchResponsePayload,
  CompanyServiceDependencies,
  FreePreviewAdverseFlag,
  FreePreviewBannerPayload,
  FreePreviewCuriosityCardPayload,
  FreePreviewPayload,
  FreePreviewTierCardPayload,
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
    const [companyResult, londonGazetteResult, insolvencyResult] = await Promise.all([
      this.dependencies.companiesHouseClient.getCompanyProfile({ companyNumber }),
      this.dependencies.londonGazetteClient.checkCompanyNotices({ companyNumber }),
      this.dependencies.insolvencyDisqualifiedOfficersClient.checkCompany({ companyNumber }),
    ]);

    if (companyResult.status === "failed") {
      throw new CompanyProviderError(companyResult);
    }

    const company = await this.dependencies.companyRepository.upsertCompany(companyResult.data);
    const freeSourceFlags = {
      insolvencyFlag:
        insolvencyResult.status === "success" ? insolvencyResult.data.insolvencyFlag : false,
      disqualifiedDirectorsFlag:
        insolvencyResult.status === "success"
          ? insolvencyResult.data.disqualifiedDirectorsFlag
          : false,
      gazetteStrikeoffFlag:
        londonGazetteResult.status === "success"
          ? londonGazetteResult.data.gazetteStrikeoffFlag
          : false,
      gazetteWindingupFlag:
        londonGazetteResult.status === "success"
          ? londonGazetteResult.data.gazetteWindingupFlag
          : false,
    };
    const adverseBanners = buildAdverseBanners(freeSourceFlags);
    const isClean =
      adverseBanners.length === 0 && company.companyStatus.trim().toLowerCase() === "active";

    return {
      company,
      companyAge: describeCompanyAge(company.incorporationDate),
      previewPath: adverseBanners.length > 0 ? "adverse" : isClean ? "clean" : "standard",
      freeSourceFlags,
      adverseBanners,
      cleanReassurance: isClean
        ? "No insolvency events, director disqualifications, or gazette notices found on the free check."
        : undefined,
      courtRecordsPrompt: {
        label: "COURT RECORDS — NOT YET CHECKED",
        heading: "Has this company ever been taken to court over an unpaid debt?",
        body: "County Court Judgements are held by Registry Trust, a separate official UK register from Companies House. They show whether any court has ordered this company to pay a debt and whether that debt has been settled or remains outstanding. Court records are not included in the free check. They are only retrieved when you unlock a paid report.",
        questionLine: "Find out whether this company has CCJs on record.",
        button: "Check the Court Records",
        smallText: "Included in all paid reports. Basic from £7.99.",
      },
      curiosityCards: isClean ? buildCuriosityCards(company.activeDirectorCount) : [],
      tierCards: buildTierCards(),
      sourceStatuses: [
        {
          provider: companyResult.provider,
          status: companyResult.status,
          checkedAt: companyResult.checkedAt,
        },
        {
          provider: insolvencyResult.provider,
          status: insolvencyResult.status,
          checkedAt: insolvencyResult.checkedAt,
        },
        {
          provider: londonGazetteResult.provider,
          status: londonGazetteResult.status,
          checkedAt: londonGazetteResult.checkedAt,
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

function buildAdverseBanners(flags: {
  insolvencyFlag: boolean;
  disqualifiedDirectorsFlag: boolean;
  gazetteStrikeoffFlag: boolean;
  gazetteWindingupFlag: boolean;
}): FreePreviewBannerPayload[] {
  const banners: FreePreviewBannerPayload[] = [];
  const copy: Record<FreePreviewAdverseFlag, string> = {
    insolvency:
      "Insolvency or administration records found on this company in the Insolvency Service register. Unlock a paid report to see the full detail.",
    disqualified_director:
      "A director disqualification was found connected to this company. Unlock a paid report to see which director and when.",
    gazette_strikeoff:
      "A compulsory strike-off notice was found for this company in the London Gazette. Unlock a paid report to see the full detail.",
    gazette_windingup:
      "A winding-up petition notice was found for this company in the London Gazette. Unlock a paid report to see the full detail.",
  };

  if (flags.insolvencyFlag) {
    banners.push({ flag: "insolvency", message: copy.insolvency });
  }

  if (flags.disqualifiedDirectorsFlag) {
    banners.push({ flag: "disqualified_director", message: copy.disqualified_director });
  }

  if (flags.gazetteStrikeoffFlag) {
    banners.push({ flag: "gazette_strikeoff", message: copy.gazette_strikeoff });
  }

  if (flags.gazetteWindingupFlag) {
    banners.push({ flag: "gazette_windingup", message: copy.gazette_windingup });
  }

  return banners;
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
    {
      kind: "full_clearance" as const,
      heading: "Everything looks clean so far.",
      question: undefined,
      blurredAnswer: undefined,
      lockTag: undefined,
      body: "The free check covers company status and the most visible public records. The full report confirms there is nothing in the detail. Court records from Registry Trust. Director disqualification check. Insolvency history. Charges registered against company assets. Filing compliance across the last three years. A complete clearance you can keep on file as proof of due diligence.",
      button: "Get Full Clearance Report — Premium",
      smallText: "Includes branded PDF report and timestamped reference number.",
    },
  ];
}

function buildTierCards(): FreePreviewTierCardPayload[] {
  return [
    {
      tier: "basic" as const,
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
      tier: "standard" as const,
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
      tier: "premium" as const,
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
