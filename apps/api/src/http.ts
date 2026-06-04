import type { Response } from "express";

export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
  };
}

export function sendApiError(
  response: Response,
  statusCode: number,
  code: string,
  message: string,
): Response {
  return response.status(statusCode).json({
    error: {
      code,
      message,
    },
  } satisfies ApiErrorPayload);
}
