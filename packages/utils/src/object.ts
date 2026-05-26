export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function omitUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(value) as Array<keyof T>) {
    const item = value[key];

    if (item !== undefined) {
      result[key] = item;
    }
  }

  return result;
}

export function pickDefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return omitUndefined(value);
}
