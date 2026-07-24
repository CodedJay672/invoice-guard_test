export interface IntegrationRetryOptions {
  attempts: number;
  backoffMs: number;
  retryableStatusCodes?: readonly number[];
}
