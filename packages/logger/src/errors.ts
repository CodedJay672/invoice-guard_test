export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
}

export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return {
      name: error.name || "Error",
      message: error.message || "Unknown error",
      ...(error.stack ? { stack: error.stack } : {}),
    };
  }

  return {
    name: "NonErrorThrown",
    message: "A non-Error value was thrown.",
  };
}
