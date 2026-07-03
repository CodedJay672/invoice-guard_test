import { notFound } from "next/navigation";

import { loadWebProxyConfig } from "@workspace/config/web";

import { PremiumPdfDocument } from "@/components/premium-pdf/PremiumPdfDocument";
import {
  getPremiumPdfFixture,
  premiumPdfFixtureNames,
  resolvePremiumPdfFixtureName,
} from "@/components/premium-pdf/fixtures";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: PageProps) {
  if (loadWebProxyConfig().environment === "production") notFound();
  const query = await searchParams;
  const fixtureName = resolvePremiumPdfFixtureName(singleValue(query.fixture));
  const fixture = getPremiumPdfFixture(fixtureName);

  return (
    <>
      <nav
        aria-label="Premium PDF preview fixtures"
        className="border-b border-line bg-surface px-4 py-4 print:hidden"
      >
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2">
          <p className="mr-2 text-sm font-medium text-content">18A document fixtures</p>
          {premiumPdfFixtureNames.map((candidate) => (
            <a
              key={candidate}
              href={`/reports/preview/pdf?fixture=${candidate}`}
              aria-current={candidate === fixtureName ? "page" : undefined}
              className="rounded-md border border-line bg-surface px-3 py-2 text-xs text-content-muted hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
            >
              {candidate.replaceAll("-", " ")}
            </a>
          ))}
        </div>
      </nav>
      <PremiumPdfDocument fixture={fixture} />
    </>
  );
}

function singleValue(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}
