import "server-only";

import { assertWebProxyProductionConfig, loadWebProxyConfig } from "@workspace/config/web";
import {
  reportDeliveryResponseSchema,
  type ReportDeliveryResponse,
} from "@workspace/validation/report-delivery";

import type { AuthIdentity } from "../auth/identity";
import { addTrustedPrincipalHeaders } from "../auth/trusted-principal";

export type ReportDeliveryLoadResult =
  | { kind: "success"; data: ReportDeliveryResponse }
  | { kind: "access_denied" }
  | { kind: "not_found" }
  | { kind: "unavailable" };

export async function loadOwnedReport(
  reportReference: string,
  identity: Extract<AuthIdentity, { state: "verified" }>,
): Promise<ReportDeliveryLoadResult> {
  const config = loadWebProxyConfig();
  assertWebProxyProductionConfig(config);
  const headers = new Headers({ Accept: "application/json" });
  addTrustedPrincipalHeaders(headers, identity);
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), config.timeoutMs);
  try {
    const response = await fetch(
      new URL(`/reports/${encodeURIComponent(reportReference)}`, config.apiBaseUrl),
      { cache: "no-store", headers, signal: abortController.signal },
    );
    const payload: unknown = await response.json();
    if (response.status === 404) {
      return errorCode(payload) === "report_access_denied"
        ? { kind: "access_denied" }
        : { kind: "not_found" };
    }
    if (!response.ok) return { kind: "unavailable" };
    const parsed = reportDeliveryResponseSchema.safeParse(dataValue(payload));
    return parsed.success ? { kind: "success", data: parsed.data } : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}

function dataValue(value: unknown): unknown {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)["data"]
    : undefined;
}

function errorCode(value: unknown): string | undefined {
  const error =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)["error"]
      : undefined;
  if (typeof error !== "object" || error === null) return undefined;
  const code = (error as Record<string, unknown>)["code"];
  return typeof code === "string" ? code : undefined;
}
