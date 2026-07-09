import "server-only";

import {
  apiErrorResponseSchema,
  freePreviewApiResponseSchema,
  type FreePreviewPayload,
} from "@workspace/validation";
import { assertWebProxyProductionConfig, loadWebProxyConfig } from "@workspace/config/web";

export type PreviewRequestResult =
  | { status: "success"; preview: FreePreviewPayload }
  | { status: "failed"; message: string };

export async function requestFreePreview(companyNumber: string): Promise<PreviewRequestResult> {
  const config = loadWebProxyConfig();
  assertWebProxyProductionConfig(config);
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), config.timeoutMs);

  try {
    const response = await fetch(
      new URL(`/companies/${encodeURIComponent(companyNumber)}/free-preview`, config.apiBaseUrl),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
        signal: abortController.signal,
      },
    );
    const body = (await response.json()) as unknown;

    if (!response.ok) {
      const error = apiErrorResponseSchema.safeParse(body);
      return {
        status: "failed",
        message: error.success
          ? error.data.error.message
          : "Free preview could not be retrieved right now.",
      };
    }

    const parsed = freePreviewApiResponseSchema.safeParse(body);
    console.log(parsed);
    return parsed.success
      ? { status: "success", preview: parsed.data.data.preview }
      : { status: "failed", message: "Free preview could not be retrieved right now." };
  } catch {
    return { status: "failed", message: "Free preview could not be retrieved right now." };
  } finally {
    clearTimeout(timeout);
  }
}
