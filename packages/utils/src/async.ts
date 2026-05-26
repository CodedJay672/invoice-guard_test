function assertValidMilliseconds(milliseconds: number): void {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    throw new RangeError("Milliseconds must be a finite, non-negative number.");
  }
}

export function sleep(milliseconds: number): Promise<void> {
  assertValidMilliseconds(milliseconds);

  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function withTimeout<T>(
  promise: Promise<T>,
  milliseconds: number,
  message = "Operation timed out.",
): Promise<T> {
  assertValidMilliseconds(milliseconds);

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(message));
    }, milliseconds);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
