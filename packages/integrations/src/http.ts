export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface IntegrationRequestMetadata {
  method: HttpMethod;
  url: string;
  provider: string;
  requestId?: string;
}

export interface IntegrationResponseMetadata {
  statusCode: number;
  provider: string;
  requestId?: string;
  durationMs?: number;
}
