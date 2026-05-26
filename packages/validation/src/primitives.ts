import { z } from "zod";

export const nonEmptyStringSchema = z.string().trim().min(1);

export const emailSchema = z.string().trim().email().toLowerCase();

export const uuidSchema = z.string().uuid();

export const isoDateStringSchema = z.string().datetime();

export const positiveIntegerSchema = z.number().int().positive();

export const paginationPageSchema = z.number().int().min(1);

export const paginationLimitSchema = z.number().int().min(1).max(50);
