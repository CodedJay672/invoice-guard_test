import {
  Building2,
  CheckIcon,
  Clipboard,
  ClipboardIcon,
  FileIcon,
  MedalIcon,
  ScaleIcon,
  UserCircleIcon,
  UserIcon,
} from "lucide-react";
import { RootSearchBar } from "@/components/root-searchbar";
import Image from "next/image";
import MarqueCard from "@/components/marque-card";
import Counter from "@/components/counter";
import FeatureCard from "@/components/feature-card";
import FeatureDetail from "@/components/feature-detail";
import PricingSection from "@/components/price-card";
import FAQ from "@/components/faq";
import CTASearch from "@/components/cta-search";

export interface CompanyData {
  name: string;
  status: string;
  list: string[];
}

interface FAQItem {
  question: string;
  answer: string;
}

const marqeeCompanies: CompanyData[] = [
  {
    name: "Harmon Tech Services Ltd",
    status: "Active",
    list: ["No charges", "1 CCJ", "No FPC"],
  },
  {
    name: "Nova Consulting Group Ltd",
    status: "Active",
    list: ["1 charge", "No CCJs", "Bronze FPC"],
  },
  {
    name: "Pinnacle Events Ltd",
    status: "Administration",
    list: ["3 charges", "5 CCJs", "No FPC"],
  },
  {
    name: "Titan Recruitment Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Gold FPC"],
  },
  {
    name: "BuildRight Contractors Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Gold FPC"],
  },
  {
    name: "Apex Print & Design Ltd",
    status: "Liquidation",
    list: ["1 charge", "CVL 2024", "3 CCJs"],
  },
  {
    name: "Swift Logistics Group Ltd",
    status: "Active",
    list: ["2 charges", "No CCJs", "Accounts overdue"],
  },
  {
    name: "Meridian Care Services Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Silver FPC"],
  },
  {
    name: "Redstone Supplies Ltd",
    status: "Dissolved",
    list: ["1 charge", "2 CCJs", "Struck off"],
  },
  {
    name: "Harmon Tech Services Ltd",
    status: "Active",
    list: ["No charges", "1 CCJ", "No FPC"],
  },
  {
    name: "Nova Consulting Group Ltd",
    status: "Active",
    list: ["1 charge", "No CCJs", "Bronze FPC"],
  },
  {
    name: "Pinnacle Events Ltd",
    status: "Administration",
    list: ["3 charges", "5 CCJs", "No FPC"],
  },
  {
    name: "Titan Recruitment Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Gold FPC"],
  },
  {
    name: "BuildRight Contractors Ltd",
    status: "Liquidation",
    list: ["1 charge", "CVL 2024", "Gold FPC"],
  },
  {
    name: "Apex print & Design Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "3 CCJs"],
  },
  {
    name: "Swift Logistics Group Ltd",
    status: "Active",
    list: ["2 charges", "No CCJs", "Account overdue"],
  },
  {
    name: "Meridian Care Services Ltd",
    status: "Active",
    list: ["2 charges", "No CCJs", "Silver FPC"],
  },
  {
    name: "Redstone Supplies Ltd",
    status: "Dissolved",
    list: ["1 charge", "2 CCJs", "Struck off"],
  },
];
const marqeeCompaniesRev: CompanyData[] = [
  {
    name: "Orion Digital Media Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Gold FPC"],
  },
  {
    name: "Castlewood Property Ltd",
    status: "Liquidation",
    list: ["2 charges", "4 CCJs", "No FPC"],
  },
  {
    name: "Clearview Analytics Ltd",
    status: "Active",
    list: ["No charges", "1 CCJ", "No FPC"],
  },
  {
    name: "Greenfield Ventures Ltd",
    status: "Dissolved",
    list: ["3 charges", "No CCJs", "Struck off"],
  },
  {
    name: "Amber Road Trading Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Bronze FPC"],
  },
  {
    name: "Northgate Solutions Ltd",
    status: "Active",
    list: ["1 charge", "2 CCJs", "No FPC"],
  },
  {
    name: "Stellar Brands Ltd",
    status: "Administration",
    list: ["2 charges", "3 CCJs", "No FPC"],
  },
  {
    name: "Vega Consulting Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Silver FPC"],
  },
  {
    name: "Orion Digital Media Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Gold FPC"],
  },
  {
    name: "Castlewood Property Ltd",
    status: "Liquidation",
    list: ["2 charges", "4 CCJs", "No FPC"],
  },
  {
    name: "Clearview Analytics Ltd",
    status: "Active",
    list: ["No charges", "1 CCJ", "No FPC"],
  },
  {
    name: "Greenfield Ventures Ltd",
    status: "Dissolved",
    list: ["3 charges", "No CCJs", "Struck off"],
  },
  {
    name: "Amber Road Trading Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Bronze FPC"],
  },
  {
    name: "Northgate Solutions Ltd",
    status: "Active",
    list: ["1 charge", "2 CCJs", "No FPC"],
  },
  {
    name: "Stellar Brands Ltd",
    status: "Administration",
    list: ["2 charges", "3 CCJs", "No FPC"],
  },
  {
    name: "Vega Consulting Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Silver FPC"],
  },
];
const howItWorks = [
  {
    number: "1",
    title: "Search the company",
    desc: "Type the company name or Companies House number. We search the live register instantly. No delays, no cached data, no account required.",
  },
  {
    number: "2",
    title: "Unlock the full report",
    desc: "The free search confirms the company profile. Unlock the full report from GBP 20 to get every data point, CCJ check, Fair Payment Code status, and our full written summary.",
  },
  {
    number: "3",
    title: "Make the decision",
    desc: "The report tells you what the data means in plain English. You decide whether to quote, sign, invoice, or walk away. Fully informed, in seconds.",
  },
];
const testimonials = [
  {
    name: "Sarah M.",
    role: "Freelance Brand Designer, Manchester",
    quote:
      "I was about to take on a £6,000 branding project. Ran the client through InvoiceGuard first. Two unsatisfied CCJs and accounts three years overdue. Walked away. Best £20 I have ever spent.",
  },
  {
    name: "James T.",
    role: "Director, Wholesale Supplies Ltd",
    quote:
      "We check every new wholesale customer before extending credit. The plain English summary is what sets it apart. My team can read it without knowing what a floating charge is.",
  },
  {
    name: "Marcus W.",
    role: "Freelance Web Developer, Bristol",
    quote:
      "Lost £4,200 to a client in liquidation last year. Found InvoiceGuard afterwards. Run every single new client through it now before I agree to anything. Should have existed years ago.",
  },
  {
    name: "Claire B.",
    role: "Credit Controller, London",
    quote:
      "I use InvoiceGuard for every new account we onboard. The charges and insolvency section alone has saved us from two very bad credit decisions in the first month. Indispensable for our team.",
  },
  {
    name: "David K.",
    role: "Accountant, Birmingham",
    quote:
      "I recommend this to every SME client I have. It is the only tool that explains what the Companies House data actually means rather than just showing it. That is the difference.",
  },
  {
    name: "Priya S.",
    role: "Recruitment Agency Owner, Leeds",
    quote:
      "We place contractors with businesses and always run a check before finalising terms. Found one client in administration before we placed three contractors with them. Saved us a serious headache.",
  },
];
const faqs: FAQItem[] = [
  {
    question: "What does the free search show me?",
    answer:
      "The free search shows the company's Companies House public profile: registered name, company number, status, incorporation date, company type, and registered area where available. It does not check CCJ data, Fair Payment Code status, AI interpretation, or paid-source detail. That is what the paid report unlocks.",
  },
  {
    question: "Do my report credits expire?",
    answer:
      "No. Credits never expire. Buy a pack when you need it and use your reports at your own pace, whether that is over a week or a year. There is no subscription to cancel.",
  },
  {
    question: "Where does the data come from?",
    answer:
      "Every report pulls from Companies House (company status, charges, insolvency, officers, filing history), Registry Trust (County Court Judgements), and the Small Business Commissioner (Fair Payment Code). All are official UK public registers. Our written summary is generated by InvoiceGuard using that data and never adds information that is not in the public record.",
  },
  {
    question: "Is your written summary legal or financial advice?",
    answer:
      "No. Our written summary translates public register data into plain English. It does not constitute legal, financial, or credit advice. InvoiceGuard is an intelligence tool that gives you the information to make your own informed decision. For specific legal or financial advice, always consult a qualified professional.",
  },
  {
    question: "How is InvoiceGuard different from checking Companies House directly?",
    answer:
      "Companies House gives you raw data across multiple pages. InvoiceGuard pulls it all into one report, adds CCJ data and Fair Payment Code status that Companies House does not cover, and gives you a plain English summary under every section so you understand what you are looking at even without a financial background.",
  },
  {
    question: "Can I search a sole trader or partnership?",
    answer:
      "InvoiceGuard searches the Companies House register, which covers registered limited companies and LLPs. Sole traders and general partnerships are not registered at Companies House and cannot be searched.",
  },
];

export default function LandingPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-225 py-10">
        <div className="w-full space-y-2">
          <h1 className="text-center text-4xl leading-9.5 font-extrabold tracking-[-2.5px] text-pretty md:text-6xl md:leading-[59.7px]">
            Search any UK company before you send that quote, sign that contract, raise that
            invoice, <span className="ml-1 inline-block text-positive">or start that job.</span>
          </h1>
          <p className="md:leading[31.5px] text-center text-base leading-[26.3px] text-content-subtle md:text-lg">
            Thousands of UK freelancers and small businesses write off unpaid invoices every year
            from clients who were already in trouble before they made contact. InvoiceGuard checks
            any UK company against live Companies House data, CCJ records, and the Fair Payment Code
            in 30 seconds, so you know exactly who you are dealing with before it costs you.
          </p>
        </div>

        <div className="mx-auto mt-6 max-w-2xl">
          <RootSearchBar />
        </div>

        <div className="mt-10 flex flex-row flex-wrap items-center gap-4 md:justify-center">
          <p className="flex gap-2 text-sm text-content-subtle">
            <CheckIcon className="size-3.75 text-positive" />
            No account needed
          </p>
          <p className="flex gap-2 text-sm text-content-subtle">
            <CheckIcon className="size-3.75 text-positive" />
            Instant result
          </p>
          <p className="flex gap-2 text-sm text-content-subtle">
            <CheckIcon className="size-3.75 text-positive" />
            Live Company House data
          </p>
        </div>

        <div className="relative mx-auto mt-10 aspect-2.5/1 w-full max-w-5xl overflow-hidden rounded-lg border border-line md:h-120">
          <Image
            src="/paid-search-result.png"
            alt="invoice-guard"
            sizes="(max-width: 360px, 100vw, 50vw"
            fill
            priority
          />
        </div>

        <div className="w-full border-b border-b-line px-12 py-5">
          <div className="mx-auto flex max-w-275 flex-wrap items-center justify-center gap-7">
            <span className="text-xs font-medium text-content-subtle">Trusted data sources</span>
            <div className="h-5 w-px bg-line" />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-content-subtle">
              <Building2 size={15} /> Companies House
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-content-subtle">
              <ScaleIcon size={15} /> Registry Trust (CCJs)
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-content-subtle">
              <MedalIcon size={15} /> Small Business Commissioner
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-content-subtle">
              <Clipboard size={15} /> Plain English summaries
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden border-b border-b-line py-7">
        <p className="mb-7 text-center text-xs leading-[0.1em] font-semibold text-content-subtle uppercase">
          Live intelligence across the UK register
        </p>
        <div className="relative before:absolute before:top-0 before:right-0 before:left-0 before:z-10 before:h-full before:bg-linear-to-r before:from-surface before:to-transparent before:to-30% before:content-[''] after:absolute after:top-0 after:right-0 after:left-0 after:h-full after:bg-linear-to-l after:from-surface after:to-transparent after:to-30% after:content-['']">
          <div className="mb-2.5 flex gap-2.5">
            <div className="marquee-inner">
              {marqeeCompanies.map((com, idx) => (
                <MarqueCard key={idx} name={com.name} status={com.status} list={com.list} />
              ))}
            </div>
          </div>
          <div className="mb-2.5 flex gap-2.5">
            <div className="marquee-inner rev">
              {marqeeCompaniesRev.map((com, idx) => (
                <MarqueCard key={idx} name={com.name} status={com.status} list={com.list} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="border-b border-b-line px-12 py-18 text-center">
        <p className="mb-4 text-xs text-content-muted">A growing intelligence database</p>
        <div className="mb-9">
          <p className="stat-big text-brand-navy">
            <Counter
              end={5.4}
              decimals={1}
              suffix="M+"
              className="mr-2 inline-block text-positive"
            />
            companies
          </p>
          <p className="stat-big text-line">searchable instantly</p>
        </div>
        <div className="reveal mx-auto grid max-w-200 grid-cols-4 gap-0 border-t border-t-line pt-12">
          <div className="sgsc">
            <Counter
              end={1}
              decimals={0}
              prefix="£"
              suffix="B+"
              className="sgsc-num mr-1 text-brand-navy"
            />
            <span className="sgsc-label">
              Written off annually
              <br />
              by UK SMEs in bad debt
            </span>
          </div>
          <div className="sgsc">
            <Counter end={30} decimals={0} suffix="sec" className="sgsc-num" />
            <span className="sgsc-label">
              Average time to generate
              <br />a full paid report
            </span>
          </div>
          <div className="sgsc">
            <Counter end={6} decimals={0} suffix="+" className="sgsc-num" />
            <span className="sgsc-label">
              Data sources checked
              <br />
              in every report
            </span>
          </div>
          <div className="sgsc">
            <Counter end={20} suffix="p" className="sgsc-num" />
            <span className="sgsc-label">
              Full report starts from
              <br />
              GBP 20 per search
            </span>
          </div>
        </div>
      </section>

      <section className="px-12 py-18" id="features">
        <div className="mx-auto w-full max-w-275">
          <div className="reveal mb-11">
            <p className="mb-3.5 text-xs font-bold tracking-tighter text-content-muted uppercase">
              What we check
            </p>
            <h2 className="max-w-150 text-5xl font-extrabold tracking-tighter text-content">
              Six data sources.
              <br />
              One plain English report.
            </h2>
            <p className="mt-3.5 max-w-130 text-base leading-6 text-content-muted">
              Every paid report pulls from six official UK sources and explains the findings so you
              understand what you are looking at, no financial background needed.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-0 overflow-hidden rounded-md border border-line">
            <FeatureCard
              icon={Building2}
              title="Company Overview"
              desc="Status, incorporation date, company type, SIC code, overdue accounts, and overdue confirmation statements. The first signal that something is wrong."
              source="companies house"
            />

            <FeatureCard
              icon={ClipboardIcon}
              title="Registered Charges"
              desc="Status, incorporation date, company type, SIC code, overdue accounts, and overdue confirmation statements. The first signal that something is wrong."
              source="companies house"
            />

            <FeatureCard
              icon={FileIcon}
              title="Insolvency Records"
              desc="Status, incorporation date, company type, SIC code, overdue accounts, and overdue confirmation statements. The first signal that something is wrong."
              source="companies house"
            />

            <FeatureCard
              icon={UserIcon}
              title="Officers & Directors"
              desc="Who is in control, how long they have been appointed, whether they have resigned recently, and whether identity verification is outstanding."
              source="Companies House"
            />

            <FeatureCard
              icon={ScaleIcon}
              title="County Court Judgements"
              desc="How many CCJs are registered, total
value, claimants, and whether they have been satisfied. A pattern of unsatisfied CCJs is one of the clearest warning signs."
              source="Companies House"
            />

            <FeatureCard
              icon={MedalIcon}
              title="Fair Payment Code"
              desc="Has this company publicly committed to paying suppliers on time? We check the Small Business Commissioner's register and show their tier."
              source="Small Business Commissioner"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-t-line px-12 py-18">
        <div className="mx-auto w-full max-w-275">
          <FeatureDetail
            intro="Plain English Summaries"
            title="Not a table of data. A report that talks to you"
            body="Every competitor gives you raw data in tables and leaves you to figure out what it means. InvoiceGuard gives you the same data plus our plain English summary underneath every section, written specifically for business owners, freelancers, sole traders, micro agencies, contractors, consultants, credit controllers, accountants, bookkeepers, recruitment agencies, and debt recovery firms who need clear answers, not financial jargon."
            bullets={[
              "Our summary at the top of every report, a clear plain English brief covering everything you need to know",
              "Plain English summary under every data section, no jargon, no guesswork",
              "Built for business owners, freelancers, sole traders, contractors, consultants, micro agencies, credit controllers, accountants, bookkeepers, recruitment agencies, and debt recovery firms",
            ]}
            imgUrl="/image1.png"
            btnLabel="Search a company free →"
            ctaLink="/search"
            primary
            ltr
          />

          <FeatureDetail
            intro="Charges & Insolvency"
            title="Know who has a claim on this company's assets."
            body="A company with an outstanding charge has pledged its assets to a lender. A company in liquidation cannot legally pay you. Both are in the public record. InvoiceGuard surfaces both, with a clear explanation of what it means for your invoice."
            bullets={[
              "Fixed and floating charges explained in plain English, not legal language",
              "Insolvency type, commencement date, and appointed practitioners surfaced clearly.",
              "Nagative pledge flags: when a company is legally barred from taking on more debt",
            ]}
            imgUrl="/image2.png"
            ctaLink="/pricing"
            btnLabel="See full report →"
            primary={false}
            ltr={false}
          />

          <FeatureDetail
            intro="CCJs & Fair Payment Code"
            title="Two data sources your competitors don't combine."
            body="Court County Judgements tell you whether a company has been ordered by a court to pay a debt and refused. The Fair Payment Code tells you whether they've made a public commitment to pay suppliers promptly. InvoiceGuard checks both."
            bullets={[
              "CCJ count, total value, claimants, and satisfaction status from the Registry Trust",
              "Fair Payment Code tier, Gold, Silver, Bronze, or none, from the Small Business Commissioner",
              "Both included in every paid report, no extra charge, no separate search",
            ]}
            imgUrl="/image3.png"
            ctaLink="/search"
            btnLabel="Search a company free →"
            primary
            ltr
          />

          <FeatureDetail
            intro="Filing History"
            title="The full story of a company in one timeline."
            body="A company's filing history is a chronological record of everything it has ever submitted to Companies House. InvoiceGuard reads that timeline, colour-codes the events that matter, and tells you what the pattern means."
            bullets={[
              "Red flags including missed accounts, winding-up resolutions, and charge registrations highlighted automatically",
              "Gaps in filing detected. A company that stopped filing before it went insolvent is a warning sign",
              "The full sequence explained so you understand what the pattern of events suggests",
            ]}
            imgUrl="/image4.png"
            ctaLink="/pricing"
            btnLabel="See full report →"
            primary={false}
            ltr={false}
          />
        </div>
      </section>

      <section className="border-t border-t-line px-12 py-24" id="how">
        <div className="mx-auto w-full max-w-275">
          <div className="reveal mb-11 text-center">
            <h2 className="w-full text-center text-4xl font-extrabold">
              Three steps. Thirty seconds.
            </h2>
            <p className="mx-auto my-3.5 max-w-md text-center">
              No account needed to search. No jargon in the report. No guesswork about what to do
              next.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-0 overflow-hidden rounded-xl border border-line">
            {howItWorks.map((i, idx) => (
              <FeatArticle key={idx} number={i.number} title={i.title} desc={i.desc} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-b border-t-line border-b-line bg-page px-12 py-18">
        <div className="mx-auto grid w-full max-w-275 grid-cols-2 items-center gap-20">
          <div className="reveal">
            <p className="mb-4 text-xs font-bold text-content-subtle">
              The real cost of not checking
            </p>
            <h2 className="text-5xl leading-10 font-extrabold text-content">
              They were already in trouble
              <br />
              <span className="text-critical">before they hired you.</span>
            </h2>
            <p className="mb-7 text-base text-content-subtle">
              The client looked legitimate. The website was professional. What you did not know,
              sitting in the public record the entire time, was that the company had an outstanding
              charge, accounts two years overdue, and a winding-up resolution filed three weeks
              before they contacted you.
            </p>
            <div className="mb-8 flex flex-col gap-3.5">
              <div className="pain-bullet">
                <span className="pb-num">01</span>
                <span>
                  A company in liquidation cannot pay your invoice. Your debt joins a queue and
                  unsecured creditors are last.
                </span>
              </div>
              <div className="pain-bullet">
                <span className="pb-num">02</span>
                <span>
                  Overdue accounts and missed confirmation statements are public warning signs,
                  visible for free, that most people never think to check.
                </span>
              </div>
              <div className="pain-bullet">
                <span className="pb-num">03</span>
                <span>
                  A company with three unsatisfied CCJs before they hire you is telling you exactly
                  what kind of client they will be.
                </span>
              </div>
            </div>
            <a href="/search" className="btn-primary">
              Search a company now, it is free →
            </a>
          </div>
          <div className="reveal relative inline-flex size-full overflow-hidden rounded-2xl">
            <Image
              src="/image5.png"
              alt="Reviewing unpaid invoices"
              sizes="(max-width: 760px) 100vw, 120px"
              fill
              className="block aspect-4/3 object-cover grayscale-25"
            />
            <div className="absolute right-5 bottom-5 left-5 rounded-lg bg-brand-navy px-4.5 py-4">
              <p className="mb-6 text-[9px] font-bold text-content-subtle uppercase">
                UK Late Payment Report 2024
              </p>
              <p className="mb-px text-lg font-extrabold text-content-inverse">
                1 in 3 UK freelancers
              </p>
              <p className="text-xs text-surface-subtle">
                have been left with an unpaid invoice they could not recover
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-12 py-18">
        <div className="mx-auto w-full max-w-275">
          <div className="reveal mb-12 text-center">
            <h2 className="text-4xl font-extrabold tracking-tighter text-brand-navy">
              What our users are saying.
            </h2>
          </div>
          <div className="gap--16 grid grid-cols-2 gap-y-0">
            {testimonials.map((t, idx) => (
              <TestimonialCard key={idx} name={t.name} role={t.role} quote={t.quote} />
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      <section className="border-t border-t-line px-12 py-18" id="faq">
        <div className="mx-auto w-full max-w-170">
          <div className="reveal mb-12 text-center">
            <h2 className="text-4xl font-extrabold text-content">Questions answered.</h2>
          </div>
          <div className="flex flex-col">
            {faqs.map((i, idx) => (
              <FAQ key={idx} {...i} />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-10 border-t border-t-line px-12 py-20 text-center" id="final-cta">
        <h2 className="mb-4 text-5xl font-extrabold text-content">
          Search before you start.
          <br />
          Not after you are owed.
        </h2>
        <p className="mx-auto max-w-110 text-lg text-content-muted">
          The information was always public. Now it is plain English, in one place, in thirty
          seconds.
        </p>
        <CTASearch />
        <p className="mt-3 text-xs text-content-subtle">
          No account needed · Instant results · Live Companies House data
        </p>
      </section>
    </>
  );
}

function FeatArticle({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="last:border-r-none border-r border-r-line px-8 py-9 transition hover:bg-surface-subtle">
      <p className="mb-5 text-xs font-bold text-content">STEP {number.padStart(2, "0")}</p>
      <h3 className="mb-2.5 text-base font-bold text-brand-navy">{title}</h3>
      <p className="text-sm text-content-muted">{desc}</p>
    </div>
  );
}

function TestimonialCard({ name, role, quote }: { name: string; role: string; quote: string }) {
  return (
    <div className="last:border-b-none nth-child-[2]:border-b-none reveal d1 border-b border-b-line p-7">
      <div className="mb-3 flex items-center gap-2.5">
        <UserCircleIcon size={36} />
        <div>
          <p className="text-base font-bold text-content">{name}</p>
          <p className="text-xs font-light text-content-subtle">{role}</p>
        </div>
      </div>
      <p className="text-sm text-content-muted">{quote}</p>
    </div>
  );
}
