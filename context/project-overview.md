# Project Overview

## About the Project

InvoiceGuard is a UK company-intelligence platform for SMEs, freelancers, agencies, and contractors who need to check a company before deciding whether to work with it.

The active commercial build is Phase A: search for a UK company, review a free Companies House company workspace, register or sign in, purchase one of four credit-pack products, and receive paid-only CCJ, Fair Payment Code, and AI interpretation access where entitled. Companies House is a free source for company overview, filing history, charges, officers, and insolvency tabs. Every paid report includes AI interpretation generated with `claude-haiku-4-5-20251001` and `max_tokens: 1500`. Guest purchases are not supported.

Invoice chasing and late-payment recovery belong to a future phase.

---

## The Problem It Solves

Small businesses currently piece together company identity, filing history, insolvency notices, director history, registered charges, and County Court Judgements from multiple sources. InvoiceGuard presents the relevant checks as one factual record.

InvoiceGuard does not issue credit scores, approve or reject companies, or provide financial or legal advice. It reports what was found, what was not found in checked sources, and what could not be retrieved.

---

## Active Routes

```text
/                                      -> Phase A landing page with direct company search form
/search?q=                             -> Company search results from Companies House public register
/company/[houseNumber]/overview        -> Companies House factual overview
/company/[houseNumber]/{filing-history,charges,officers,insolvency}
                                       -> Free Companies House tab data
/company/[houseNumber]/{ccj,fpc}       -> Paid locked/not-yet-checked source states
/company/[houseNumber]/ai-summary      -> Paid AI overview summary; blurred placeholder for free users
/api/companies/search                  -> Next.js proxy to Express
/api/companies/[companyNumber]/free-preview
                                       -> Next.js proxy to Express
/reports/[reportReference]             -> Owner-authorized paid report delivery
/admin                                 -> Operations dashboard (planned)
```

Current Express routes:

```text
GET /health
GET /companies/search?q=
GET /companies/:companyNumber
GET /companies/:companyNumber/free-preview
```

---

## Complete-System Figma Reference

`https://www.figma.com/design/KgnaNquB0qRPbTrJLD2BDQ/Untitled?node-id=58-176`

The Figma file represents the whole future InvoiceGuard system. Phase A may reuse its brand, navigation, company-search hero, verified-source presentation, company snapshot hierarchy, one-off report pricing, CTA, report, and footer patterns.

Invoice upload, Xero/QuickBooks, statutory interest, demand letters, subscriptions, recovery dashboards, and risk scores are future reference only. Phase gates override what appears in the design.

---

## Core User Flow

### Search and Free Preview

1. Visitor searches by registered name or Companies House number from the landing page or search page.
2. The landing page submits a plain query to `/search?q=...`; no autocomplete or browser-side provider call is used there.
3. Anonymous visitors are limited to five searches per hashed IP per 24 hours.
4. Free-tier company routes call Companies House only, including overview, filing history, charges, officers, and Companies House insolvency endpoints. Registry Trust/CCJs, Fair Payment Code, non-Companies-House paid sources, and AI are never called for free-tier requests.
5. The UI presents Companies House facts in their relevant tabs, clearly labels CCJs and Fair Payment Code as paid/not yet checked, and shows the four credit-pack products.

### Purchase and Generation

1. Visitor selects Single Report, Starter Pack, Business Pack, or Agency Pack.
2. A signed-out visitor must register or sign in and return to the selected company/product before checkout.
3. The server requires an authenticated Clerk user with a verified primary email, then creates a one-off Stripe Checkout Session.
4. Stripe webhook signature and event idempotency are verified.
5. The webhook—not the redirect—creates one pending report owned by that Clerk user and enqueues generation.
6. The worker fetches fresh entitled paid data, stores snapshots and statuses, generates bounded AI interpretations from the factual report data, and assembles frozen report data.
7. Companies House failure enters the automatic refund path; other failures produce a visible partial report.

### Delivery

- Every report shows reference, timestamp, company identity, product label, source statuses, disclaimer, and issue link.
- Reports are accessible only to their authenticated owner (or an authorized admin).
- Postmark may send report-ready notifications, but email links must resolve through authenticated owner access.
- PDF access is artifact-driven and owner-authorized; no current credit-pack product exposes a public PDF entitlement flag.

---

## Primary Actors

### Public Visitor

- Searches without an account within anonymous limits.
- Selects the correct Companies House entity before purchase.
- Sees Companies House overview, filing history, charges, officers, and insolvency data before payment.
- Must register or sign in before checkout and cannot purchase as a guest.

### Authenticated Business User

- Uses Clerk identity for owned reports.
- Account history, saved companies, and notes remain Phase B features.

### Admin

- Lucky is the only Phase A admin.
- Reviews report/payment/provider state, transaction counts, and conversion.
- Can issue full or partial refunds with a required reason.
- Every sensitive action is server-authorized and audited.

### External Providers

- Companies House supplies canonical identity, filing history, registered charges, officers, and company insolvency records as free source data.
- Registry Trust supplies paid CCJ data only after payment.
- Fair Payment Code is a paid-report source when implemented and is never called for free-tier requests.
- AI summaries are paid-only interpretation features. The AI Summary tab summarizes the Companies House overview data; other paid AI interpretation surfaces may interpret the factual data fetched for their relevant tabs.

---

## Report Products

| Product | Price | Scope |
| --- | ---: | --- |
| Free Preview | GBP 0 | Companies House overview, filing history, registered charges, officers, and Companies House insolvency data. No CCJ, Fair Payment Code, or AI call. |
| Single Report | GBP 20.00 | One full report credit. |
| Starter Pack | GBP 54.00 | Three full report credits. |
| Business Pack | GBP 80.00 | Five full report credits. |
| Agency Pack | GBP 140.00 | Ten full report credits. |

The public pricing section is the authoritative product display for these four credit packs. The database and API store the matching product codes `single_report`, `starter_pack`, `business_pack`, and `agency_pack` with integer pence prices 2000, 5400, 8000, and 14000. All four products currently grant the same full-report source entitlements; pack size changes credit quantity and price, not report depth.

The AI interpretation is mandatory Phase A scope for paid reports. It uses `claude-haiku-4-5-20251001` with `max_tokens: 1500`, interprets only frozen factual report data, and must remain clearly labelled as an interpretation rather than legal, credit, or financial advice. The `/ai-summary` company tab is a paid overview summary: it summarizes the Companies House overview data only. Paid report AI interpretation may also summarize or interpret the factual data fetched for filing history, charges, officers, insolvency, CCJs, and Fair Payment Code where those sections are available. `ENABLE_FLAG_SUMMARY` continues to govern the separate legacy approved-template flag summary and defaults to `false`.

### Free Preview Presentation

Always show registered name, company number, status, incorporation date and age, registered town/county, active-director count, Companies House filing history, registered charges, officers, insolvency tab access, Court Records prompt, AI Summary paid placeholder, and paid product options.

The free preview makes no adverse or clean conclusion from court records, Fair Payment Code, AI, or other paid sources because they are not queried. CCJs and Fair Payment Code are shown as not yet checked/paid. The AI Summary tab shows a blurred paid-feature placeholder for free users rather than generated text. Companies House failure must not be represented as a clean check.

### Paid Data Freshness and Failure

- Every paid report attempts a fresh fetch for every entitled source.
- Cached provider data older than 24 hours is not acceptable for generation.
- Provider snapshots retain checked time, source context, tier, status, and normalized payload/failure.
- Companies House failure prevents delivery and triggers automatic refund handling.
- Non-critical failure produces a partial report with explicit source status.
- Registry Trust failure offers the same free recheck path across credit-pack products when the service recovers.

---

## Phase A Scope

In scope:

- Company search, free preview, and anonymous rate limiting.
- One-off credit-pack products and Stripe payment.
- Free Companies House tab data for overview, filing history, charges, officers, and insolvency.
- Paid-only Registry Trust/CCJ boundary.
- BullMQ report generation, provider snapshots, and partial reports.
- Authenticated owner-only delivery, Postmark notifications, and artifact-driven PDF access.
- Paid-only AI interpretation using the fixed Claude model and output limit, including a paid overview summary tab.
- Mandatory disclaimer, issue reporting, approved copy templates, and Fair Payment Code refresh.
- Clerk-protected admin operations, refunds, conversion analytics, and maintenance jobs.

Out of scope:

- User dashboard, saved companies, notes, watchlists, and subscriptions.
- Payment-signal collection.
- Invoice upload, OCR, chasing, accounting integrations, interest calculators, demand letters, response portals, or SMS.
- AI-generated legal or credit advice, risk scores, colour-band risk ratings, or conclusions beyond the bounded paid-report interpretation.

---

## Future Phases and Gates

| Phase | Direction | Gate |
| --- | --- | --- |
| B | Accounts, report history, saved companies, notes | At least 30 real, delivered, non-refunded Phase A purchases and acceptable conversion. |
| C | Starter watchlists and non-CCJ alerts | After Phase B. |
| D | Higher-tier monitoring and enterprise admin | After Phase C. |
| E | Structured payment-experience signals | After sufficient eligible paid-report usage. |
| F | Invoice recovery and chasing | Separate future scope. |

If Phase A conversion is poor, improve Phase A rather than opening a later phase.

### Complete Future-System Reference

The Figma design preserves future product direction: dashboard, invoice ingestion, accounting-platform sync, statutory interest, demand-letter stages, response tracking, and recovery operations. These concepts may inform future architecture compatibility, but no database table, route, job, component, or dependency should be implemented early.

---

## Data, Privacy, and Retention

- PostgreSQL is the transactional source of truth.
- Redis holds ephemeral rate-limit and queue state, not durable report truth.
- PDFs live in object storage; PostgreSQL stores references only.
- Search IP identity is hashed and removed/anonymised after 90 days.
- Registered-user reports remain until deletion is requested, subject to payment/audit retention duties.
- App-level deletion does not erase required Stripe or admin-audit records.

---

## Commercial Measurement

Phase A measures searches, selected companies, checkout starts, paid/delivered reports, refund rate, revenue by product, and search-to-purchase conversion. The later-phase gate counts only real user payments that are not tests or refunds and produced a delivered report.

---

## Success and Launch Criteria

- Users can identify the correct company and understand checked versus unchecked sources.
- Registry Trust/CCJs, Fair Payment Code, and AI are technically unreachable from free preview and free company tabs.
- A payment creates exactly one report through the webhook path.
- Paid reports use fresh entitled data and expose provider failures.
- Owner access, admin authorization, refunds, and report immutability are secure and tested.
- Every paid product generates its AI interpretation in Phase A with the exact configured model and token limit; AI failure is visible and does not invent or conceal source data.
- Every report and PDF contains approved compliance content.
- Lucky provides the mandatory disclaimer and confirms ICO registration before production launch.
- Admin alerts expose provider, webhook, generation, email, and stuck-report failures.
- Phase A analytics can prove whether the product has commercial traction before expanding scope.

### Corporate and Natural Disqualified Officers

`/search?q=&tab=disqualifications&type=&page=` provides free Companies House corporate and natural disqualification search. `/disqualified-officers/[officer-id]` presents corporate details and `/disqualified-officers/natural/[officer-id]` presents natural-person details.
