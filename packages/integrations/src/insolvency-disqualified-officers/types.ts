import type { ProviderMode, ProviderResult } from "../provider.js";

export interface InsolvencyDisqualifiedOfficersClientConfig {
  mode: ProviderMode;
  baseUrl: string;
  timeoutMs: number;
}

export interface InsolvencyDisqualifiedOfficersInput {
  companyNumber: string;
}

export interface InsolvencyDisqualifiedOfficerRecord {
  officerName: string;
  disqualifiedFrom: string | undefined;
  disqualifiedUntil: string | undefined;
}

export interface InsolvencyDisqualifiedOfficersFreePreviewFlags {
  companiesHouseNumber: string;
  insolvencyFlag: boolean;
  disqualifiedDirectorsFlag: boolean;
  disqualifiedOfficers: InsolvencyDisqualifiedOfficerRecord[];
}

export interface InsolvencyDisqualifiedOfficersClient {
  checkCompany(
    input: InsolvencyDisqualifiedOfficersInput,
  ): Promise<ProviderResult<InsolvencyDisqualifiedOfficersFreePreviewFlags>>;
}
