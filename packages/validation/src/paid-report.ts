import { z } from "zod";

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
export type PaidReportTier = "basic" | "standard" | "premium";

export const CANONICAL_PAID_REPORT_ENTITLEMENTS: Record<PaidReportTier, PaidReportEntitlements> = {
  basic: {
    companiesHouse: {
      profile: true,
      addressHistory: true,
      officers: true,
      filingHistory: false,
      charges: false,
      insolvency: false,
    },
    registryTrust: { enabled: true, includeAmounts: false, includeSatisfaction: false },
    londonGazette: false,
    insolvencyDisqualifiedOfficers: false,
    fairPaymentCode: false,
    evidenceCoverage: false,
    relatedCompanies: false,
    aiInterpretation: true,
  },
  standard: {
    companiesHouse: {
      profile: true,
      addressHistory: true,
      officers: true,
      filingHistory: true,
      charges: true,
      insolvency: false,
    },
    registryTrust: { enabled: true, includeAmounts: true, includeSatisfaction: true },
    londonGazette: false,
    insolvencyDisqualifiedOfficers: false,
    fairPaymentCode: false,
    evidenceCoverage: false,
    relatedCompanies: false,
    aiInterpretation: true,
  },
  premium: {
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
  },
};

export function entitlementsForTier(tier: PaidReportTier): PaidReportEntitlements {
  return paidReportEntitlementsSchema.parse(CANONICAL_PAID_REPORT_ENTITLEMENTS[tier]);
}
