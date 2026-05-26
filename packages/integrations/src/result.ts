import type { IntegrationError } from "./errors.js";
import type { IntegrationResponseMetadata } from "./http.js";

export interface IntegrationSuccess<TData> {
  success: true;
  data: TData;
  metadata?: IntegrationResponseMetadata;
}

export interface IntegrationFailure<TError = IntegrationError> {
  success: false;
  error: TError;
  metadata?: IntegrationResponseMetadata;
}

export type IntegrationResult<TData, TError = IntegrationError> =
  | IntegrationSuccess<TData>
  | IntegrationFailure<TError>;
