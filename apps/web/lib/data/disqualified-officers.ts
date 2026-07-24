import "server-only";

import { assertWebProxyProductionConfig, loadWebProxyConfig } from "@workspace/config/web";
import type {
  CompaniesHouseCorporateDisqualifiedOfficer,
  CompaniesHouseDisqualifiedOfficerSearchResult,
  CompaniesHouseDisqualifiedOfficerSubtype,
  CompaniesHouseNaturalDisqualifiedOfficer,
} from "@workspace/types";
import {
  apiErrorResponseSchema,
  corporateDisqualifiedOfficerApiResponseSchema,
  disqualifiedOfficerSearchApiResponseSchema,
  naturalDisqualifiedOfficerApiResponseSchema,
} from "@workspace/validation";

type DataResult<T> =
  | { status: "success"; data: T }
  | { status: "invalid" | "rate_limited" | "error"; message: string };

async function apiGet(path: string): Promise<{ ok: boolean; body: unknown }> {
  const config = loadWebProxyConfig();
  assertWebProxyProductionConfig(config);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetch(new URL(path, config.apiBaseUrl), {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    return { ok: response.ok, body: (await response.json()) as unknown };
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchDisqualifiedOfficers(
  query: string,
  page: number,
  subtype: CompaniesHouseDisqualifiedOfficerSubtype,
): Promise<DataResult<CompaniesHouseDisqualifiedOfficerSearchResult>> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return { status: "invalid", message: "Enter at least 2 characters." };
  try {
    const params = new URLSearchParams({
      q: trimmed,
      items_per_page: "10",
      start_index: String((page - 1) * 10),
      type: subtype,
    });
    const response = await apiGet(`/disqualified-officers/search?${params}`);
    if (!response.ok) {
      const error = apiErrorResponseSchema.safeParse(response.body);
      return {
        status:
          error.success && error.data.error.code === "anonymous_search_rate_limited"
            ? "rate_limited"
            : "error",
        message: error.success
          ? error.data.error.message
          : "Disqualification data could not be retrieved right now.",
      };
    }
    const parsed = disqualifiedOfficerSearchApiResponseSchema.safeParse(response.body);
    if (!parsed.success) throw new Error("Invalid disqualification search response");
    return { status: "success", data: parsed.data.data };
  } catch {
    return { status: "error", message: "Disqualification data could not be retrieved right now." };
  }
}

export async function getNaturalDisqualifiedOfficer(
  officerId: string,
): Promise<DataResult<CompaniesHouseNaturalDisqualifiedOfficer>> {
  try {
    const response = await apiGet(
      `/disqualified-officers/natural/${encodeURIComponent(officerId)}`,
    );
    if (!response.ok) {
      const error = apiErrorResponseSchema.safeParse(response.body);
      return {
        status: "error",
        message: error.success
          ? error.data.error.message
          : "Officer details could not be retrieved right now.",
      };
    }
    const parsed = naturalDisqualifiedOfficerApiResponseSchema.safeParse(response.body);
    if (!parsed.success) throw new Error("Invalid natural officer response");
    return { status: "success", data: parsed.data.data.officer };
  } catch {
    return { status: "error", message: "Officer details could not be retrieved right now." };
  }
}

export async function getCorporateDisqualifiedOfficer(
  officerId: string,
): Promise<DataResult<CompaniesHouseCorporateDisqualifiedOfficer>> {
  try {
    const response = await apiGet(
      `/disqualified-officers/corporate/${encodeURIComponent(officerId)}`,
    );
    if (!response.ok) {
      const error = apiErrorResponseSchema.safeParse(response.body);
      return {
        status: "error",
        message: error.success
          ? error.data.error.message
          : "Officer details could not be retrieved right now.",
      };
    }
    const parsed = corporateDisqualifiedOfficerApiResponseSchema.safeParse(response.body);
    if (!parsed.success) throw new Error("Invalid corporate officer response");
    return { status: "success", data: parsed.data.data.officer };
  } catch {
    return { status: "error", message: "Officer details could not be retrieved right now." };
  }
}
