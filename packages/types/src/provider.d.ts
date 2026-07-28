import type { IntegrationErrorCode } from "./errors.js";
export type ProviderStatus = "success" | "failed";
export type ProviderMode = "mock" | "live";
export type ProviderName = "companies_house" | "london_gazette" | "insolvency_disqualified_officers" | "registry_trust" | "fair_payment_code";
export interface ProviderFailure {
    code: IntegrationErrorCode;
    message: string;
    retryable: boolean;
    statusCode?: number;
}
export interface ProviderResultBase {
    provider: ProviderName;
    status: ProviderStatus;
    checkedAt: string;
}
export interface ProviderSuccess<TData> extends ProviderResultBase {
    status: "success";
    data: TData;
}
export interface ProviderFailed extends ProviderResultBase {
    status: "failed";
    errorCode: IntegrationErrorCode;
    errorMessage: string;
    retryable: boolean;
    statusCode?: number;
}
export type ProviderResult<TData> = ProviderSuccess<TData> | ProviderFailed;
export interface ProviderAdapter<TInput, TData> {
    provider: ProviderName;
    mode: ProviderMode;
    fetch(input: TInput): Promise<ProviderResult<TData>>;
}
export declare function createProviderSuccess<TData>(provider: ProviderName, data: TData, checkedAt?: string): ProviderSuccess<TData>;
export declare function createProviderFailure(provider: ProviderName, failure: ProviderFailure, checkedAt?: string): ProviderFailed;
//# sourceMappingURL=provider.d.ts.map