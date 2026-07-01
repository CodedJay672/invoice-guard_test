import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Database,
  FileCheck2,
  FileSearch,
  Landmark,
  LockKeyhole,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

import Footer from "@/components/footer";
import { RootSearchBar } from "@/components/root-searchbar";

const steps: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Search,
    title: "Search the register",
    description: "Find the exact UK company by registered name or number.",
  },
  {
    icon: Building2,
    title: "Confirm the company",
    description: "Use the Companies House number as the canonical identity.",
  },
  {
    icon: FileSearch,
    title: "Review the preview",
    description: "See company facts and the status of every free source checked.",
  },
  {
    icon: FileCheck2,
    title: "Choose your report",
    description: "Unlock deeper records with a one-off report when you need it.",
  },
];

const products = [
  {
    name: "Basic",
    price: "£7.99",
    description: "Core records for a quick factual check",
    items: ["Court record count", "Directors", "Registered-address history"],
    featured: false,
  },
  {
    name: "Standard",
    price: "£14.99",
    description: "A fuller view for everyday decisions",
    items: ["Everything in Basic", "Court record details", "Filings and registered charges"],
    featured: true,
  },
  {
    name: "Premium",
    price: "£27",
    description: "Deepest checks with a portable record",
    items: ["Everything in Standard", "Deeper director checks", "Timestamped branded PDF"],
    featured: false,
  },
] as const;

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-brand-navy text-content-inverse">
        <div className="pointer-events-none absolute -top-40 right-0 size-96 rounded-full bg-brand-teal/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:px-8 lg:py-28">
          <div className="flex min-w-0 flex-col gap-7">
            <Badge className="w-fit border-brand-teal/30 bg-brand-teal/10 px-3 py-1 text-brand-teal">
              <BadgeCheck aria-hidden="true" />
              UK company intelligence
            </Badge>
            <div className="flex flex-col gap-5">
              <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[0.98] font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                Check the company
                <span className="mt-1 block text-brand-teal">before you commit.</span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-content-inverse/70">
                Search any UK company, review a factual free preview, and get deeper public-record
                checks in one clear report.
              </p>
            </div>
            <RootSearchBar />
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-content-inverse/70">
              {["No account needed", "Companies House identity", "One-off reports"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check aria-hidden="true" className="size-4 text-brand-teal" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-8 rounded-full bg-brand-teal/10 blur-3xl" />
            <Card className="relative gap-0 overflow-visible border-content-inverse/10 bg-surface py-0 text-content shadow-2xl">
              <div className="flex items-center gap-2 border-b border-line px-5 py-4">
                <span className="size-2.5 rounded-full bg-critical" />
                <span className="size-2.5 rounded-full bg-caution" />
                <span className="size-2.5 rounded-full bg-positive" />
                <span className="ml-3 font-mono text-xs text-content-subtle">
                  invoiceguard.com/report
                </span>
              </div>
              <CardHeader className="border-b border-line py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-md bg-brand-navy font-semibold text-content-inverse">
                      AC
                    </div>
                    <div>
                      <CardTitle className="font-semibold">ACME Supplies Limited</CardTitle>
                      <p className="mt-1 font-mono text-xs text-content-muted">01234567</p>
                    </div>
                  </div>
                  <Badge variant="positive">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 py-5">
                {(
                  [
                    { icon: Landmark, label: "Companies House", value: "Identity confirmed" },
                    {
                      icon: ShieldCheck,
                      label: "Insolvency records",
                      value: "No records in checked source",
                    },
                    { icon: Database, label: "London Gazette", value: "Source checked" },
                  ] satisfies { icon: LucideIcon; label: string; value: string }[]
                ).map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 rounded-md border border-line bg-page p-3"
                  >
                    <span className="flex items-center gap-3 text-sm font-medium">
                      <Icon aria-hidden="true" className="size-4 text-brand-teal" />
                      {label}
                    </span>
                    <span className="text-right text-xs text-content-muted">{value}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 rounded-md bg-brand-navy p-4 text-content-inverse">
                  <LockKeyhole aria-hidden="true" className="size-5 text-brand-teal" />
                  <div>
                    <p className="text-sm font-semibold">Court records</p>
                    <p className="text-xs text-content-inverse/60">Available in paid reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section aria-label="Data sources" className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 py-6 text-sm font-medium text-content-muted sm:px-6 lg:px-8">
          <span className="text-xs tracking-widest text-content-subtle uppercase">
            Data sourced from
          </span>
          <span>Companies House</span>
          <span>The Gazette</span>
          <span>Insolvency records</span>
          <span>Registry Trust after purchase</span>
        </div>
      </section>

      <section id="how-it-works" className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="How it works" title="A clearer company check in four steps" />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <Card
                key={title}
                className="relative transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="absolute top-5 right-5 font-mono text-xs font-semibold text-content-subtle">
                  0{index + 1}
                </span>
                <CardHeader>
                  <div className="flex size-12 items-center justify-center rounded-md bg-brand-teal/10 text-brand-teal">
                    <Icon aria-hidden="true" className="size-6" />
                  </div>
                  <CardTitle className="pt-4 text-lg font-semibold">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-6 text-content-muted">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-page py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="flex flex-col gap-5">
            <p className="text-xs font-bold tracking-[0.18em] text-brand-teal uppercase">
              Evidence, not verdicts
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-4xl leading-tight font-semibold tracking-tight text-brand-navy sm:text-5xl">
              See what was checked—and what was not.
            </h2>
            <p className="max-w-xl text-base leading-7 text-content-muted">
              Every preview separates retrieved records, unavailable data, and paid-only sources.
              InvoiceGuard presents facts without issuing a risk score or approval decision.
            </p>
            <Button asChild variant="authoritative" size="lg" className="mt-2 w-fit px-5">
              <Link href="/search">
                Search a company
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                {
                  icon: BadgeCheck,
                  title: "Canonical identity",
                  copy: "Registered name and Companies House number stay visible.",
                },
                {
                  icon: Database,
                  title: "Source status",
                  copy: "Every provider is marked checked, failed, or not yet checked.",
                },
                {
                  icon: FileCheck2,
                  title: "Frozen record",
                  copy: "Paid reports preserve the public-record position at generation.",
                },
                {
                  icon: ShieldCheck,
                  title: "Factual language",
                  copy: "No credit scores, recommendations, or legal conclusions.",
                },
              ] satisfies { icon: LucideIcon; title: string; copy: string }[]
            ).map(({ icon: Icon, title, copy }) => (
              <Card key={title} size="sm">
                <CardHeader>
                  <Icon aria-hidden="true" className="size-5 text-brand-teal" />
                  <CardTitle className="pt-2 font-semibold">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-content-muted">{copy}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="One-off reports" title="Choose the depth you need" />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {products.map((product) => (
              <Card
                key={product.name}
                className={product.featured ? "border-brand-teal shadow-lg" : undefined}
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-xl font-semibold">{product.name}</CardTitle>
                    {product.featured ? <Badge>Most popular</Badge> : null}
                  </div>
                  <p className="pt-2 text-sm text-content-muted">{product.description}</p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-6">
                  <p className="font-mono text-4xl font-semibold tracking-tight">{product.price}</p>
                  <ul className="flex flex-col gap-3 text-sm text-content-muted">
                    {product.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-brand-teal"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    variant={product.featured ? "default" : "outline"}
                    className="mt-auto"
                  >
                    <Link href="/search">Find a company</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-navy py-16 text-content-inverse">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
            Check the company behind the invoice.
          </h2>
          <p className="max-w-2xl text-content-inverse/65">
            Start with a free company preview. No account or subscription required.
          </p>
          <Button asChild size="lg" className="px-6">
            <Link href="/search">
              Search Companies House
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
      <p className="text-xs font-bold tracking-[0.18em] text-brand-teal uppercase">{eyebrow}</p>
      <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-brand-navy sm:text-5xl">
        {title}
      </h2>
    </div>
  );
}
