import { z } from "zod";

const nullableFactsSchema = z.record(z.unknown()).nullable();

export const aiInterpretationInputSchema = z
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

export const aiInterpretationOutputSchema = z
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

export type AiInterpretationInput = z.infer<typeof aiInterpretationInputSchema>;
export type AiInterpretationOutput = z.infer<typeof aiInterpretationOutputSchema>;
