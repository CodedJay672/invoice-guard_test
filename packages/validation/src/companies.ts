import { z } from "zod";
import type {
  CompanyAddressPayload as SharedCompanyAddressPayload,
  CompanyAccountsPayload as SharedCompanyAccountsPayload,
  CompanyPayload as SharedCompanyPayload,
  CompanySearchMatchPayload as SharedCompanySearchMatchPayload,
  FreePreviewPayload as SharedFreePreviewPayload,
  ReportProductCode,
  JsonValue,
  ProviderPayload,
} from "@workspace/types";

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema),
  ]),
);
const providerPayloadSchema: z.ZodType<ProviderPayload> = z.record(jsonValueSchema);

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

export const freeCompanyTabSchema = z.enum([
  "overview",
  "filing-history",
  "charges",
  "officers",
  "insolvency",
]);
export const freeCompanyTabPaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(25),
});

export const companyAddressPayloadSchema = z.object({
  premises: z.string().optional(),
  careOf: z.string().optional(),
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
  confirmationStatement: z
    .object({
      lastMadeUpTo: z.string().optional(),
      nextMadeUpTo: z.string().optional(),
      nextDue: z.string().optional(),
      overdue: z.boolean().optional(),
    })
    .optional(),
  sicDescriptions: z.array(z.string()).optional(),
  providerPayload: providerPayloadSchema.optional(),
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

export const freePreviewPayloadSchema: z.ZodType<SharedFreePreviewPayload, z.ZodTypeDef, unknown> =
  z.object({
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
        pricePence: z.number().int().positive(),
        creditQuantity: z.number().int().positive(),
        includesPdf: z.boolean(),
        includedItems: z.array(z.string()),
        cta: z.string(),
      }),
    ),
    sourceStatuses: z.array(freePreviewSourceStatusSchema),
  });

export const companySearchApiResponseSchema = z.object({
  data: z.object({
    matches: z.array(companySearchMatchPayloadSchema),
    providerPayload: providerPayloadSchema.optional(),
  }),
});

export const freePreviewApiResponseSchema = z.object({
  data: z.object({ preview: freePreviewPayloadSchema }),
});

const freeCompanyTabSourceSchema = z.object({
  provider: z.literal("companies_house"),
  checkedAt: z.string(),
});
const freeCompanyTabPaginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(50),
  totalResults: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});
const optionalString = z.string().optional();
export const freeCompanyTabPayloadSchema = z.discriminatedUnion("tab", [
  z.object({
    tab: z.literal("overview"),
    companyNumber: z.string(),
    source: freeCompanyTabSourceSchema,
    company: companyPayloadSchema,
    providerPayload: providerPayloadSchema.optional(),
  }),
  z.object({
    tab: z.literal("filing-history"),
    companyNumber: z.string(),
    source: freeCompanyTabSourceSchema,
    pagination: freeCompanyTabPaginationSchema,
    filings: z.array(
      z.object({
        date: optionalString,
        type: optionalString,
        description: optionalString,
        category: optionalString,
        pages: z.number().int().nonnegative().optional(),
        transactionId: optionalString,
        descriptionValues: z.record(z.string()).optional(),
        subcategory: optionalString,
        barcode: optionalString,
        paperFiled: z.boolean().optional(),
        annotations: z
          .array(
            z.object({
              annotation: optionalString,
              date: optionalString,
              description: optionalString,
            }),
          )
          .optional(),
        associatedFilings: z
          .array(
            z.object({ date: optionalString, description: optionalString, type: optionalString }),
          )
          .optional(),
        resolutions: z
          .array(
            z.object({
              category: optionalString,
              description: optionalString,
              documentId: optionalString,
              receivedOn: optionalString,
              subcategory: optionalString,
              type: optionalString,
            }),
          )
          .optional(),
      }),
    ),
    providerPayload: providerPayloadSchema.optional(),
  }),
  z.object({
    tab: z.literal("charges"),
    companyNumber: z.string(),
    source: freeCompanyTabSourceSchema,
    pagination: freeCompanyTabPaginationSchema,
    charges: z.array(
      z.object({
        createdOn: optionalString,
        deliveredOn: optionalString,
        satisfiedOn: optionalString,
        status: optionalString,
        classification: optionalString,
        personsEntitled: z.array(z.string()),
        description: optionalString,
        chargeCode: optionalString,
        particularsType: optionalString,
        containsFixedCharge: z.boolean().optional(),
        containsFloatingCharge: z.boolean().optional(),
        containsNegativePledge: z.boolean().optional(),
      }),
    ),
    providerPayload: providerPayloadSchema.optional(),
  }),
  z.object({
    tab: z.literal("officers"),
    companyNumber: z.string(),
    source: freeCompanyTabSourceSchema,
    pagination: freeCompanyTabPaginationSchema,
    activeCount: z.number().int().nonnegative().optional(),
    resignedCount: z.number().int().nonnegative().optional(),
    officers: z.array(
      z.object({
        name: z.string(),
        role: optionalString,
        appointedOn: optionalString,
        resignedOn: optionalString,
        occupation: optionalString,
        countryOfResidence: optionalString,
        nationality: optionalString,
        dateOfBirth: z
          .object({
            month: z.number().int().min(1).max(12).optional(),
            year: z.number().int().positive().optional(),
          })
          .optional(),
        identityVerificationDetails: z
          .object({
            appointmentVerificationEndOn: optionalString,
            appointmentVerificationStartOn: optionalString,
            appointmentVerificationStatementDueOn: optionalString,
            identityVerifiedOn: optionalString,
            preferredName: optionalString,
          })
          .optional(),
      }),
    ),
    providerPayload: providerPayloadSchema.optional(),
  }),
  z.object({
    tab: z.literal("insolvency"),
    companyNumber: z.string(),
    source: freeCompanyTabSourceSchema,
    status: optionalString,
    cases: z.array(
      z.object({
        type: optionalString,
        number: optionalString,
        status: optionalString,
        startedOn: optionalString,
        practitioners: z.array(
          z.object({
            name: optionalString,
            role: optionalString,
            appointedOn: optionalString,
            ceasedToActOn: optionalString,
            address: companyAddressPayloadSchema.optional(),
          }),
        ),
        notes: z.array(z.string()),
      }),
    ),
    providerPayload: providerPayloadSchema.optional(),
  }),
]);
export const freeCompanyTabApiResponseSchema = z.object({
  data: z.object({ tab: freeCompanyTabPayloadSchema }),
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
