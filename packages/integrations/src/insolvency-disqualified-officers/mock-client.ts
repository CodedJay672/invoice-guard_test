import { createProviderSuccess, type ProviderMode, type ProviderResult } from "../provider.js";

import type {
  InsolvencyDisqualifiedOfficersClient,
  InsolvencyDisqualifiedOfficersFreePreviewFlags,
  InsolvencyDisqualifiedOfficersInput,
} from "./types.js";

const fixtures: Record<string, InsolvencyDisqualifiedOfficersFreePreviewFlags> = {
  "12345678": {
    companiesHouseNumber: "12345678",
    insolvencyFlag: false,
    disqualifiedDirectorsFlag: false,
    disqualifiedOfficers: [],
  },
  "87654321": {
    companiesHouseNumber: "87654321",
    insolvencyFlag: true,
    disqualifiedDirectorsFlag: false,
    disqualifiedOfficers: [],
  },
  SC123456: {
    companiesHouseNumber: "SC123456",
    insolvencyFlag: false,
    disqualifiedDirectorsFlag: true,
    disqualifiedOfficers: [
      {
        officerName: "Alex Example",
        disqualifiedFrom: "2024-04-01",
        disqualifiedUntil: "2029-03-31",
      },
    ],
  },
};

export class MockInsolvencyDisqualifiedOfficersClient implements InsolvencyDisqualifiedOfficersClient {
  readonly mode: ProviderMode = "mock";

  readonly provider = "insolvency_disqualified_officers" as const;

  checkCompany(
    input: InsolvencyDisqualifiedOfficersInput,
  ): Promise<ProviderResult<InsolvencyDisqualifiedOfficersFreePreviewFlags>> {
    const companyNumber = input.companyNumber.toUpperCase();

    return Promise.resolve(
      createProviderSuccess(
        this.provider,
        fixtures[companyNumber] ?? {
          companiesHouseNumber: companyNumber,
          insolvencyFlag: false,
          disqualifiedDirectorsFlag: false,
          disqualifiedOfficers: [],
        },
      ),
    );
  }
}
