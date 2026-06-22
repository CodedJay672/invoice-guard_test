import { z } from "zod";

export const companySearchQuerySchema = z
  .string()
  .trim()
  .min(2, "Search query must be at least 2 characters.")
  .max(120, "Search query must be 120 characters or fewer.");

export const companiesHouseNumberSchema = z
  .string()
  .trim()
  .regex(/^[A-Z0-9]{2,16}$/i, "Companies House number must be 2-16 letters or numbers.")
  .transform((value) => value.toUpperCase());

export const companyAddressPayloadSchema = z.object({
  locality: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
});

export const companySearchMatchPayloadSchema = z.object({
  companiesHouseNumber: z.string(),
  companyName: z.string(),
  companyStatus: z.string(),
  companyType: z.string().optional(),
  incorporationDate: z.string().optional(),
  registeredOfficeAddress: companyAddressPayloadSchema,
  sicCodes: z.array(z.string()),
});

export const companyPayloadSchema = companySearchMatchPayloadSchema.extend({
  industryLabel: z.string().optional(),
  activeDirectorCount: z.number().int().nonnegative().optional(),
  lastFetchedAt: z.string().optional(),
});

const freePreviewProviderSchema = z.enum([
  "companies_house",
  "london_gazette",
  "insolvency_disqualified_officers",
]);

export const freePreviewSourceStatusSchema = z.discriminatedUnion("status", [
  z.object({
    provider: freePreviewProviderSchema,
    status: z.literal("success"),
    checkedAt: z.string(),
  }),
  z.object({
    provider: freePreviewProviderSchema,
    status: z.literal("failed"),
    checkedAt: z.string(),
    message: z.literal("Data could not be retrieved"),
  }),
]);

export const freePreviewPayloadSchema = z.object({
  company: companyPayloadSchema,
  companyAge: z.string().optional(),
  previewPath: z.enum(["adverse", "clean", "source_failed", "standard"]),
  freeSourceFlags: z.object({
    insolvencyFlag: z.boolean().nullable(),
    disqualifiedDirectorsFlag: z.boolean().nullable(),
    gazetteStrikeoffFlag: z.boolean().nullable(),
    gazetteWindingupFlag: z.boolean().nullable(),
  }),
  adverseBanners: z.array(
    z.object({
      flag: z.enum([
        "insolvency",
        "disqualified_director",
        "gazette_strikeoff",
        "gazette_windingup",
      ]),
      message: z.string(),
    }),
  ),
  cleanReassurance: z.string().optional(),
  courtRecordsPrompt: z.object({
    label: z.string(),
    heading: z.string(),
    body: z.string(),
    questionLine: z.string(),
    button: z.string(),
    smallText: z.string(),
  }),
  curiosityCards: z.array(
    z.object({
      kind: z.enum(["director_network", "recent_activity", "full_clearance"]),
      heading: z.string().optional(),
      question: z.string().optional(),
      blurredAnswer: z.string().optional(),
      lockTag: z.string().optional(),
      body: z.string(),
      button: z.string().optional(),
      smallText: z.string().optional(),
    }),
  ),
  tierCards: z.array(
    z.object({
      tier: z.enum(["basic", "standard", "premium"]),
      name: z.string(),
      price: z.string(),
      includesPdf: z.boolean(),
      includedItems: z.array(z.string()),
      cta: z.string(),
    }),
  ),
  sourceStatuses: z.array(freePreviewSourceStatusSchema),
});

export const companySearchApiResponseSchema = z.object({
  data: z.object({ matches: z.array(companySearchMatchPayloadSchema) }),
});

export const freePreviewApiResponseSchema = z.object({
  data: z.object({ preview: freePreviewPayloadSchema }),
});

export const apiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
  meta: z.object({ resetAt: z.string().optional() }).optional(),
});

export type CompanyAddressPayload = z.infer<typeof companyAddressPayloadSchema>;
export type CompanySearchMatchPayload = z.infer<typeof companySearchMatchPayloadSchema>;
export type FreePreviewPayload = z.infer<typeof freePreviewPayloadSchema>;
