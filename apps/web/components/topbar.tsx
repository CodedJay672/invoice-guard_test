import Link from "next/link";

import { AccountControl } from "@/components/auth/AccountControl";
import { authHref } from "@/components/auth/fixtures";
import { resolveAuthIdentity } from "@/lib/auth/identity";

export default async function Topbar() {
  const identity = await resolveAuthIdentity();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex min-h-17 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-h-11 shrink-0 items-center gap-2 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-brand-navy focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-brand-navy font-sans text-xs font-bold tracking-tight text-content-inverse">
            IG
          </span>
          <span>
            Invoice<span className="text-brand-teal">Guard</span>
          </span>
        </Link>
        <nav aria-label="Primary navigation" className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-content-muted transition-colors hover:bg-surface-subtle hover:text-brand-navy focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
          >
            Company search
          </Link>
          {identity.state === "signed-out" ? (
            <AccountControl state="signed-out" signInHref={authHref("/sign-in", "/search")} />
          ) : identity.state === "verified" ? (
            <AccountControl state="signed-in" email={identity.email} verified />
          ) : (
            <AccountControl state="signed-in" verified={false} />
          )}
        </nav>
      </div>
    </header>
  );
}
