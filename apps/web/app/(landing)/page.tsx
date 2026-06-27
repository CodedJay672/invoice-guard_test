import { BadgeCheck, Building2, FileSearch, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

import Footer from "@/components/footer";
import { RootSearchBar } from "@/components/root-searchbar";

const benefits = [
  {
    icon: Building2,
    title: "Confirm the registered company",
    description: "Select the exact Companies House entity before reviewing any records.",
  },
  {
    icon: ShieldCheck,
    title: "See what was checked",
    description: "Every preview separates retrieved records from unavailable or unchecked sources.",
  },
  {
    icon: FileSearch,
    title: "Choose the report you need",
    description: "Compare one-off Basic, Standard, and Premium reports with no subscription.",
  },
] as const;

export default function LandingPage() {
  return (
    <>
      <section className="bg-brand-navy text-content-inverse">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:px-8">
          <div className="flex min-w-0 flex-col gap-6">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-wider text-brand-teal uppercase">
              <BadgeCheck aria-hidden="true" className="size-4" />
              UK company intelligence
            </p>
            <div className="flex flex-col gap-4">
              <h1 className="max-w-3xl text-4xl leading-tight font-semibold sm:text-5xl">
                Check the company before you commit.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-content-inverse/80 sm:text-lg">
                Find the exact UK company, review a factual free preview, and choose a one-off
                report when you need deeper records.
              </p>
            </div>
            <RootSearchBar />
            <p className="text-sm text-content-inverse/70">
              No account needed for a free preview. Court records are not checked until you buy an
              eligible report.
            </p>
          </div>

          <Card tone="navy" className="border-content-inverse/20 bg-content-inverse/5 shadow-none">
            <CardHeader>
              <p className="text-xs font-semibold tracking-wider text-brand-teal uppercase">
                Free preview
              </p>
              <CardTitle className="text-xl">Know what the first check includes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3 text-sm text-content-inverse/80">
                <li>Registered identity and company status</li>
                <li>Incorporation date and registered area</li>
                <li>Active director count</li>
                <li>Visible status for every checked source</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-label="Free preview sources" className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <p className="text-xs font-semibold tracking-wider text-content-muted uppercase">
            Free preview sources
          </p>
          <p className="text-sm text-content">
            Companies House · London Gazette · Insolvency and disqualified-officer records
          </p>
        </div>
      </section>

      <section className="bg-page">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex max-w-2xl flex-col gap-3">
            <p className="text-xs font-semibold tracking-wider text-brand-teal uppercase">
              How it works
            </p>
            <h2 className="text-3xl font-semibold text-brand-navy">
              From search to factual record
            </h2>
            <p className="text-base leading-7 text-content-muted">
              InvoiceGuard keeps company identity, source status, and report scope clear at every
              step.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, description }) => (
              <Card key={title} size="sm">
                <CardHeader>
                  <Icon aria-hidden="true" className="size-5 text-brand-teal" />
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-content-muted">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
