import { z } from "zod";

import { createProviderFailure, createProviderSuccess, type ProviderResult } from "../provider.js";

import type {
  InsolvencyDisqualifiedOfficerRecord,
  InsolvencyDisqualifiedOfficersFreePreviewFlags,
} from "./types.js";

const provider = "insolvency_disqualified_officers";

const officerSchema = z.object({
  officerName: z.string().optional(),
  name: z.string().optional(),
  disqualifiedFrom: z.string().optional(),
  disqualifiedUntil: z.string().optional(),
});

const responseSchema = z.object({
  insolvencyFlag: z.boolean().optional(),
  hasInsolvency: z.boolean().optional(),
  disqualifiedDirectorsFlag: z.boolean().optional(),
  hasDisqualifiedDirectors: z.boolean().optional(),
  disqualifiedOfficers: z.array(officerSchema).optional(),
});

export function normaliseInsolvencyDisqualifiedOfficersResponse(
  companyNumber: string,
  payload: unknown,
): ProviderResult<InsolvencyDisqualifiedOfficersFreePreviewFlags> {
  const parsed = responseSchema.safeParse(payload);

  if (!parsed.success) {
    return createProviderFailure(provider, {
      code: "integration_invalid_response",
      message: "Insolvency and disqualified officers check returned an invalid response.",
      retryable: false,
    });
  }

  const disqualifiedOfficers = (parsed.data.disqualifiedOfficers ?? []).map(
    (record): InsolvencyDisqualifiedOfficerRecord => ({
      officerName: record.officerName ?? record.name ?? "Unknown officer",
      disqualifiedFrom: record.disqualifiedFrom,
      disqualifiedUntil: record.disqualifiedUntil,
    }),
  );
  const disqualifiedDirectorsFlag =
    parsed.data.disqualifiedDirectorsFlag ??
    parsed.data.hasDisqualifiedDirectors ??
    disqualifiedOfficers.length > 0;

  return createProviderSuccess(provider, {
    companiesHouseNumber: companyNumber.toUpperCase(),
    insolvencyFlag: parsed.data.insolvencyFlag ?? parsed.data.hasInsolvency ?? false,
    disqualifiedDirectorsFlag,
    disqualifiedOfficers,
  });
}
