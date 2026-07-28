import type { ProviderMode, ProviderResult } from "@workspace/types";

export interface RegistryTrustClientConfig {
  mode: ProviderMode;
}

export interface RegistryTrustInput {
  companyNumber: string;
}

export interface RegistryTrustJudgement {
  judgementId: string;
  courtName: string | undefined;
  judgementYear: number | undefined;
  amountPence: number | undefined;
  satisfied: boolean | undefined;
}

export interface RegistryTrustCompanyResult {
  companiesHouseNumber: string;
  judgements: RegistryTrustJudgement[];
}

export interface RegistryTrustClient {
  checkCompany(input: RegistryTrustInput): Promise<ProviderResult<RegistryTrustCompanyResult>>;
}
