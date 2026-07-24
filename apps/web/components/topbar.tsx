import Link from "next/link";

import { AccountControl } from "@/components/auth/AccountControl";
import { authHref } from "@/components/auth/fixtures";
import { resolveAuthIdentity } from "@/lib/auth/identity";
import Image from "next/image";
import { SearchIcon } from "lucide-react";

export default async function Topbar() {
  const identity = await resolveAuthIdentity();

  return (
    <header className="w-full h-17 sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <div className="size-full mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex max-sm:w-54 h-11 shrink-0 items-center gap-2 text-lg font-bold text-brand-navy focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none overflow-hidden"
        >
          <Image src="/dark-logo.png" alt="invoice-guard" width={140} height={30} className="content-center" />
        </Link>

        <nav className="hidden md:flex items-center justify-center gap-16 text-sm font-medium">
          <Link href="#what-we-check" className="text-sm font-medium leading-[22.4px] text-muted-foreground hover:text-foreground transition-colors ease-in-out">What we check</Link>
          <Link href="#how-it-works" className="text-sm font-medium leading-[22.4px] text-muted-foreground hover:text-foreground transition-colors ease-in-out">How it works</Link>
          <Link href="#pricing" className="text-sm font-medium leading-[22.4px] text-muted-foreground hover:text-foreground transition-colors ease-in-out">Pricing</Link>
          <Link href="#faq" className="text-sm font-medium leading-[22.4px] text-muted-foreground hover:text-foreground transition-colors ease-in-out">FAQ</Link>
        </nav>

        <div aria-label="Primary navigation" className="flex items-center gap-2">
          {identity.state === "signed-out" ? (
            <AccountControl state="signed-out" signInHref={authHref("/sign-in", "/search")} />
          ) : identity.state === "verified" ? (
            <AccountControl state="signed-in" email={identity.email} verified />
          ) : (
            <AccountControl state="signed-in" verified={false} />
          )}
          <Link
            href="/search"
            className="flex items-center px-4.5 py-2.25 text-sm font-medium bg-brand-navy hover:bg-brand-navy-hover text-content-inverse rounded-full focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
          >
            <SearchIcon className="sm:hidden" />
            Search company
          </Link>
        </div>
      </div>
    </header>
  );
}
