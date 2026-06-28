import { z } from "zod";

export const reportTierSchema = z.enum(["basic", "standard", "premium"]);

const checkoutCompanyNumberSchema = z
  .string()
  .trim()
  .regex(/^[A-Z0-9]{2,16}$/i, "Companies House number must be 2-16 letters or numbers.")
  .transform((value) => value.toUpperCase());

export const guestEmailSchema = z
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

export type CheckoutSelection = z.infer<typeof checkoutSelectionSchema>;
export type ReportTier = z.infer<typeof reportTierSchema>;
