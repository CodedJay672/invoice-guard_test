import { Building2, CheckCircle2, Database, FileSearch } from "lucide-react";

type PublicSearchShellProps = {
  children: React.ReactNode;
};

export function PublicSearchShell({ children }: PublicSearchShellProps) {
  return (
    <main className="min-h-svh bg-page text-content">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex shrink-0 items-center gap-2 font-semibold text-brand-navy">
            <Building2 aria-hidden="true" className="size-5 text-brand-teal-hover" />
            <span>InvoiceGuard</span>
          </div>
          <p className="text-right text-xs font-medium text-content-muted sm:text-sm">
            One-off reports from £7.99
          </p>
        </div>
      </header>

      <section className="bg-brand-navy text-content-inverse">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="text-xs font-semibold tracking-wider text-brand-teal uppercase">
            UK company intelligence
          </p>
          <h1 className="max-w-3xl text-3xl leading-tight font-semibold sm:text-4xl">
            Check the public record before you decide to work with a company.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-content-inverse/80 sm:text-base">
            Search Companies House, review the free-source position, and choose a factual report
            when you need court records and deeper checks.
          </p>
        </div>
      </section>

      <section aria-label="Sources and check scope" className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 text-sm text-content-muted sm:grid-cols-3 sm:px-6 lg:px-8">
          <SourceTrustItem icon={Database} text="Companies House identity" />
          <SourceTrustItem icon={FileSearch} text="London Gazette notices" />
          <SourceTrustItem icon={CheckCircle2} text="Free-source adverse checks" />
        </div>
      </section>

      {children}

      <footer className="mt-10 border-t border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-content-muted sm:px-6 lg:px-8">
          <p>InvoiceGuard presents factual records from checked sources.</p>
          <p>It does not provide credit, financial, or legal advice.</p>
        </div>
      </footer>
    </main>
  );
}

type SourceTrustItemProps = {
  icon: typeof Database;
  text: string;
};

function SourceTrustItem({ icon: Icon, text }: SourceTrustItemProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon aria-hidden="true" className="size-4 text-brand-teal-hover" />
      <span>{text}</span>
    </div>
  );
}
