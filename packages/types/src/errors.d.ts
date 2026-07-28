export type IntegrationErrorCode = "integration_timeout" | "integration_network_error" | "integration_auth_error" | "integration_rate_limited" | "integration_invalid_response" | "integration_provider_error" | "integration_unknown_error";
export interface IntegrationError {
    code: IntegrationErrorCode;
    message: string;
    provider: string;
    retryable: boolean;
    statusCode?: number;
    cause?: unknown;
}
//# sourceMappingURL=errors.d.ts.map