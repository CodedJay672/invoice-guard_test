import { NextResponse } from "next/server";

import { assertWebProxyProductionConfig, loadWebProxyConfig } from "@workspace/config/web";
import { reportReferenceSchema } from "@workspace/validation/report-delivery";

import { resolveAuthIdentity } from "@/lib/auth/identity";
import { addTrustedPrincipalHeaders } from "@/lib/auth/trusted-principal";

export const runtime = "nodejs";

type PdfRouteContext = { params: Promise<{ reportReference: string }> };

export async function GET(_request: Request, context: PdfRouteContext) {
  return proxy(context, false);
}

export async function POST(_request: Request, context: PdfRouteContext) {
  return proxy(context, true);
}

async function proxy(context: PdfRouteContext, retry: boolean) {
  const config = loadWebProxyConfig();
  assertWebProxyProductionConfig(config);
  const identity = await resolveAuthIdentity();
  if (identity.state !== "verified")
    return NextResponse.json({ error: { code: "authentication_required" } }, { status: 401 });
  const parsed = reportReferenceSchema.safeParse((await context.params).reportReference);
  if (!parsed.success)
    return NextResponse.json({ error: { code: "invalid_report_reference" } }, { status: 400 });
  const headers = new Headers({ Accept: "application/json" });
  addTrustedPrincipalHeaders(headers, identity);
  const target = new URL(
    `/reports/${encodeURIComponent(parsed.data)}/pdf${retry ? "/retry" : ""}`,
    config.apiBaseUrl,
  );
  const response = await fetch(target, {
    method: retry ? "POST" : "GET",
    headers,
    cache: "no-store",
    redirect: "manual",
  });
  const body = await response.arrayBuffer();
  if (!retry && response.ok) {
    const payload = JSON.parse(Buffer.from(body).toString("utf8")) as { data?: { url?: unknown } };
    if (typeof payload.data?.url === "string") return NextResponse.redirect(payload.data.url, 302);
  }
  return new NextResponse(body, {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
  });
}
