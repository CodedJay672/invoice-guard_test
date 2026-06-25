import { Building2 } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function Topbar() {
  return (
    <header className="border-b border-line bg-surface sticky top-0 left-0 z-10">
      <div className="mx-auto max-w-7xl flex-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold text-brand-navy">
          <Building2 aria-hidden="true" className="size-5 text-brand-teal-hover" />
          <span>InvoiceGuard</span>
        </Link>

        <div className="hidden md:flex justify-center items-center gap-2 ml-auto">
          <Link href="#" className="text-right text-xs text-content-muted sm:text-sm hover:text-brand-teal transition-colors ease-in-out duration-300">
            How it works
          </Link>
          <Link href="/search" className="text-right text-xs text-content-muted sm:text-sm hover:text-brand-teal transition-colors ease-in-out duration-300">
            Company search
          </Link>
        </div>
        <div className='flex-center gap-2'>
          <div className="md:w-22.5 md:h-11.25 border border-border underline rounded-[8px] flex justify-center items-center">Sign in</div>
          <div className="md:w-36.5 md:h-11.25 bg-brand-navy underline rounded-[8px] text-content-inverse flex justify-center items-center">Start for free</div>
        </div>
      </div>
    </header>
  )
}

export default Topbar