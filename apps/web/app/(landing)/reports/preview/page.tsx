import { notFound } from "next/navigation";

import { loadWebProxyConfig } from "@workspace/config/web";

import { PaidReportSections } from "@/components/paid-report/PaidReportSections";
import {
  getPaidReportFixture,
  paidReportFixtureNames,
  paidReportTiers,
  resolvePaidReportFixtureName,
  resolvePaidReportTier,
} from "@/components/paid-report/fixtures";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const config = loadWebProxyConfig();
  if (config.environment === "production") notFound();

  const query = await searchParams;
  const tier = resolvePaidReportTier(singleValue(query.tier));
  const fixtureName = resolvePaidReportFixtureName(singleValue(query.fixture));
  const report = getPaidReportFixture(tier, fixtureName);

  return (
    <>
      <nav aria-label="Paid report preview fixtures" className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-content">Development fixture index</p>
          <div className="flex flex-wrap gap-2">
            {paidReportTiers.map((candidate) => (
              <a
                key={candidate}
                href={`/reports/preview?tier=${candidate}&fixture=${fixtureName}`}
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-content hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
                aria-current={candidate === tier ? "page" : undefined}
              >
                {candidate.charAt(0).toUpperCase() + candidate.slice(1)}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {paidReportFixtureNames.map((candidate) => (
              <a
                key={candidate}
                href={`/reports/preview?tier=${tier}&fixture=${candidate}`}
                className="rounded-md border border-line bg-surface px-3 py-2 text-xs text-content-muted hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
                aria-current={candidate === fixtureName ? "page" : undefined}
              >
                {candidate.replaceAll("-", " ")}
              </a>
            ))}
          </div>
        </div>
      </nav>
      <PaidReportSections report={report} />
    </>
  );
}

function singleValue(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}
