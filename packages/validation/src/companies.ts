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
