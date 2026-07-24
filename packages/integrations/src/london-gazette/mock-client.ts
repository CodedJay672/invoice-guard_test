import { createProviderSuccess, type ProviderMode, type ProviderResult } from "../provider.js";

import type {
  LondonGazetteClient,
  LondonGazetteCompanyInput,
  LondonGazetteFreePreviewFlags,
} from "./types.js";

const fixtures: Record<string, LondonGazetteFreePreviewFlags> = {
  "12345678": {
    companiesHouseNumber: "12345678",
    gazetteStrikeoffFlag: false,
    gazetteWindingupFlag: false,
    notices: [],
  },
  "87654321": {
    companiesHouseNumber: "87654321",
    gazetteStrikeoffFlag: true,
    gazetteWindingupFlag: false,
    notices: [
      {
        noticeId: "LG-87654321-1",
        title: "Compulsory strike-off notice",
        category: "strike_off",
        publishedAt: "2026-01-10",
        url: "https://www.thegazette.co.uk/mock/87654321/strike-off",
      },
    ],
  },
  SC123456: {
    companiesHouseNumber: "SC123456",
    gazetteStrikeoffFlag: false,
    gazetteWindingupFlag: true,
    notices: [
      {
        noticeId: "LG-SC123456-1",
        title: "Winding-up petition notice",
        category: "winding_up",
        publishedAt: "2026-02-14",
        url: "https://www.thegazette.co.uk/mock/SC123456/winding-up",
      },
    ],
  },
};

export class MockLondonGazetteClient implements LondonGazetteClient {
  readonly mode: ProviderMode = "mock";

  readonly provider = "london_gazette" as const;

  checkCompanyNotices(
    input: LondonGazetteCompanyInput,
  ): Promise<ProviderResult<LondonGazetteFreePreviewFlags>> {
    const companyNumber = input.companyNumber.toUpperCase();

    return Promise.resolve(
      createProviderSuccess(
        this.provider,
        fixtures[companyNumber] ?? {
          companiesHouseNumber: companyNumber,
          gazetteStrikeoffFlag: false,
          gazetteWindingupFlag: false,
          notices: [],
        },
      ),
    );
  }
}
