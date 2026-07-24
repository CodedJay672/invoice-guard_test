import type { IntegrationErrorCode } from "./errors.js";

export type ProviderStatus = "success" | "failed";

export type ProviderMode = "mock" | "live";

export type ProviderName =
  | "companies_house"
  | "london_gazette"
  | "insolvency_disqualified_officers"
  | "registry_trust"
  | "fair_payment_code";

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

export function createProviderSuccess<TData>(
  provider: ProviderName,
  data: TData,
  checkedAt: string = new Date().toISOString(),
): ProviderSuccess<TData> {
  return {
    provider,
    status: "success",
    checkedAt,
    data,
  };
}

export function createProviderFailure(
  provider: ProviderName,
  failure: ProviderFailure,
  checkedAt: string = new Date().toISOString(),
): ProviderFailed {
  const result: ProviderFailed = {
    provider,
    status: "failed",
    checkedAt,
    errorCode: failure.code,
    errorMessage: failure.message,
    retryable: failure.retryable,
  };

  if (failure.statusCode !== undefined) {
    result.statusCode = failure.statusCode;
  }

  return result;
}
