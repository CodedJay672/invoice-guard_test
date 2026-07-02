import { CheckCircle2, Database, FileSearch } from "lucide-react";

type PublicSearchShellProps = {
  children: React.ReactNode;
};

export function PublicSearchShell({ children }: PublicSearchShellProps) {
  return (
    <div className="min-h-svh bg-page">
      <section className="relative overflow-hidden bg-brand-navy text-content-inverse">
        <div className="pointer-events-none absolute -top-40 right-0 size-96 rounded-full bg-brand-teal/15 blur-3xl" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-xs font-bold tracking-[0.18em] text-brand-teal uppercase">
            Company search
          </p>
          <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
            Check a UK company.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-content-inverse/70">
            Confirm the registered entity, review the free-source position, and choose a factual
            report when you need deeper records.
          </p>
        </div>
      </section>

      <section aria-label="Sources and check scope" className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 text-sm font-medium text-content-muted sm:grid-cols-3 sm:px-6 lg:px-8">
          <SourceTrustItem icon={Database} text="Companies House identity" />
          <SourceTrustItem icon={FileSearch} text="London Gazette notices" />
          <SourceTrustItem icon={CheckCircle2} text="Companies House free preview" />
        </div>
      </section>

      {children}

      <footer className="mt-12 border-t border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-content-muted sm:px-6 lg:px-8">
          <p>InvoiceGuard presents factual records from checked sources.</p>
          <p>It does not provide credit, financial, or legal advice.</p>
        </div>
      </footer>
    </div>
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
