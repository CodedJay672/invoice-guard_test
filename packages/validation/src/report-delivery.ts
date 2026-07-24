import { z } from "zod";
import type { ReportProductCode } from "@workspace/types";

const reportProductCodeSchema = z.enum([
  "single_report",
  "starter_pack",
  "business_pack",
  "agency_pack",
]) satisfies z.ZodType<ReportProductCode>;

const deliveryEntitlementsSchema = z
  .object({
    companiesHouse: z
      .object({
        profile: z.literal(true),
        addressHistory: z.boolean(),
        officers: z.boolean(),
        filingHistory: z.boolean(),
        charges: z.boolean(),
        insolvency: z.boolean(),
      })
      .strict(),
    registryTrust: z
      .object({
        enabled: z.boolean(),
        includeAmounts: z.boolean(),
        includeSatisfaction: z.boolean(),
      })
      .strict(),
    londonGazette: z.boolean(),
    insolvencyDisqualifiedOfficers: z.boolean(),
    fairPaymentCode: z.boolean(),
    evidenceCoverage: z.boolean(),
    relatedCompanies: z.literal(false),
    aiInterpretation: z.literal(true),
  })
  .strict();

const nullableFactsSchema = z.record(z.unknown()).nullable();
const deliveryAiInputSchema = z
  .object({
    overview: nullableFactsSchema,
    charges: nullableFactsSchema,
    insolvency: nullableFactsSchema,
    officers: nullableFactsSchema,
    filing_history: nullableFactsSchema,
    ccj: nullableFactsSchema,
    fair_payment_code: nullableFactsSchema,
  })
  .strict();

const nullableInterpretationSchema = z.string().min(1).nullable();
const deliveryAiOutputSchema = z
  .object({
    summary: z.string().min(1),
    overview: nullableInterpretationSchema,
    charges: nullableInterpretationSchema,
    insolvency: nullableInterpretationSchema,
    officers: nullableInterpretationSchema,
    filing_history: nullableInterpretationSchema,
    ccj: nullableInterpretationSchema,
    fair_payment_code: nullableInterpretationSchema,
  })
  .strict();

export const reportReferenceSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^IG-\d{4}-[A-F0-9]{12}$/);

const aiArtifactBaseSchema = z.object({
  model: z.literal("claude-haiku-4-5-20251001"),
  promptVersion: z.literal("v1"),
  generatedAt: z.string().datetime(),
  requestId: z.string().nullable(),
});

const aiArtifactSchema = z.discriminatedUnion("status", [
  aiArtifactBaseSchema.extend({
    status: z.literal("ready"),
    output: deliveryAiOutputSchema,
  }),
  aiArtifactBaseSchema.extend({
    status: z.enum(["unavailable", "safety_fallback"]),
    reason: z.enum([
      "invalid_output",
      "null_mismatch",
      "refusal",
      "safety_violation",
      "truncated",
      "unavailable",
    ]),
  }),
]);

export const frozenPaidReportSchema = z
  .object({
    schemaVersion: z.literal("paid-report-v1"),
    reportReference: reportReferenceSchema,
    companyNumber: z.string().min(1).max(16),
    companyName: z.string().min(1),
    tier: reportProductCodeSchema,
    entitlements: deliveryEntitlementsSchema,
    generatedAt: z.string().datetime(),
    facts: deliveryAiInputSchema,
    interpretation: aiArtifactSchema.nullable(),
    relatedCompanies: z
      .object({
        status: z.literal("unavailable"),
        reason: z.string().min(1),
      })
      .strict(),
    evidenceCoverage: z
      .object({ completed: z.number().int().nonnegative(), failed: z.number().int().nonnegative() })
      .strict()
      .nullable(),
    recovery: z
      .union([
        z.object({ type: z.literal("admin_escalation") }).strict(),
        z
          .object({ type: z.literal("free_recheck"), eligibleUntil: z.string().datetime() })
          .strict(),
      ])
      .nullable(),
  })
  .strict();

export const frozenProviderStatusesSchema = z
  .object({
    checked: z.array(
      z
        .object({
          provider: z.enum([
            "companies_house",
            "london_gazette",
            "insolvency_disqualified_officers",
            "registry_trust",
            "fair_payment_code",
          ]),
          operation: z.string().min(1),
          status: z.enum(["success", "failed"]),
          checkedAt: z.string().datetime(),
          errorCode: z.string().nullable(),
        })
        .strict(),
    ),
    fairPaymentCode: z.enum(["entitled", "not_entitled"]),
    relatedCompanies: z.literal("unavailable"),
  })
  .strict();

const sourceStatusSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    label: z.string(),
    checkedAt: z.string(),
    detail: z.string(),
  }),
  z.object({
    status: z.literal("failed"),
    label: z.string(),
    checkedAt: z.string(),
    detail: z.string(),
  }),
  z.object({ status: z.literal("unavailable"), label: z.string(), detail: z.string() }),
]);

const interpretationSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("ready"),
    heading: z.string(),
    generatedAt: z.string(),
    paragraphs: z.array(z.string()),
  }),
  z.object({
    status: z.literal("partial_source"),
    heading: z.string(),
    generatedAt: z.string(),
    unavailableSources: z.array(z.string()),
    paragraphs: z.array(z.string()),
  }),
  z.object({ status: z.literal("unavailable"), heading: z.string(), message: z.string() }),
  z.object({ status: z.literal("safety_fallback"), heading: z.string(), message: z.string() }),
]);

const factSchema = z.object({ label: z.string(), value: z.string() }).strict();
const sectionSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    facts: z.array(factSchema),
  })
  .strict();

export const reportNotificationSchema = z
  .object({
    state: z.enum(["sending", "sent", "delayed", "failed"]),
    destinationLabel: z.literal("your verified account email"),
    updatedAt: z.string(),
  })
  .strict();

export const browserReportPayloadSchema = z
  .object({
    tier: reportProductCodeSchema,
    tierLabel: z.string(),
    companyName: z.string(),
    companyNumber: z.string(),
    companyStatus: z.string(),
    companyType: z.string(),
    incorporated: z.string(),
    registeredAddress: z.string(),
    industry: z.string(),
    reportReference: reportReferenceSchema,
    generatedAt: z.string(),
    outcome: z.enum(["complete", "partial"]),
    sources: z.array(sourceStatusSchema),
    sections: z.array(sectionSchema),
    interpretation: interpretationSchema,
    disclaimer: z.string(),
    issueHref: z.string(),
    pdfState: z.enum(["available", "generating", "ready", "failed"]).optional(),
    pdfDownloadHref: z.string().startsWith("/").optional(),
    notification: reportNotificationSchema.optional(),
  })
  .strict();

export const reportDeliveryResponseSchema = z.discriminatedUnion("state", [
  z.object({ state: z.literal("report"), report: browserReportPayloadSchema }).strict(),
  z
    .object({
      state: z.literal("not_ready"),
      status: z.enum(["pending", "generating"]),
      reportReference: reportReferenceSchema,
    })
    .strict(),
  z
    .object({
      state: z.literal("unavailable"),
      status: z.enum(["failed", "refund_required", "refunded"]),
      reportReference: reportReferenceSchema,
    })
    .strict(),
]);

export type FrozenPaidReport = z.infer<typeof frozenPaidReportSchema>;
export type FrozenProviderStatuses = z.infer<typeof frozenProviderStatusesSchema>;
export type BrowserReportPayload = z.infer<typeof browserReportPayloadSchema>;
export type ReportDeliveryResponse = z.infer<typeof reportDeliveryResponseSchema>;
