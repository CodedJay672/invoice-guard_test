import { z } from "zod";
import type { ReportProductCode } from "@workspace/types";

export const paidReportEntitlementsSchema = z
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

export type PaidReportEntitlements = z.infer<typeof paidReportEntitlementsSchema>;
export type PaidReportTier = ReportProductCode;

const fullReportEntitlements: PaidReportEntitlements = {
  companiesHouse: {
    profile: true,
    addressHistory: true,
    officers: true,
    filingHistory: true,
    charges: true,
    insolvency: true,
  },
  registryTrust: { enabled: true, includeAmounts: true, includeSatisfaction: true },
  londonGazette: true,
  insolvencyDisqualifiedOfficers: true,
  fairPaymentCode: true,
  evidenceCoverage: true,
  relatedCompanies: false,
  aiInterpretation: true,
};

export const CANONICAL_PAID_REPORT_ENTITLEMENTS: Record<PaidReportTier, PaidReportEntitlements> = {
  single_report: fullReportEntitlements,
  starter_pack: fullReportEntitlements,
  business_pack: fullReportEntitlements,
  agency_pack: fullReportEntitlements,
};

export function entitlementsForTier(tier: PaidReportTier): PaidReportEntitlements {
  return paidReportEntitlementsSchema.parse(CANONICAL_PAID_REPORT_ENTITLEMENTS[tier]);
}
