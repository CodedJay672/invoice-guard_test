"use server";

import { revalidatePath } from "next/cache";

import { assertWebProxyProductionConfig, loadWebProxyConfig } from "@workspace/config/web";
import { reportReferenceSchema } from "@workspace/validation/report-delivery";

import { resolveAuthIdentity } from "@/lib/auth/identity";
import { addTrustedPrincipalHeaders } from "@/lib/auth/trusted-principal";

export type RetryReportPdfResult = { ok: true } | { ok: false; message: string };

export async function retryReportPdf(reportReference: string): Promise<RetryReportPdfResult> {
  try {
    const parsed = reportReferenceSchema.safeParse(reportReference);
    if (!parsed.success) return { ok: false, message: "Report reference is invalid." };

    const identity = await resolveAuthIdentity();
    if (identity.state !== "verified") return { ok: false, message: "Sign in to retry the PDF." };

    const config = loadWebProxyConfig();
    assertWebProxyProductionConfig(config);
    const headers = new Headers({ Accept: "application/json" });
    addTrustedPrincipalHeaders(headers, identity);
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), config.timeoutMs);

    try {
      const response = await fetch(
        new URL(`/reports/${encodeURIComponent(parsed.data)}/pdf/retry`, config.apiBaseUrl),
        {
          method: "POST",
          cache: "no-store",
          headers,
          signal: abortController.signal,
        },
      );
      if (!response.ok) return { ok: false, message: "PDF retry could not be queued." };
      revalidatePath(`/reports/${parsed.data}`);
      return { ok: true };
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return { ok: false, message: "PDF retry could not be queued." };
  }
}
