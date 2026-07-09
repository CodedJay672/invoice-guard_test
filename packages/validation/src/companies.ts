import { z } from "zod";
import type {
  CompanyAddressPayload as SharedCompanyAddressPayload,
  CompanyAccountsPayload as SharedCompanyAccountsPayload,
  CompanyPayload as SharedCompanyPayload,
  CompanySearchMatchPayload as SharedCompanySearchMatchPayload,
  FreePreviewPayload as SharedFreePreviewPayload,
  ReportProductCode,
} from "@workspace/types";

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
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  locality: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  poBox: z.string().optional(),
}) satisfies z.ZodType<SharedCompanyAddressPayload>;

const optionalNumericStringSchema = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }

  return value;
}, z.number().int().positive().optional());

export const companyAccountsPayloadSchema: z.ZodType<
  SharedCompanyAccountsPayload,
  z.ZodTypeDef,
  unknown
> = z.object({
  accounting_reference_date: z.object({
    day: optionalNumericStringSchema,
    month: optionalNumericStringSchema,
  }),
  last_accounts: z.object({
    made_up_to: z.string().optional(),
    period_end_on: z.string().optional(),
    period_start_on: z.string().optional(),
    type: z.string().optional(),
  }),
  next_accounts: z.object({
    due_on: z.string().optional(),
    overdue: z.boolean().optional(),
    period_end_on: z.string().optional(),
    period_start_on: z.string().optional(),
  }),
  next_due: z.string().optional(),
  next_made_up_to: z.string().optional(),
  overdue: z.boolean().optional(),
});

export const companySearchMatchPayloadSchema: z.ZodType<
  SharedCompanySearchMatchPayload,
  z.ZodTypeDef,
  unknown
> = z.object({
  companiesHouseNumber: z.string(),
  companyName: z.string(),
  companyStatus: z.string(),
  companyType: z.string().optional(),
  incorporationDate: z.string().optional(),
  cessationDate: z.string().optional(),
  registeredOfficeAddress: companyAddressPayloadSchema,
  sicCodes: z.array(z.string()),
  accounts: companyAccountsPayloadSchema.optional(),
});

export const companyPayloadSchema: z.ZodType<SharedCompanyPayload, z.ZodTypeDef, unknown> =
  companySearchMatchPayloadSchema.and(
    z.object({
      industryLabel: z.string().optional(),
      activeDirectorCount: z.number().int().nonnegative().optional(),
      lastFetchedAt: z.string().optional(),
    }),
  );

const freePreviewProviderSchema = z.literal("companies_house");

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

export const freePreviewPayloadSchema: z.ZodType<
  SharedFreePreviewPayload,
  z.ZodTypeDef,
  unknown
> = z.object({
  company: companyPayloadSchema,
  companyAge: z.string().optional(),
  notYetCheckedSources: z.array(
    z.object({
      source: z.enum([
        "london_gazette",
        "insolvency_disqualified_officers",
        "registry_trust",
        "fair_payment_code",
        "ai_interpretation",
      ]),
      label: z.string(),
      status: z.literal("not_yet_checked"),
      message: z.string(),
    }),
  ),
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
      kind: z.enum(["director_network", "recent_activity"]),
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
      tier: z.enum([
        "single_report",
        "starter_pack",
        "business_pack",
        "agency_pack",
      ]) satisfies z.ZodType<ReportProductCode>,
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

export type CompanyMatchProfile = z.infer<typeof companyAccountsPayloadSchema>;
export type CompanyAddressPayload = SharedCompanyAddressPayload;
export type CompanySearchMatchPayload = SharedCompanySearchMatchPayload;
export type CompanyPayload = SharedCompanyPayload;
export type FreePreviewPayload = SharedFreePreviewPayload;
