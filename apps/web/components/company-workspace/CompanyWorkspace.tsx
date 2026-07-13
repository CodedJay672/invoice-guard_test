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
import {
  companiesHouseUnavailable,
  companyTypeLabel,
  formatCompaniesHouseAddress,
  formatCompaniesHouseDate,
  filingDescriptionValueLabel,
  formatFilingDescriptionValue,
  resolveFilingDescription,
  sentenceCase as displaySentenceCase,
} from "@/lib/company-display";

import { MobileTabSelect } from "./MobileTabSelect";
import { ProviderMetadata } from "@/components/provider-metadata/ProviderMetadata";
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
  fixtureMode: boolean;
};

export function CompanyWorkspace({
  activeTab,
  houseNumber,
  fixture,
  previewResult,
  fixtureMode,
}: CompanyWorkspaceProps) {
  const company =
    previewResult.status === "success"
      ? previewResult.preview.company
      : fixtureMode
        ? fixtureCompany
        : undefined;

  return (
    <main className="min-h-svh bg-page text-content">
      {company ? <CompanyMasthead company={company} previewResult={previewResult} /> : null}
      <CompanyTabs activeTab={activeTab} houseNumber={houseNumber} />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {previewResult.status === "failed" ? (
          <Alert variant="caution">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>Company overview could not be refreshed</AlertTitle>
            <AlertDescription>
              {previewResult.message} No company identity or unchecked facts are shown.
            </AlertDescription>
          </Alert>
        ) : null}
        <SourceStatusCard source={fixture.source} />
        <TabPanel fixture={fixture} />
        {fixture.pagination && fixture.pagination.totalPages > 1 ? (
          <nav aria-label="Tab result pages" className="flex items-center justify-between gap-4">
            <Link
              className={cn(
                "text-sm font-semibold text-brand-teal",
                fixture.pagination.page <= 1 && "pointer-events-none opacity-50",
              )}
              aria-disabled={fixture.pagination.page <= 1}
              href={`/company/${houseNumber}/${activeTab}?page=${Math.max(1, fixture.pagination.page - 1)}`}
            >
              Previous
            </Link>
            <span className="text-sm text-content-muted">
              Page {fixture.pagination.page} of {fixture.pagination.totalPages}
            </span>
            <Link
              className={cn(
                "text-sm font-semibold text-brand-teal",
                fixture.pagination.page >= fixture.pagination.totalPages &&
                  "pointer-events-none opacity-50",
              )}
              aria-disabled={fixture.pagination.page >= fixture.pagination.totalPages}
              href={`/company/${houseNumber}/${activeTab}?page=${Math.min(fixture.pagination.totalPages, fixture.pagination.page + 1)}`}
            >
              Next
            </Link>
          </nav>
        ) : null}
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

  let content: ReactNode;
  switch (fixture.tab) {
    case "overview":
      content = fixture.overviewCompany ? (
        <CompanyOverviewPanel company={fixture.overviewCompany} />
      ) : (
        <FactsPanel fixture={fixture} icon={Building2} />
      );
      break;
    case "filing-history":
      content = <FilingHistoryPanel fixture={fixture} />;
      break;
    case "charges":
      content = <ChargesPanel fixture={fixture} />;
      break;
    case "officers":
      content = <OfficersPanel fixture={fixture} />;
      break;
    case "insolvency":
      content = <InsolvencyPanel fixture={fixture} />;
      break;
    default:
      content = <FactsPanel fixture={fixture} icon={FileText} />;
  }
  return (
    <div className="grid gap-6">
      {content}
      <ProviderMetadata payload={fixture.providerPayload} />
    </div>
  );
}

function CompanyOverviewPanel({ company }: { company: FreePreviewPayload["company"] }) {
  const accounts = company.accounts;
  const confirmation = company.confirmationStatement;
  const sicRows = company.sicCodes.map((code, index) => ({
    label: code,
    value: company.sicDescriptions?.[index] ?? companiesHouseUnavailable,
  }));

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Company information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <FactSection title="Registered office address" wide>
            {formatCompaniesHouseAddress(company.registeredOfficeAddress)}
          </FactSection>
          <FactSection title="Company status">
            {displaySentenceCase(company.companyStatus)}
          </FactSection>
          <FactSection title="Company type">{companyTypeLabel(company.companyType)}</FactSection>
          <FactSection title="Incorporated on">
            {formatCompaniesHouseDate(company.incorporationDate)}
          </FactSection>
          {company.cessationDate ? (
            <FactSection title="Dissolved on">
              {formatCompaniesHouseDate(company.cessationDate)}
            </FactSection>
          ) : null}
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FactSection title="Next accounts made up to">
              {formatCompaniesHouseDate(
                accounts?.next_made_up_to ?? accounts?.next_accounts.period_end_on,
              )}
            </FactSection>
            <FactSection title="Due by">
              {formatCompaniesHouseDate(accounts?.next_due ?? accounts?.next_accounts.due_on)}
            </FactSection>
            <FactSection title="Last accounts made up to">
              {formatCompaniesHouseDate(
                accounts?.last_accounts.made_up_to ?? accounts?.last_accounts.period_end_on,
              )}
            </FactSection>
            <FactSection title="Accounts type">
              {displaySentenceCase(accounts?.last_accounts.type)}
            </FactSection>
            <FactSection title="Overdue">
              {accounts?.overdue === undefined
                ? companiesHouseUnavailable
                : accounts.overdue
                  ? "Yes"
                  : "No"}
            </FactSection>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Confirmation statement</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FactSection title="Next statement date">
              {formatCompaniesHouseDate(confirmation?.nextMadeUpTo)}
            </FactSection>
            <FactSection title="Due by">
              {formatCompaniesHouseDate(confirmation?.nextDue)}
            </FactSection>
            <FactSection title="Last statement dated">
              {formatCompaniesHouseDate(confirmation?.lastMadeUpTo)}
            </FactSection>
            <FactSection title="Overdue">
              {confirmation?.overdue === undefined
                ? companiesHouseUnavailable
                : confirmation.overdue
                  ? "Yes"
                  : "No"}
            </FactSection>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Nature of business (SIC)</CardTitle>
        </CardHeader>
        <CardContent>
          {sicRows.length ? (
            <dl className="grid gap-3">
              {sicRows.map((item) => (
                <div key={item.label}>
                  <dt className="inline font-mono font-semibold text-content">{item.label}</dt>
                  <dd className="inline text-content"> — {item.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-content-muted">{companiesHouseUnavailable}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FactSection({
  title,
  children,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  if (children === undefined || children === null || children === "") return null;
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <p className="text-sm text-content-muted">{title}</p>
      <p className="mt-1 font-semibold text-content">{children}</p>
    </div>
  );
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
  const visibleFacts = facts.filter(
    (fact) => fact.value.trim() && !/not listed|not supplied|no notes supplied/i.test(fact.value),
  );
  if (!visibleFacts.length) return null;
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
      {visibleFacts.map((fact) => (
        <div key={fact.label} className="w-full rounded-md border bg-transparent p-3">
          <dt className="mb-1 text-xs font-medium text-content-muted uppercase">{fact.label}</dt>
          <dd className="text-sm font-semibold wrap-break-word text-content">{fact.value}</dd>
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
        {filings.map((filing, idx) => (
          <article
            key={`${filing.date}-${filing.type}-${idx}`}
            className="grid gap-2 px-4 py-4 text-sm md:grid-cols-[120px_90px_minmax(0,1fr)_120px_90px] md:gap-3"
          >
            {filing.date ? (
              <span className="font-medium text-content">{formatDisplayDate(filing.date)}</span>
            ) : (
              <span />
            )}
            {filing.type ? (
              <span className="font-mono text-content-muted">
                <span className="md:hidden">Filing type: </span>
                {filing.type}
              </span>
            ) : (
              <span />
            )}
            {filing.description ? (
              <div className="grid gap-2">
                <span className="font-semibold text-content">
                  {resolveFilingDescription(filing.description, filing.descriptionValues)}
                </span>
                {filing.descriptionValues && Object.keys(filing.descriptionValues).length ? (
                  <dl className="grid gap-1 text-xs text-content-muted">
                    {Object.entries(filing.descriptionValues).map(([key, value]) => (
                      <div key={key} className="flex flex-wrap gap-1">
                        <dt>{filingDescriptionValueLabel(key)}:</dt>
                        <dd className="font-medium text-content">
                          {formatFilingDescriptionValue(key, value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            ) : (
              <span />
            )}
            {filing.category ? (
              <span className="text-content-muted">{filing.category}</span>
            ) : (
              <span />
            )}
            {filing.pages || filing.transactionId ? (
              <span className="text-content-muted">
                {filing.pages}
                {filing.transactionId ? (
                  <>
                    <br />
                    <span className="text-xs">Reference {filing.transactionId}</span>
                  </>
                ) : null}
              </span>
            ) : (
              <span />
            )}
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
      {fixture.summary ? <p className="text-sm text-content-muted">{fixture.summary}</p> : null}
      {charges.length ? (
        <div className="grid gap-4">
          {charges.map((charge) => (
            <ChargeCard key={`${charge.createdOn}-${charge.personsEntitled}`} charge={charge} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
      <LockedInterpretationPanel fixture={fixture} />
    </RecordCard>
  );
}

function ChargeCard({ charge }: { charge: ChargeRecord }) {
  const isOutstanding = charge.status.toLowerCase().includes("outstanding");
  return (
    <article
      className={cn(
        "overflow-hidden rounded-lg border bg-surface shadow-sm",
        isOutstanding ? "border-critical" : "border-line",
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3",
          isOutstanding
            ? "border-critical bg-critical-surface text-critical-content"
            : "border-line bg-surface-subtle text-content",
        )}
      >
        <h3 className="font-semibold">{charge.classification}</h3>
        {charge.chargeCode ? (
          <span className="font-mono text-xs text-content-muted">{charge.chargeCode}</span>
        ) : null}
      </div>
      <div className="grid gap-4 p-4">
        <FactGrid
          facts={[
            { label: "Charge holder", value: charge.personsEntitled },
            { label: "Status", value: sentenceCase(charge.status) },
            { label: "Created", value: formatDisplayDate(charge.createdOn) },
            { label: "Delivered to CH", value: formatDisplayDate(charge.deliveredOn) },
            { label: "Satisfied", value: formatDisplayDate(charge.satisfiedOn) },
            {
              label: "Particulars type",
              value: charge.particularsType
                ? displaySentenceCase(charge.particularsType)
                : companiesHouseUnavailable,
            },
          ]}
        />
        {charge.tags?.length ? (
          <div>
            <p className="mb-2 text-xs font-semibold text-content-muted uppercase">
              Charge description
            </p>
            <div className="flex flex-wrap gap-2">
              {charge.tags.map((tag) => (
                <Badge key={tag} variant="caution">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-content-muted">{charge.description}</p>
        )}
      </div>
    </article>
  );
}

function OfficersPanel({ fixture }: TabPanelProps) {
  const officers = fixture.officers ?? [];

  return (
    <RecordCard title={fixture.title} description={fixture.description} icon={Users}>
      {fixture.summary ? <p className="text-sm text-content-muted">{fixture.summary}</p> : null}
      {officers.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {officers.map((officer, idx) => (
            <OfficerCard key={`${officer.name}-${officer.appointedOn}-${idx}`} officer={officer} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
      <LockedInterpretationPanel fixture={fixture} />
    </RecordCard>
  );
}

function OfficerCard({ officer }: { officer: OfficerRecord }) {
  return (
    <article className="overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
      <div
        className={cn(
          "flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3",
          officer.resignedOn
            ? "border-line bg-surface-subtle"
            : "border-positive bg-positive-surface",
        )}
      >
        <div className="min-w-0">
          <h3 className="font-semibold wrap-break-word text-content">{officer.name}</h3>
        </div>
        <Badge variant={officer.resignedOn ? "outline" : "positive"}>
          {officer.resignedOn ? "Resigned" : "Active"}
        </Badge>
      </div>
      <div className="grid gap-4 p-4">
        <FactGrid
          facts={[
            ...(officer.role ? [{ label: "Role", value: officer.role }] : []),
            { label: "Appointed", value: formatDisplayDate(officer.appointedOn) },
            ...(officer.dateOfBirth
              ? [{ label: "Date of birth", value: officer.dateOfBirth }]
              : []),
            ...(officer.nationality ? [{ label: "Nationality", value: officer.nationality }] : []),
            ...(officer.residence
              ? [{ label: "Country of residence", value: officer.residence }]
              : []),
            { label: "Resigned", value: formatDisplayDate(officer.resignedOn) },
          ]}
        />
        {officer.identityVerificationDueOn ? (
          <Alert variant="caution">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>ID Verification due</AlertTitle>
            <AlertDescription>
              {formatDisplayDate(officer.identityVerificationDueOn)}
            </AlertDescription>
          </Alert>
        ) : null}
      </div>
    </article>
  );
}

function InsolvencyPanel({ fixture }: TabPanelProps) {
  const cases = fixture.insolvencyCases ?? [];

  return (
    <RecordCard title={fixture.title} description={fixture.description} icon={Scale}>
      {cases.length ? (
        <div className="grid gap-4">
          {cases.map((item) => (
            <InsolvencyCaseCard key={`${item.type}-${item.startedOn}`} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
      <LockedInterpretationPanel fixture={fixture} />
    </RecordCard>
  );
}

function InsolvencyCaseCard({ item }: { item: InsolvencyCaseRecord }) {
  return (
    <article className="overflow-hidden rounded-lg border border-critical bg-surface shadow-sm">
      <div className="border-b border-critical bg-critical-surface px-4 py-3 text-critical-content">
        <h3 className="font-semibold text-content">{item.type}</h3>
      </div>
      <div className="grid gap-4 p-4">
        <FactGrid
          facts={[
            { label: "Winding up commenced", value: formatDisplayDate(item.startedOn) },
            { label: "Process type", value: item.type },
            { label: "Status", value: sentenceCase(item.status) },
          ]}
        />
        <div>
          <p className="mb-2 text-xs font-semibold text-content-muted uppercase">
            Insolvency practitioners
          </p>
          {item.practitioners?.length ? (
            <div className="grid gap-2">
              {item.practitioners.map((practitioner) => (
                <div
                  key={`${practitioner.name}-${practitioner.appointedOn ?? ""}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-surface-subtle px-3 py-2"
                >
                  <span className="font-semibold text-content">{practitioner.name}</span>
                  <span className="text-sm text-content-muted">
                    {practitioner.appointedOn
                      ? `Appointed ${formatDisplayDate(practitioner.appointedOn)}`
                      : (practitioner.role ?? "Appointment date not listed")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-content-muted">{item.practitioner}</p>
          )}
        </div>
      </div>
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
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  );
}

function LockedInterpretationPanel({ fixture }: TabPanelProps) {
  const placeholder = fixture.lockedInterpretation;
  if (!placeholder) return null;

  return (
    <div className="rounded-lg border border-line bg-surface-subtle p-4">
      <div className="mb-3 flex items-center gap-2">
        <Badge variant="outline">AI</Badge>
        <p className="text-sm font-semibold text-content">{placeholder.title}</p>
      </div>
      <p className="mb-3 text-sm text-content-muted">{placeholder.body}</p>
      <div className="space-y-2 blur-sm select-none" aria-hidden="true">
        {placeholder.blurredLines.map((line) => (
          <p key={line} className="rounded-md border border-line bg-surface px-3 py-2 text-sm">
            {line}
          </p>
        ))}
      </div>
    </div>
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
  if (!value) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function sentenceCase(value: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
