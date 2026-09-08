import "server-only";

import { loadWebProxyConfig } from "@workspace/config/web";

import type { AuthIdentity } from "@/lib/auth/identity";
import { addTrustedPrincipalHeaders } from "@/lib/auth/trusted-principal";

export interface AdminOverview {
  reportsByStatus: Array<{ status: string; count: number }>;
  purchaseCount: number;
  refundCount: number;
  qualifyingTransactions: number;
  netRevenuePence: number;
  searchCount: number;
  conversionRate: number;
  openAlertCount: number;
  failedMaintenanceCount: number;
}

export interface AdminCollection {
  items: Array<Record<string, unknown>>;
  page: number;
  limit: number;
  total: number;
}

async function adminRequest<T>(path: string, identity: AuthIdentity): Promise<T> {
  const config = loadWebProxyConfig();
  const headers = new Headers();
  addTrustedPrincipalHeaders(headers, identity);
  const response = await fetch(new URL(path, config.apiBaseUrl), {
    cache: "no-store",
    headers,
    signal: AbortSignal.timeout(config.timeoutMs),
  });
  if (!response.ok) throw new Error(`Admin request failed with status ${response.status}.`);
  const payload = (await response.json()) as { data: T };
  return payload.data;
}

export function loadAdminOverview(identity: AuthIdentity): Promise<AdminOverview> {
  return adminRequest("/admin/overview", identity);
}

export function loadAdminCollection(
  identity: AuthIdentity,
  collection: string,
): Promise<AdminCollection> {
  return adminRequest(`/admin/${collection}?page=1&limit=10`, identity);
}
