import type { z } from "zod";

type GenericSchema = z.ZodType<unknown, z.ZodTypeDef, unknown>;

export function parseWithSchema<TSchema extends GenericSchema>(
  schema: TSchema,
  input: unknown,
): z.infer<TSchema> {
  return schema.parse(input);
}

export function safeParseWithSchema<TSchema extends GenericSchema>(
  schema: TSchema,
  input: unknown,
): z.SafeParseReturnType<unknown, z.infer<TSchema>> {
  return schema.safeParse(input);
}
