import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-brand-navy text-content-inverse">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
        <div className="flex max-w-xl flex-col gap-3">
          <p className="text-base font-semibold">InvoiceGuard</p>
          <p className="text-sm leading-6 text-content-inverse/70">
            Factual UK company records for businesses deciding who to work with.
          </p>
          <p className="text-xs text-content-inverse/60">
            InvoiceGuard does not provide credit scores, legal advice, or approval decisions.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-sm text-content-inverse/70 md:items-end">
          <Link
            href="/search"
            className="min-h-11 py-3 hover:text-content-inverse focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
          >
            Search Companies House
          </Link>
          <p>© {new Date().getFullYear()} InvoiceGuard</p>
        </div>
      </div>
    </footer>
  );
}
