import { Building2 } from "lucide-react";
import Link from "next/link";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-h-11 shrink-0 items-center gap-2 font-semibold text-brand-navy focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
        >
          <Building2 aria-hidden="true" className="size-5 text-brand-teal" />
          <span>InvoiceGuard</span>
        </Link>
        <nav aria-label="Primary navigation" className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-content-muted transition-colors hover:text-brand-navy focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
          >
            Company search
          </Link>
        </nav>
      </div>
    </header>
  );
}
