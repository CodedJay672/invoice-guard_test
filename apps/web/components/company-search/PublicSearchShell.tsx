type PublicSearchShellProps = {
  children: React.ReactNode;
};

export function PublicSearchShell({ children }: PublicSearchShellProps) {

  return (
    <div className="min-h-svh bg-page">
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
