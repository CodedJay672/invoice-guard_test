import { z } from "zod";
import type { ReportProductCode } from "@workspace/types";

export const reportProductCodeSchema = z.enum([
  "single_report",
  "starter_pack",
  "business_pack",
  "agency_pack",
]) satisfies z.ZodType<ReportProductCode>;

export const reportTierSchema = reportProductCodeSchema;

const checkoutCompanyNumberSchema = z
  .string()
  .trim()
  .regex(/^[A-Z0-9]{2,16}$/i, "Companies House number must be 2-16 letters or numbers.")
  .transform((value) => value.toUpperCase());

export const verifiedEmailSchema = z
  .string()
  .trim()
  .min(1, "Enter the email address that should receive the report.")
  .email("Enter a valid email address.")
  .max(254, "Email address must be 254 characters or fewer.")
  .transform((value) => value.toLowerCase());

export const checkoutSelectionSchema = z.object({
  companyNumber: checkoutCompanyNumberSchema,
  tier: reportTierSchema,
  q: z.string().trim().min(1).max(160).optional(),
});

export const createCheckoutSessionSchema = checkoutSelectionSchema
  .pick({ companyNumber: true, tier: true })
  .extend({
    attemptId: z.string().uuid("Checkout attempt ID must be a UUID."),
  });

export const checkoutSessionIdSchema = z
  .string()
  .trim()
  .min(8)
  .max(128)
  .regex(/^cs_(?:test_|live_)?[A-Za-z0-9_]+$/, "Invalid Checkout Session ID.");

export const checkoutStatusSchema = z.enum([
  "confirming",
  "paid_pending",
  "delayed",
  "cancelled",
  "failed",
]);

export type CheckoutSelection = z.infer<typeof checkoutSelectionSchema>;
export type ReportTier = z.infer<typeof reportProductCodeSchema>;
export type ReportProductCodeInput = ReportTier;
export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
export type CheckoutStatus = z.infer<typeof checkoutStatusSchema>;
