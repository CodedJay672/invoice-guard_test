import Link from "next/link";
import type { ReactNode } from "react";
import {
  Building2,
  CircleAlert,
  FileText,
  Landmark,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import type { FreePreviewPayload } from "@workspace/types";

import type { PreviewRequestResult } from "@/lib/data/free-company-prev";

import { MobileTabSelect } from "./MobileTabSelect";
import {
  companyWorkspaceTabs,
  fixtureCompany,
  type ChargeRecord,
  type CompanyWorkspaceFixture,
  type CompanyWorkspaceTab,
  type FilingRecord,
  type InsolvencyCaseRecord,
  type OfficerRecord,
  type SourceState,
  type WorkspaceFact,
} from "./fixtures";

type CompanyWorkspaceProps = {
  activeTab: CompanyWorkspaceTab;
  houseNumber: string;
  fixture: CompanyWorkspaceFixture;
  previewResult: PreviewRequestResult;
};

export function CompanyWorkspace({
  activeTab,
  houseNumber,
  fixture,
  previewResult,
}: CompanyWorkspaceProps) {
  const company =
    previewResult.status === "success" ? previewResult.preview.company : fixtureCompany;

  return (
    <main className="min-h-svh bg-page text-content">
      <CompanyMasthead company={company} previewResult={previewResult} />
      <CompanyTabs activeTab={activeTab} houseNumber={houseNumber} />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {previewResult.status === "failed" ? (
          <Alert variant="caution">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>Company overview could not be refreshed</AlertTitle>
            <AlertDescription>
              {previewResult.message} Fixture content below is for the 12C UI state only.
            </AlertDescription>
          </Alert>
        ) : null}
        <SourceStatusCard source={fixture.source} />
        <TabPanel fixture={fixture} />
      </section>
    </main>
  );
}

type CompanyMastheadProps = {
  company: FreePreviewPayload["company"];
  previewResult: PreviewRequestResult;
};

function CompanyMasthead({ company, previewResult }: CompanyMastheadProps) {
  const statusIsActive = company.companyStatus.trim().toLowerCase() === "active";
  const address = formatAddress(company.registeredOfficeAddress);

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold text-content-muted uppercase">Company name</p>
          <h1 className="text-2xl font-semibold text-brand-navy">{company.companyName}</h1>
          <p className="mt-2 text-sm text-content-muted">
            <span className="font-mono text-content">{company.companiesHouseNumber}</span>
            {" - "}
            {company.companyType?.toUpperCase() ?? "Type not listed"}
            {" - "}
            Incorporated {formatDisplayDate(company.incorporationDate)}
          </p>
          <p className="mt-1 text-sm text-content-muted">{address}</p>
        </div>
        <div className="flex min-w-0 flex-col items-start gap-3 lg:items-end">
          <Badge variant={statusIsActive ? "positive" : "caution"} className="h-auto px-3 py-1">
            {company.companyStatus}
          </Badge>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Badge variant="outline">Companies House</Badge>
            <Badge variant={previewResult.status === "success" ? "positive" : "caution"}>
              {previewResult.status === "success" ? "Overview refreshed" : "Overview fixture"}
            </Badge>
          </div>
          <p className="max-w-sm text-left text-xs text-content-muted lg:text-right">
            SIC {company.sicCodes.join(", ") || "not listed"}
            {company.industryLabel ? ` - ${company.industryLabel}` : ""}
          </p>
        </div>
      </div>
    </header>
  );
}

type CompanyTabsProps = {
  activeTab: CompanyWorkspaceTab;
  houseNumber: string;
};

function CompanyTabs({ activeTab, houseNumber }: CompanyTabsProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-line bg-surface">
      <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <MobileTabSelect activeTab={activeTab} houseNumber={houseNumber} />
        <nav aria-label="Company sections" className="hidden overflow-x-auto md:block">
          <ul className="flex min-w-max items-center gap-1">
            {companyWorkspaceTabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <li key={tab.id}>
                  <Link
                    href={`/company/${houseNumber}/${tab.href}`}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-md border border-transparent px-3 py-2 text-sm font-medium text-content-muted transition hover:border-line hover:text-content focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none",
                      isActive ? "border-brand-teal bg-surface-subtle text-content" : "bg-surface",
                    )}
                  >
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

type SourceStatusCardProps = {
  source: SourceState;
};

function SourceStatusCard({ source }: SourceStatusCardProps) {
  const badgeVariant =
    source.status === "available" ? "positive" : source.status === "failed" ? "caution" : "outline";

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <SourceIcon source={source} />
          <div className="min-w-0">
            <p className="font-semibold text-content">{source.label}</p>
            <p className="text-sm text-content-muted">{source.detail}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Badge variant={badgeVariant}>{source.label}</Badge>
          {source.checkedAt ? (
            <span className="text-xs text-content-muted">
              Checked {formatDisplayDate(source.checkedAt)}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function SourceIcon({ source }: SourceStatusCardProps) {
  if (source.status === "failed") {
    return (
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-caution-content" />
    );
  }

  if (source.status === "paid_placeholder" || source.status === "not_yet_checked") {
    return <LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-content-muted" />;
  }

  return (
    <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-positive-content" />
  );
}

type TabPanelProps = {
  fixture: CompanyWorkspaceFixture;
};

function TabPanel({ fixture }: TabPanelProps) {
  if (fixture.source.detail === "Loading public record data.") {
    return <LoadingPanel fixture={fixture} />;
  }

  if (fixture.source.status === "failed") {
    return <FailedPanel fixture={fixture} />;
  }

  if (fixture.pendingPlaceholder) {
    return <PendingPanel fixture={fixture} />;
  }

  if (fixture.paidPlaceholder) {
    return <PaidPlaceholderPanel fixture={fixture} />;
  }

  switch (fixture.tab) {
    case "overview":
      return <FactsPanel fixture={fixture} icon={Building2} />;
    case "filing-history":
      return <FilingHistoryPanel fixture={fixture} />;
    case "charges":
      return <ChargesPanel fixture={fixture} />;
    case "officers":
      return <OfficersPanel fixture={fixture} />;
    case "insolvency":
      return <InsolvencyPanel fixture={fixture} />;
    default:
      return <FactsPanel fixture={fixture} icon={FileText} />;
  }
}

function LoadingPanel({ fixture }: TabPanelProps) {
  return (
    <Card aria-busy="true">
      <CardHeader>
        <CardTitle>{fixture.title}</CardTitle>
        <CardDescription>{fixture.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </CardContent>
    </Card>
  );
}

function FailedPanel({ fixture }: TabPanelProps) {
  return (
    <Alert variant="caution">
      <CircleAlert aria-hidden="true" />
      <AlertTitle>{fixture.title}</AlertTitle>
      <AlertDescription>
        Data could not be retrieved. Companies House failure does not confirm any record position.
      </AlertDescription>
    </Alert>
  );
}

function PendingPanel({ fixture }: TabPanelProps) {
  const pending = fixture.pendingPlaceholder;
  if (!pending) return null;

  return (
    <Alert>
      <ShieldCheck aria-hidden="true" />
      <AlertTitle>{pending.title}</AlertTitle>
      <AlertDescription>{pending.body}</AlertDescription>
    </Alert>
  );
}

type FactsPanelProps = TabPanelProps & {
  icon: LucideIcon;
};

function FactsPanel({ fixture, icon: Icon }: FactsPanelProps) {
  const facts = fixture.facts ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Icon aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand-navy" />
          <div>
            <CardTitle>{fixture.title}</CardTitle>
            <CardDescription>{fixture.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{facts.length ? <FactGrid facts={facts} /> : <EmptyState />}</CardContent>
    </Card>
  );
}

function FactGrid({ facts }: { facts: WorkspaceFact[] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {facts.map((fact) => (
        <div key={fact.label} className="rounded-md border border-line bg-surface-subtle p-3">
          <dt className="mb-1 text-xs font-semibold text-content-muted uppercase">{fact.label}</dt>
          <dd className="text-sm font-semibold break-words text-content">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function FilingHistoryPanel({ fixture }: TabPanelProps) {
  const filings = fixture.filings ?? [];

  return (
    <RecordCard title={fixture.title} description={fixture.description} icon={FileText}>
      {filings.length ? <FilingList filings={filings} /> : <EmptyState />}
    </RecordCard>
  );
}

function FilingList({ filings }: { filings: FilingRecord[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="hidden grid-cols-[120px_90px_minmax(0,1fr)_120px_90px] gap-3 border-b border-line bg-surface-subtle px-4 py-3 text-xs font-semibold text-content-muted uppercase md:grid">
        <span>Date</span>
        <span>Type</span>
        <span>Description</span>
        <span>Category</span>
        <span>Pages</span>
      </div>
      <div className="divide-y divide-line">
        {filings.map((filing) => (
          <article
            key={`${filing.date}-${filing.type}`}
            className="grid gap-2 px-4 py-4 text-sm md:grid-cols-[120px_90px_minmax(0,1fr)_120px_90px] md:gap-3"
          >
            <span className="font-medium text-content">{formatDisplayDate(filing.date)}</span>
            <span className="font-mono text-content-muted">{filing.type}</span>
            <span className="text-content">{filing.description}</span>
            <span className="text-content-muted">{filing.category}</span>
            <span className="text-content-muted">{filing.pages}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

function ChargesPanel({ fixture }: TabPanelProps) {
  const charges = fixture.charges ?? [];

  return (
    <RecordCard title={fixture.title} description={fixture.description} icon={Landmark}>
      {charges.length ? (
        <div className="grid gap-3">
          {charges.map((charge) => (
            <ChargeCard key={`${charge.createdOn}-${charge.personsEntitled}`} charge={charge} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </RecordCard>
  );
}

function ChargeCard({ charge }: { charge: ChargeRecord }) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-content">{charge.classification}</h3>
          <p className="mt-1 text-sm text-content-muted">{charge.description}</p>
        </div>
        <Badge variant={charge.status === "Satisfied" ? "positive" : "caution"}>
          {charge.status}
        </Badge>
      </div>
      <FactGrid
        facts={[
          { label: "Created", value: formatDisplayDate(charge.createdOn) },
          { label: "Persons entitled", value: charge.personsEntitled },
        ]}
      />
    </article>
  );
}

function OfficersPanel({ fixture }: TabPanelProps) {
  const officers = fixture.officers ?? [];

  return (
    <RecordCard title={fixture.title} description={fixture.description} icon={Users}>
      {officers.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {officers.map((officer) => (
            <OfficerCard key={`${officer.name}-${officer.appointedOn}`} officer={officer} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </RecordCard>
  );
}

function OfficerCard({ officer }: { officer: OfficerRecord }) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold break-words text-content">{officer.name}</h3>
          <p className="mt-1 text-sm text-content-muted">{officer.role}</p>
        </div>
        <Badge variant={officer.resignedOn ? "outline" : "positive"}>
          {officer.resignedOn ? "Resigned" : "Active"}
        </Badge>
      </div>
      <FactGrid
        facts={[
          { label: "Appointed", value: formatDisplayDate(officer.appointedOn) },
          { label: "Resigned", value: formatDisplayDate(officer.resignedOn) },
          { label: "Occupation", value: officer.occupation ?? "Not listed" },
          { label: "Residence", value: officer.residence ?? "Not listed" },
        ]}
      />
    </article>
  );
}

function InsolvencyPanel({ fixture }: TabPanelProps) {
  const cases = fixture.insolvencyCases ?? [];

  return (
    <RecordCard title={fixture.title} description={fixture.description} icon={Scale}>
      {cases.length ? (
        <div className="grid gap-3">
          {cases.map((item) => (
            <InsolvencyCaseCard key={`${item.type}-${item.startedOn}`} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </RecordCard>
  );
}

function InsolvencyCaseCard({ item }: { item: InsolvencyCaseRecord }) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-content">{item.type}</h3>
          <p className="mt-1 text-sm text-content-muted">{item.notes}</p>
        </div>
        <Badge variant="caution">{item.status}</Badge>
      </div>
      <FactGrid
        facts={[
          { label: "Started", value: formatDisplayDate(item.startedOn) },
          { label: "Practitioner", value: item.practitioner },
        ]}
      />
    </article>
  );
}

type RecordCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
};

function RecordCard({ title, description, icon: Icon, children }: RecordCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Icon aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand-navy" />
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Alert variant="positive">
      <ShieldCheck aria-hidden="true" />
      <AlertTitle>No records found in checked sources</AlertTitle>
      <AlertDescription>
        Companies House was the checked source for this free tab. This does not include CCJs, Fair
        Payment Code, or AI interpretation.
      </AlertDescription>
    </Alert>
  );
}

function PaidPlaceholderPanel({ fixture }: TabPanelProps) {
  const placeholder = fixture.paidPlaceholder;
  if (!placeholder) return null;

  return (
    <Card className={fixture.tab === "ai-summary" ? "border-brand-teal" : undefined}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{placeholder.title}</CardTitle>
            <CardDescription>{placeholder.body}</CardDescription>
          </div>
          <Badge variant="outline">{placeholder.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {fixture.tab === "ai-summary" ? (
          <div className="rounded-lg border border-line bg-surface-subtle p-4" aria-hidden="true">
            <div className="space-y-3 blur-sm select-none">
              {(placeholder.blurredLines ?? []).map((line) => (
                <p
                  key={line}
                  className="rounded-md bg-surface px-3 py-2 text-sm text-content-muted"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <Alert variant="caution">
            <LockKeyhole aria-hidden="true" />
            <AlertTitle>Source not yet checked</AlertTitle>
            <AlertDescription>{placeholder.body}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

function formatAddress(address: FreePreviewPayload["company"]["registeredOfficeAddress"]): string {
  return (
    [
      address.addressLine1,
      address.addressLine2,
      address.locality,
      address.region,
      address.country,
      address.postalCode,
    ]
      .filter(Boolean)
      .join(", ") || "Area not listed"
  );
}

function formatDisplayDate(value: string | undefined): string {
  if (!value) return "Not listed";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
