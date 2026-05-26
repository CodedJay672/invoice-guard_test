export interface IntegrationAuthConfig {
  apiKey?: string;
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface IntegrationConfig {
  provider: string;
  baseUrl?: string;
  timeoutMs?: number;
  auth?: IntegrationAuthConfig;
}
