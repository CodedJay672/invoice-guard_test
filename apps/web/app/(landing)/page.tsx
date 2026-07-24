import { Building2, CheckIcon, Clipboard, ClipboardIcon, FileIcon, MedalIcon, ScaleIcon, UserCircleIcon, UserIcon } from "lucide-react";
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
    list: ["No charges", "1 CCJ", "No FPC"]
  },
  {
    name: "Nova Consulting Group Ltd",
    status: "Active",
    list: ["1 charge", "No CCJs", "Bronze FPC"]
  },
  {
    name: "Pinnacle Events Ltd",
    status: "Administration",
    list: ["3 charges", "5 CCJs", "No FPC"]
  },
  {
    name: "Titan Recruitment Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Gold FPC"]
  },
  {
    name: "BuildRight Contractors Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Gold FPC"]
  },
  {
    name: "Apex Print & Design Ltd",
    status: "Liquidation",
    list: ["1 charge", "CVL 2024", "3 CCJs"]
  },
  {
    name: "Swift Logistics Group Ltd",
    status: "Active",
    list: ["2 charges", "No CCJs", "Accounts overdue"]
  },
  {
    name: "Meridian Care Services Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Silver FPC"]
  },
  {
    name: "Redstone Supplies Ltd",
    status: "Dissolved",
    list: ["1 charge", "2 CCJs", "Struck off"]
  },
  {
    name: "Harmon Tech Services Ltd",
    status: "Active",
    list: ["No charges", "1 CCJ", "No FPC"]
  },
  {
    name: "Nova Consulting Group Ltd",
    status: "Active",
    list: ["1 charge", "No CCJs", "Bronze FPC"]
  },
  {
    name: "Pinnacle Events Ltd",
    status: "Administration",
    list: ["3 charges", "5 CCJs", "No FPC"]
  },
  {
    name: "Titan Recruitment Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Gold FPC"]
  },
  {
    name: "BuildRight Contractors Ltd",
    status: "Liquidation",
    list: ["1 charge", "CVL 2024", "Gold FPC"]
  },
  {
    name: "Apex print & Design Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "3 CCJs"],
  },
  {
    name: "Swift Logistics Group Ltd",
    status: "Active",
    list: ["2 charges", "No CCJs", "Account overdue"]
  },
  {
    name: "Meridian Care Services Ltd",
    status: "Active",
    list: ["2 charges", "No CCJs", "Silver FPC"]
  },
  {
    name: "Redstone Supplies Ltd", status: "Dissolved", list: ["1 charge", "2 CCJs", "Struck off"]
  }
];
const marqeeCompaniesRev: CompanyData[] = [
  {
    name: "Orion Digital Media Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Gold FPC"]
  },
  {
    name: "Castlewood Property Ltd",
    status: "Liquidation",
    list: ["2 charges", "4 CCJs", "No FPC"]
  },
  {
    name: "Clearview Analytics Ltd",
    status: "Active",
    list: ["No charges", "1 CCJ", "No FPC"]
  },
  {
    name: "Greenfield Ventures Ltd",
    status: "Dissolved",
    list: ["3 charges", "No CCJs", "Struck off"]
  },
  {
    name: "Amber Road Trading Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Bronze FPC"]
  },
  {
    name: "Northgate Solutions Ltd",
    status: "Active",
    list: ["1 charge", "2 CCJs", "No FPC"]
  },
  {
    name: "Stellar Brands Ltd",
    status: "Administration",
    list: ["2 charges", "3 CCJs", "No FPC"]
  },
  {
    name: "Vega Consulting Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Silver FPC"]
  },
  {
    name: "Orion Digital Media Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Gold FPC"]
  },
  {
    name: "Castlewood Property Ltd",
    status: "Liquidation",
    list: ["2 charges", "4 CCJs", "No FPC"]
  },
  {
    name: "Clearview Analytics Ltd",
    status: "Active",
    list: ["No charges", "1 CCJ", "No FPC"]
  },
  {
    name: "Greenfield Ventures Ltd",
    status: "Dissolved",
    list: ["3 charges", "No CCJs", "Struck off"]
  },
  {
    name: "Amber Road Trading Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Bronze FPC"]
  },
  {
    name: "Northgate Solutions Ltd",
    status: "Active",
    list: ["1 charge", "2 CCJs", "No FPC"]
  },
  {
    name: "Stellar Brands Ltd",
    status: "Administration",
    list: ["2 charges", "3 CCJs", "No FPC"]
  },
  {
    name: "Vega Consulting Ltd",
    status: "Active",
    list: ["No charges", "No CCJs", "Silver FPC"]
  }
];
const howItWorks = [
  {
    number: "1",
    title: "Search the company",
    desc: "Type the company name or Companies House number. We search the live register instantly. No delays, no cached data, no account required."
  },
  {
    number: "2",
    title: "Unlock the full report",
    desc: "The free search confirms the company profile. Unlock the full report from GBP 20 to get every data point, CCJ check, Fair Payment Code status, and our full written summary."
  },
  {
    number: "3",
    title: "Make the decision",
    desc: "The report tells you what the data means in plain English. You decide whether to quote, sign, invoice, or walk away. Fully informed, in seconds."
  },
]
const testimonials = [
  {
    name: "Sarah M.",
    role: "Freelance Brand Designer, Manchester",
    quote: "I was about to take on a £6,000 branding project. Ran the client through InvoiceGuard first. Two unsatisfied CCJs and accounts three years overdue. Walked away. Best £20 I have ever spent."
  },
  {
    name: "James T.",
    role: "Director, Wholesale Supplies Ltd",
    quote: "We check every new wholesale customer before extending credit. The plain English summary is what sets it apart. My team can read it without knowing what a floating charge is."
  },
  {
    name: "Marcus W.",
    role: "Freelance Web Developer, Bristol",
    quote: "Lost £4,200 to a client in liquidation last year. Found InvoiceGuard afterwards. Run every single new client through it now before I agree to anything. Should have existed years ago."
  },
  {
    name: "Claire B.",
    role: "Credit Controller, London",
    quote: "I use InvoiceGuard for every new account we onboard. The charges and insolvency section alone has saved us from two very bad credit decisions in the first month. Indispensable for our team."
  },
  {
    name: "David K.",
    role: "Accountant, Birmingham",
    quote: "I recommend this to every SME client I have. It is the only tool that explains what the Companies House data actually means rather than just showing it. That is the difference."
  },
  {
    name: "Priya S.",
    role: "Recruitment Agency Owner, Leeds",
    quote: "We place contractors with businesses and always run a check before finalising terms. Found one client in administration before we placed three contractors with them. Saved us a serious headache."
  }
];
const faqs: FAQItem[] = [
  {
    question: "What does the free search show me?",
    answer: "The free search shows the company's Companies House public profile: registered name, company number, status, incorporation date, company type, and registered area where available. It does not check CCJ data, Fair Payment Code status, AI interpretation, or paid-source detail. That is what the paid report unlocks."
  },
  {
    question: "Do my report credits expire?",
    answer: "No. Credits never expire. Buy a pack when you need it and use your reports at your own pace, whether that is over a week or a year. There is no subscription to cancel."
  },
  {
    question: "Where does the data come from?",
    answer: "Every report pulls from Companies House (company status, charges, insolvency, officers, filing history), Registry Trust (County Court Judgements), and the Small Business Commissioner (Fair Payment Code). All are official UK public registers. Our written summary is generated by InvoiceGuard using that data and never adds information that is not in the public record."
  },
  {
    question: "Is your written summary legal or financial advice?",
    answer: "No. Our written summary translates public register data into plain English. It does not constitute legal, financial, or credit advice. InvoiceGuard is an intelligence tool that gives you the information to make your own informed decision. For specific legal or financial advice, always consult a qualified professional."
  },
  {
    question: "How is InvoiceGuard different from checking Companies House directly?",
    answer: "Companies House gives you raw data across multiple pages. InvoiceGuard pulls it all into one report, adds CCJ data and Fair Payment Code status that Companies House does not cover, and gives you a plain English summary under every section so you understand what you are looking at even without a financial background."
  },
  {
    question: "Can I search a sole trader or partnership?",
    answer: "InvoiceGuard searches the Companies House register, which covers registered limited companies and LLPs. Sole traders and general partnerships are not registered at Companies House and cannot be searched."
  }
];

export default function LandingPage() {
  return (
    <>
      <div className="w-full max-w-225 mx-auto py-10">
        <div className="w-full space-y-2">
          <h1 className=" text-4xl md:text-6xl text-center text-pretty font-extrabold leading-9.5 md:leading-[59.7px] tracking-[-2.5px]">
            Search any UK company before you send that quote, sign that contract, raise that invoice, <span className="text-positive inline-block ml-1">or start that job.</span>
          </h1>
          <p className="text-base md:text-lg leading-[26.3px] md:leading[31.5px] text-content-subtle text-center">
            Thousands of UK freelancers and small businesses write off unpaid invoices every year from clients who were already in trouble before they made contact. InvoiceGuard checks any UK company against live Companies House data, CCJ records, and the Fair Payment Code in 30 seconds, so you know exactly who you are dealing with before it costs you.
          </p>
        </div>

        <div className="mx-auto max-w-2xl mt-6">
          <RootSearchBar />
        </div>

        <div className="mt-10 flex flex-row flex-wrap items-center md:justify-center gap-4">
          <p className="text-sm text-content-subtle flex gap-2">
            <CheckIcon className="size-3.75 text-positive" />
            No account needed
          </p>
          <p className="text-sm text-content-subtle flex gap-2">
            <CheckIcon className="size-3.75 text-positive" />
            Instant result
          </p>
          <p className="text-sm text-content-subtle flex gap-2">
            <CheckIcon className="size-3.75 text-positive" />
            Live Company House data
          </p>
        </div>

        <div className="relative w-full max-w-5xl md:h-120 mx-auto overflow-hidden rounded-lg mt-10 aspect-2.5/1 border border-line">
          <Image src="/paid-search-result.png" alt="invoice-guard" sizes="(max-width: 360px, 100vw, 50vw" fill priority />
        </div>

        <div className="w-full px-12 py-5 border-b border-b-line ">
          <div className="max-w-275 flex items-center justify-center gap-7 flex-wrap mx-auto">
            <span className="text-xs font-medium text-content-subtle">Trusted data sources</span>
            <div className="w-px h-5 bg-line" />
            <div className="text-xs flex items-center gap-1.5 font-semibold text-content-subtle"><Building2 size={15} /> Companies House</div>
            <div className="text-xs flex items-center gap-1.5 font-semibold text-content-subtle"><ScaleIcon size={15} /> Registry Trust (CCJs)</div>
            <div className="text-xs flex items-center gap-1.5 font-semibold text-content-subtle"><MedalIcon size={15} /> Small Business Commissioner</div>
            <div className="text-xs flex items-center gap-1.5 font-semibold text-content-subtle"><Clipboard size={15} /> Plain English summaries</div>
          </div>
        </div>
      </div>

      <div className="py-7 overflow-hidden border-b border-b-line">
        <p className="text-center text-xs font-semibold text-content-subtle leading-[0.1em] uppercase mb-7">Live intelligence across the UK register</p>
        <div className="relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-full before:bg-linear-to-r before:from-surface before:z-10 before:to-transparent before:to-30% after:content-[''] after:absolute after:top-0 after:right-0 after:left-0 after:h-full after:bg-linear-to-l after:from-surface after:to-transparent  after:to-30%">
          <div className="flex mb-2.5 gap-2.5">
            <div className="marquee-inner">
              {marqeeCompanies.map((com, idx) => (
                <MarqueCard key={idx} name={com.name} status={com.status} list={com.list} />
              ))}
            </div>
          </div>
          <div className="flex gap-2.5 mb-2.5">
            <div className="marquee-inner rev">
              {marqeeCompaniesRev.map((com, idx) => (
                <MarqueCard key={idx} name={com.name} status={com.status} list={com.list} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="py-18 px-12 text-center border-b border-b-line">
        <p className="text-xs text-content-muted mb-4">A growing intelligence database</p>
        <div className="mb-9">
          <p className="stat-big text-brand-navy">
            <Counter end={5.4} decimals={1} suffix="M+" className="text-positive inline-block mr-2" />
            companies</p>
          <p className="stat-big text-line">searchable instantly</p>
        </div>
        <div className="grid grid-cols-4 max-w-200 mx-auto border-t border-t-line pt-12 gap-0 reveal">
          <div className="sgsc">
            <Counter end={1} decimals={0} prefix="£" suffix="B+" className="sgsc-num text-brand-navy mr-1" />
            <span className="sgsc-label">Written off annually<br />by UK SMEs in bad debt</span>
          </div>
          <div className="sgsc">
            <Counter end={30} decimals={0} suffix="sec" className="sgsc-num" />
            <span className="sgsc-label">Average time to generate<br />a full paid report</span>
          </div>
          <div className="sgsc">
            <Counter end={6} decimals={0} suffix="+" className="sgsc-num" />
            <span className="sgsc-label">Data sources checked<br />in every report</span>
          </div>
          <div className="sgsc">
            <Counter end={20} suffix="p" className="sgsc-num" />
            <span className="sgsc-label">Full report starts from<br />GBP 20 per search</span>
          </div>
        </div>
      </section>

      <section className="py-18 px-12" id="features">
        <div className="w-full max-w-275 mx-auto">
          <div className="mb-11 reveal">
            <p className="text-xs font-bold text-content-muted uppercase tracking-tighter mb-3.5">What we check</p>
            <h2 className="text-5xl font-extrabold tracking-tighter text-content max-w-150">Six data sources.<br />One plain English report.</h2>
            <p className="text-base text-content-muted leading-6 max-w-130 mt-3.5">Every paid report pulls from six official UK sources and explains the findings so you understand what you are looking at, no financial background needed.</p>
          </div>

          <div className="grid grid-cols-3 gap-0 border border-line rounded-md overflow-hidden">
            <FeatureCard icon={Building2} title="Company Overview" desc="Status, incorporation date, company type, SIC code, overdue accounts, and overdue confirmation statements. The first signal that something is wrong." source="companies house" />

            <FeatureCard icon={ClipboardIcon} title="Registered Charges" desc="Status, incorporation date, company type, SIC code, overdue accounts, and overdue confirmation statements. The first signal that something is wrong." source="companies house" />

            <FeatureCard icon={FileIcon} title="Insolvency Records" desc="Status, incorporation date, company type, SIC code, overdue accounts, and overdue confirmation statements. The first signal that something is wrong." source="companies house" />

            <FeatureCard icon={UserIcon} title="Officers & Directors" desc="Who is in control, how long they have been appointed, whether they have resigned recently, and whether identity verification is outstanding." source="Companies House" />

            <FeatureCard icon={ScaleIcon} title="County Court Judgements" desc="How many CCJs are registered, total
value, claimants, and whether they have been satisfied. A pattern of unsatisfied CCJs is one of the clearest warning signs." source="Companies House" />

            <FeatureCard icon={MedalIcon} title="Fair Payment Code" desc="Has this company publicly committed to paying suppliers on time? We check the Small Business Commissioner's register and show their tier." source="Small Business Commissioner" />
          </div>
        </div>
      </section>

      <section className="py-18 px-12 border-t border-t-line">
        <div className="w-full max-w-275 mx-auto">
          <FeatureDetail
            intro="Plain English Summaries"
            title="Not a table of data. A report that talks to you" body="Every competitor gives you raw data in tables and leaves you to figure out what it means. InvoiceGuard gives you the same data plus our plain English summary underneath every section, written specifically for business owners, freelancers, sole traders, micro agencies, contractors, consultants, credit controllers, accountants, bookkeepers, recruitment agencies, and debt recovery firms who need clear answers, not financial jargon."
            bullets={["Our summary at the top of every report, a clear plain English brief covering everything you need to know", "Plain English summary under every data section, no jargon, no guesswork", "Built for business owners, freelancers, sole traders, contractors, consultants, micro agencies, credit controllers, accountants, bookkeepers, recruitment agencies, and debt recovery firms"]}
            imgUrl="/image1.png"
            btnLabel="Search a company free →"
            ctaLink="/search"
            primary
            ltr
          />

          <FeatureDetail
            intro="Charges & Insolvency"
            title="Know who has a claim on this company's assets." body="A company with an outstanding charge has pledged its assets to a lender. A company in liquidation cannot legally pay you. Both are in the public record. InvoiceGuard surfaces both, with a clear explanation of what it means for your invoice."
            bullets={["Fixed and floating charges explained in plain English, not legal language", "Insolvency type, commencement date, and appointed practitioners surfaced clearly.", "Nagative pledge flags: when a company is legally barred from taking on more debt"]}
            imgUrl="/image2.png"
            ctaLink="/pricing"
            btnLabel="See full report →"
            primary={false}
            ltr={false}
          />

          <FeatureDetail
            intro="CCJs & Fair Payment Code"
            title="Two data sources your competitors don't combine." body="Court County Judgements tell you whether a company has been ordered by a court to pay a debt and refused. The Fair Payment Code tells you whether they've made a public commitment to pay suppliers promptly. InvoiceGuard checks both."
            bullets={["CCJ count, total value, claimants, and satisfaction status from the Registry Trust", "Fair Payment Code tier, Gold, Silver, Bronze, or none, from the Small Business Commissioner", "Both included in every paid report, no extra charge, no separate search"]}
            imgUrl="/image3.png"
            ctaLink="/search"
            btnLabel="Search a company free →"
            primary
            ltr
          />

          <FeatureDetail
            intro="Filing History"
            title="The full story of a company in one timeline." body="A company's filing history is a chronological record of everything it has ever submitted to Companies House. InvoiceGuard reads that timeline, colour-codes the events that matter, and tells you what the pattern means."
            bullets={["Red flags including missed accounts, winding-up resolutions, and charge registrations highlighted automatically", "Gaps in filing detected. A company that stopped filing before it went insolvent is a warning sign", "The full sequence explained so you understand what the pattern of events suggests"]}
            imgUrl="/image4.png"
            ctaLink="/pricing"
            btnLabel="See full report →"
            primary={false}
            ltr={false}
          />
        </div>
      </section>


      <section className="py-24 px-12 border-t border-t-line" id="how">
        <div className="w-full max-w-275 mx-auto">
          <div className="text-center mb-11 reveal">
            <h2 className="text-center text-4xl font-extrabold w-full">Three steps. Thirty seconds.</h2>
            <p className="max-w-md my-3.5 mx-auto text-center">No account needed to search. No jargon in the report. No guesswork about what to do next.</p>
          </div>
          <div className="grid grid-cols-3 gap-0 border border-line rounded-xl overflow-hidden">
            {howItWorks.map((i, idx) => (
              <FeatArticle key={idx} number={i.number} title={i.title} desc={i.desc} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-18 px-12 border-t border-t-line border-b border-b-line bg-page">
        <div className="w-full max-w-275 mx-auto grid grid-cols-2 gap-20 items-center">
          <div className="reveal">
            <p className="text-xs font-bold text-content-subtle mb-4">The real cost of not checking</p>
            <h2 className="text-5xl font-extrabold text-content leading-10">They were already in trouble<br /><span className="text-critical">before they hired you.</span></h2>
            <p className="text-base text-content-subtle mb-7">The client looked legitimate. The website was professional. What you did not know, sitting in the public record the entire time, was that the company had an outstanding charge, accounts two years overdue, and a winding-up resolution filed three weeks before they contacted you.</p>
            <div className="flex flex-col gap-3.5 mb-8">
              <div className="pain-bullet"><span className="pb-num">01</span><span>A company in liquidation cannot pay your invoice. Your debt joins a queue and unsecured creditors are last.</span></div>
              <div className="pain-bullet"><span className="pb-num">02</span><span>Overdue accounts and missed confirmation statements are public warning signs, visible for free, that most people never think to check.</span></div>
              <div className="pain-bullet"><span className="pb-num">03</span><span>A company with three unsatisfied CCJs before they hire you is telling you exactly what kind of client they will be.</span></div>
            </div>
            <a href="/search" className="btn-primary">Search a company now, it is free →</a>
          </div>
          <div className="inline-flex size-full rounded-2xl overflow-hidden relative reveal">
            <Image src="/image5.png" alt="Reviewing unpaid invoices" sizes="(max-width: 760px) 100vw, 120px" fill className="grayscale-25 block aspect-4/3 object-cover " />
            <div className="absolute bottom-5 left-5 right-5 bg-brand-navy rounded-lg py-4 px-4.5">
              <p className="text-[9px] font-bold text-content-subtle uppercase mb-6">UK Late Payment Report 2024</p>
              <p className="text-lg font-extrabold text-content-inverse mb-px">1 in 3 UK freelancers</p>
              <p className="text-xs text-surface-subtle">have been left with an unpaid invoice they could not recover</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-18 px-12">
        <div className="w-full max-w-275 mx-auto">
          <div className="text-center mb-12 reveal">
            <h2 className="text-4xl font-extrabold text-brand-navy tracking-tighter">What our users are saying.</h2>
          </div>
          <div className="grid grid-cols-2 gap-y-0 gap--16">
            {testimonials.map((t, idx) => (
              <TestimonialCard key={idx} name={t.name} role={t.role} quote={t.quote} />
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      <section className="py-18 px-12 border-t border-t-line" id="faq">
        <div className="w-full max-w-170 mx-auto">
          <div className="text-center mb-12 reveal">
            <h2 className="text-4xl font-extrabold text-content">Questions answered.</h2>
          </div>
          <div className="flex flex-col">
            {faqs.map((i, idx) => (
              <FAQ key={idx} {...i} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-12 text-center border-t border-t-line space-y-10" id="final-cta">
        <h2 className="text-5xl font-extrabold text-content mb-4 ">Search before you start.<br />Not after you are owed.</h2>
        <p className="text-lg text-content-muted max-w-110 mx-auto ">The information was always public. Now it is plain English, in one place, in thirty seconds.</p>
        <CTASearch />
        <p className="text-xs text-content-subtle mt-3">No account needed · Instant results · Live Companies House data</p>
      </section>
    </>
  );
}


function FeatArticle({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="py-9 px-8 border-r border-r-line transition hover:bg-surface-subtle last:border-r-none">
      <p className="text-xs font-bold text-content mb-5">STEP {number.padStart(2, "0")}</p>
      <h3 className="text-base font-bold text-brand-navy mb-2.5">{title}</h3>
      <p className="text-sm text-content-muted">{desc}</p>
    </div>
  )
}

function TestimonialCard({ name, role, quote }: { name: string; role: string; quote: string }) {
  return (
    <div className="p-7 border-b border-b-line last:border-b-none nth-child-[2]:border-b-none reveal d1">
      <div className="flex items-center gap-2.5 mb-3">
        <UserCircleIcon size={36} />
        <div><p className="text-base font-bold text-content">{name}</p><p className="text-xs font-light text-content-subtle">{role}</p></div>
      </div>
      <p className="text-sm text-content-muted">{quote}</p>
    </div>
  )
}
