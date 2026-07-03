import { notFound } from "next/navigation";

import { loadWebProxyConfig } from "@workspace/config/web";

import { getReportReadyEmailFixture } from "@/components/report-notification/fixtures";
import { ReportReadyEmail } from "@/components/report-notification/ReportReadyEmail";

export default function Page() {
  const config = loadWebProxyConfig();
  if (config.environment === "production") notFound();

  return <ReportReadyEmail email={getReportReadyEmailFixture()} />;
}
