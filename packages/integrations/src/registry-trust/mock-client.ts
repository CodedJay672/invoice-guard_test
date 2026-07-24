import { createProviderSuccess, type ProviderResult } from "../provider.js";
import type {
  RegistryTrustClient,
  RegistryTrustCompanyResult,
  RegistryTrustInput,
} from "./types.js";

export class MockRegistryTrustClient implements RegistryTrustClient {
  checkCompany(input: RegistryTrustInput): Promise<ProviderResult<RegistryTrustCompanyResult>> {
    const hasFixtureJudgement = input.companyNumber.endsWith("1");
    return Promise.resolve(
      createProviderSuccess("registry_trust", {
        companiesHouseNumber: input.companyNumber,
        judgements: hasFixtureJudgement
          ? [
              {
                judgementId: `mock-${input.companyNumber}-2024`,
                courtName: "County Court Business Centre",
                judgementYear: 2024,
                amountPence: 125_000,
                satisfied: false,
              },
            ]
          : [],
      }),
    );
  }
}
