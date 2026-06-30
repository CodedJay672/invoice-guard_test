import { notFound } from "next/navigation";

import { loadWebProxyConfig } from "@workspace/config/web";

import { ReportLifecyclePanel } from "@/components/report-lifecycle/ReportLifecyclePanel";
import {
  normaliseReportReference,
  resolveReportLifecycleFixtureName,
} from "@/components/report-lifecycle/fixtures";

type PageProps = {
  params: Promise<{ reportReference: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const config = loadWebProxyConfig();
  const route = await params;
  const query = await searchParams;
  const reportReference = normaliseReportReference(route.reportReference);

  if (!reportReference) notFound();

  const fixtureName = resolveReportLifecycleFixtureName(
    singleValue(query.fixture),
    config.environment,
  );

  return <ReportLifecyclePanel reportReference={reportReference} fixtureName={fixtureName} />;
}

function singleValue(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}
