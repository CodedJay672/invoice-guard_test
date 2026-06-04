import type { ProviderMode, ProviderResult } from "../provider.js";

export interface LondonGazetteClientConfig {
  mode: ProviderMode;
  baseUrl: string;
  timeoutMs: number;
}

export interface LondonGazetteCompanyInput {
  companyNumber: string;
}

export interface LondonGazetteNotice {
  noticeId: string;
  title: string;
  category: "strike_off" | "winding_up" | "other";
  publishedAt: string | undefined;
  url: string | undefined;
}

export interface LondonGazetteFreePreviewFlags {
  companiesHouseNumber: string;
  gazetteStrikeoffFlag: boolean;
  gazetteWindingupFlag: boolean;
  notices: LondonGazetteNotice[];
}

export interface LondonGazetteClient {
  checkCompanyNotices(
    input: LondonGazetteCompanyInput,
  ): Promise<ProviderResult<LondonGazetteFreePreviewFlags>>;
}
