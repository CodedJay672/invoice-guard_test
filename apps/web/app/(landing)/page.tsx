import Footer from '@/components/footer';
import RootSearchBar, { RootSearchBarSkeleton } from '@/components/root-searchbar'
import { cn } from '@workspace/ui/lib/utils';
import { Bell, CheckIcon, DollarSign, FileText, LucideIcon, Mail, Search, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import React, { Suspense } from 'react'

const processes = [
  {
    title: "Connect or upload",
    description: "Link Xero or QuickBooks in one click. InvoiceGuard automatically syncs outstanding balances and detects overdue invoices the moment they pass their due date."
  },
  {
    title: "See what you're owed",
    description: "Under the Late Payment of Commercial Debts Act 1998, you're entitled to 8% over Bank Rate plus a statutory compensation fee. We calculate it all, live, every day.."
  },
  {
    title: "Generate demand letters",
    description: "A three-stage series — First Notice, SBC Warning, and Final Demand — legally drafted and personalised to each debtor. Ready to send in under 60 seconds."
  },
  {
    title: "Track and escalate",
    description: "InvoiceGuard monitors responses, tracks deadlines, and alerts you exactly when to escalate. Know  the status of every debt at a glance."
  },
]

const services = [
  {
    icon: FileText,
    title: "Demand Letter Generator",
    description: "Three legally compliant letters — First Formal Notice, SBC Warning, and Final Demand — auto-filled with correct interest and compensation amounts."
  },
  {
    icon: DollarSign,
    title: "Statutory Interest Calculator",
    description: "Automatically calculates the 8% above Bank Rate interest and £40– £100 compensation fees you're entitled to claim under UK law, updated daily."
  },
  {
    icon: Search,
    title: "Company Risk Search",
    description: "Search any UK company and instantly see CCJs, late payment history, insolvency indicators, and director changes — before you issue the next invoice."
  },
  {
    icon: Bell,
    title: "Deadline Alerts",
    description: "Never miss a response window. InvoiceGuard tracks dispute deadlines, letter response periods, and escalation points — and tells you exactly what to do next."
  },
  {
    icon: Mail,
    title: "Xero & QuickBooks Sync",
    description: "Connect your accounting software in one click. Live invoice data, overdue detection, and recovery status all update automatically with no manual work."
  },
  {
    icon: ShieldCheck,
    title: "Watchlist Monitoring",
    description: "Add clients to your watchlist and get alerted when their risk profile changes — a new CCJ, a director resignation, or a filing pattern that signals trouble ahead."
  },
]

function LandingPage() {
  return (
    <section className="w-full bg-surface ">
      <section className="w-fit flex justify-center items-center gap-3 py-22 flex-col sm:flex-row mx-auto">
        <div className="mx-auto flex max-w-[541.02px] flex-col gap-4 px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-wider page-title-pill">
            <span className='inline-block p-1.5 rounded-full bg-brand-teal' />
            UK company intelligence
          </p>
          <h1 className="max-w-3xl text-[311px] font-black sm:text-4xl">
            Find company risk {" "}
            <span className='text-brand-teal'>
              before payment becomes a problem.
            </span>
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-content-muted sm:text-base">
            Search any UK company and quickly see signals that matter: late payments, court judgments, insolvency history, and filing activity from verified public sources.
          </p>
          <Suspense fallback={<RootSearchBarSkeleton />}>
            <RootSearchBar />
          </Suspense>

          <div className="flex items-center gap-4">
            <p className='text-[10px] sm:text-xs text-content-muted font-medium'>No account needed</p>
            <p className='text-[10px] sm:text-xs text-content-muted font-medium'>Results in seconds</p>
            <p className='text-[10px] sm:text-xs text-content-muted font-medium'>5+ data sources</p>
          </div>

          <div className="flex items-center gap-4">
            <p className='text-[10px] sm:text-xs bg-brand-teal/10 px-3 py-1 rounded-full border border-brand-teal text-brand-navy underline'>Brightfield LTD</p>
            <p className='text-[10px] sm:text-xs bg-brand-teal/10 px-3 py-1 rounded-full border border-brand-teal text-brand-navy underline'>ACME Solutions LTD</p>
            <p className='text-[10px] sm:text-xs bg-brand-teal/10 px-3 py-1 rounded-full border border-brand-teal text-brand-navy underline'>GreenSpark Agency</p>
          </div>
        </div>
        <div className='max-w-[324.81px] space-y-4'>
          <div className="w-full p-[20.8px] shadow-lg rounded-3xl space-y-4">
            <div className="w-full">

              <h4 className='text-xs sm:text-sm text-content-muted font-semibold tracking-wider'>LIVE COMPANY SNAPSHOT</h4>
              <h2 className='text-base sm:text-lg font-bold leading-12'>Orca Logistics UK LTD</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <SnapshotPill title="RISK SCORE" value='80/100' />
              <SnapshotPill title="OVERDUE INVOICES" value='4' />
              <SnapshotPill title="CCJs FOUND" value='10' />
              <SnapshotPill title="LAST FILINGS" value='12th July 2025' />
            </div>
          </div>
          <div className='w-full p-[20.8px] bg-brand-navy rounded-3xl space-y-4'>
            <h6 className='text-xs text-content-muted'>RECOMMENDED NEXT STEPS</h6>
            <p className='text-xs sm:text-sm text-muted'>Send a formal payment reminder and prepare a demand letter if the debt remains unpaid.</p>
          </div>
        </div>
      </section>

      <section className='w-full h-13 flex justify-center items-center gap-4 bg-brand-navy'>
        <p className='text-sm text-content-muted'>VERIFIED DATA FROM</p>
        <p className='text-xs sm:text-sm text-line font-semibold'>Company's House</p>
        <p className='text-xs sm:text-sm text-line font-semibold'>Registry Trust CCJs</p>
        <p className='text-xs sm:text-sm text-line font-semibold'>Insolvency Service</p>
        <p className='text-xs sm:text-sm text-line font-semibold'>London Gazette</p>
        <p className='text-xs sm:text-sm text-line font-semibold'>Fair Payment Code</p>
      </section>

      <section className="w-full px-[51.19x] py-22 space-y-10">
        <div className='space-y-4'>
          <p className='page-title-pill text-xs sm:text-sm mx-auto font-semibold'>Simple Four-step Process</p>
          <h1 className='w-fit text-2xl md:text-3xl font-extrabold mx-auto'>From overdue to recovered in days, not months</h1>
          <p className='text-xs sm:text-sm text-content-muted text-center'>InvoiceGuard handles the legal complexity so you can focus on your work.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-10">
          {processes.map((p, idx) => (
            <StepProcessCard key={idx} index={++idx} title={p.title} description={p.description} />
          ))}
        </div>

        <div></div>
      </section>

      <section className='w-full px-[51.19x] py-22 space-y-6 bg-brand-teal/5'>
        <div className='space-y-4'>
          <p className='page-title-pill text-xs sm:text-sm mx-auto font-semibold'>Everything you need</p>
          <h1 className='w-fit text-2xl md:text-3xl font-extrabold mx-auto'>A complete late payment toolkit</h1>
        </div>

        <div className='w-[921.63px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[19.2px] mx-auto'>
          {services.map((s, idx) => (
            <ServicesCard key={idx} icon={s.icon} title={s.title} description={s.description} />
          ))}
        </div>
      </section>

      <section className='w-full px-35 py-22 space-y-10'>
        <div className='space-y-4'>
          <p className='page-title-pill text-xs sm:text-sm mx-auto font-semibold'>Pricing</p>
          <h1 className='w-fit text-2xl md:text-3xl font-extrabold mx-auto'>Simple, transparent pricing</h1>
          <p className='text-xs sm:text-sm text-content-muted text-center'>All plans include a 14-day free trial. No credit card required to start.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 max-w-290 gap-3 mx-auto">
          <PricingCard
            tier="starter"
            isPopular={false}
            price={29}
            features={["Up to 10 tracked invoices.", "5 company searches/month", "Demand letter generator", "Statutory interest calculator", "Email notifications", "Xero & Quickbooks sync", "Watchlist monitoring"]}
            description='For freelancers and sole traders with occasional late payers.'
          />

          <PricingCard
            tier="pro"
            isPopular={true}
            price={79}
            features={["Unlimited tracked invoices", "50 company searches/month", "Full deman letter series", "Xero & Quickbooks sync", "Watchlist up to 10 companies", "Priority email support", "API access"]} description='For growing companies managing multiple clients and invoices.'
          />
          <PricingCard
            tier="business"
            isPopular={false}
            price={199}
            features={["Ulimited everything", "Unlimited company search", "Watchlist unlimited companies", "Up to 5 team members", "API access", "White-label demand letters", "Dedicated account manager"]}
            description='For agencies, law firms, and teams managing large portfolios.'
          />
        </div>

        <p className='text-xs text-content-muted text-center'>Need a one-off report? <span className='text-brand-teal font-semibold'>Search free</span> {" "} and unlock a single company report from £7.99 — no subscription needed.</p>
      </section>

      <section className='w-full px-35 py-22 space-y-10 bg-brand-teal/5'>
        <div className='space-y-4'>
          <p className='page-title-pill text-xs sm:text-sm mx-auto font-semibold'>Customer stories</p>
          <h1 className='w-fit text-2xl md:text-3xl font-extrabold mx-auto'>Used by UK businesses to recover what they're owed</h1>
        </div>

        <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 gap-x-4">
          <TestimonialCard
            content='We recovered £12,400 in overdue invoices within the first month. The demand letters alone paid for the  subscription ten times over.'
            name='Sarah Raymond'
            role='Founder, Redline Design Studio'
          />
          <TestimonialCard
            content='The interest calculator was eye-opening. We had no idea we were legally entitled to claim so much on top of the original invoice amount.'
            name='James M.'
            role='Sole trader, Web developer'
          />
          <TestimonialCard
            content='Before InvoiceGuard I spent hours chasing payments. Now it takes minutes. Three clients paid within a week of receiving the first letter.'
            name='Priya B.'
            role='Director, Meridian Consulting LTD'
          />
        </div>
      </section>

      <Footer />
    </section>
  )
}

export default LandingPage

function SnapshotPill({ title, value }: { title: string; value: string }) {
  return (
    <div className='p-[13.6px] rounded-md bg-brand-teal/5 border border-brand-teal/50'>
      <h3 className='text-xs sm:text-sm text-content-muted font-semibold'>{title}</h3>
      <p className='text-xs sm:text-sm font-semibold leading-10'>{value}</p>
    </div>
  )
}

function ServicesCard({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <article className='w-[294.41px] h-[259.53px] p-[24.8px] bg-surface rounded-3xl space-y-4'>
      <div className='size-10.5 bg-brand-teal/10 rounded-xl border border-line shadow-md flex justify-center items-center'>{<Icon size={22} className='text-brand-teal' />}</div>
      <h3 className='text-xs sm:text-sm text-content font-semibold'>{title}</h3>
      <p className='text-xs sm:text-sm text-content-muted leading-6'>{description}</p>
    </article>
  )
}

function StepProcessCard({ index, title, description }: { index: number; title: string; description: string }) {
  return (
    <article className='w-[240.41px] h-[247.5px] p-[24.8px] bg-surface rounded-3xl space-y-4'>
      <div className='text-3xl text-brand-teal/50 font-semibold'>{index.toString().padStart(2, "0")}</div>
      <h3 className='text-content font-semibold text-xs sm:text-sm'>{title}</h3>
      <p className='text-xs sm:text-sm text-content-muted'>{description}</p>
    </article>
  )
}

function PricingCard({ tier, price, features, isPopular, description }: { tier: "starter" | "pro" | "business"; price: number, features: string[]; isPopular: boolean; description: string }) {
  return (
    <article className={cn("w-[320.67px] h-[457.56px] bg-surface p-10 space-y-[13.48px] rounded-[22px] border border-line", isPopular ? 'border-brand-teal relative' : "hover:border-brand-teal transition-colors duration-300 ease-in-out cursor-pointer")}>
      {isPopular && (
        <p className='text-xs sm:textsm bg-brand-teal font-bold px-3.25 py1 rounded-full absolute -top-2 left-27'>Most popular</p>
      )}

      <h6 className='text-xs text-content-muted uppercase tracking-wider'>{tier}</h6>
      <p className='text-2xl md:text-3xl font-bold'>{price.toLocaleString("en-GB", {
        style: "currency",
        currency: "GBP",
        currencySign: "standard",
        maximumFractionDigits: 0,
      })}<span className='text-xs sm:text-sm text-content-muted tracking-wide'>/mon</span></p>

      <p className='text-xs sm:text-sm text-content-muted '>{description}</p>

      <ul className='text-sm md:text-base text-content-muted list-image-none space-y-2.5'>
        {features.map((f, idx) => (
          <li key={idx} className='flex items-center gap-2'>
            <CheckIcon className='text-brand-teal size-4' />
            <span className='text-xs sm:text-sm text-content-muted line-clamp-3 truncate'>{f}</span>
          </li>
        ))}
      </ul>

      <Link href="#" className={cn('text-sm md:text-base font-semibold hover:underline w-full  inline-block text-center py-2.5 px-4.5 rounded-[8px] border transition-colors ease-in-out duration-300', isPopular ? "bg-brand-teal text-content-inverse" : "bg-surface text-content border-line hover:border-brand-teal hover:bg-brand-teal hover:text-content-inverse")}>
        Start free trial
      </Link>
    </article>
  )
}

function TestimonialCard({ content, name, role }: { content: string; name: string; role: string }) {
  return (
    <article className='w-full max-w-[371.73px] h-[228.51px] p-[27.2px] rounded-[22px] space-y-4 bg-surface shadow-md border border-line'>
      <div aria-hidden className='w-full h-[37.76px]' />
      <p className='text-xs md:text-sm text-content italic text-pretty'>
        {content}
      </p>
      <div className='mt-4 flex gap-1'>
        <div className='size-8.5 rounded-full flex justify-center items-center text-brand-teal bg-brand-navy font-bold'>
          {name.split(" ").map((i, idx) => (
            <p key={idx} className='uppercase'>{i[0]}</p>
          ))}
        </div>
        <div className='flex-1'>
          <h3 className='text-xs md:text-sm text-content font-semibold'>{name}</h3>
          <p className='text-xs text-content-muted font-light'>{role}</p>
        </div>
      </div>
    </article>
  )
}