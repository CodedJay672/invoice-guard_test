import { z } from "zod";

export type RuntimeEnvironment = "development" | "test" | "production";

export const runtimeEnvironmentSchema = z
  .enum(["development", "test", "production"])
  .default("development");

export const optionalUrlSchema = z.string().url().optional();

export function readBooleanFlag(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined || value === "") {
    return defaultValue;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}
