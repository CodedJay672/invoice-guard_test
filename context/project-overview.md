# Project Overview

## About the Project

InvoiceGuard is a UK company-intelligence platform for SMEs, freelancers, agencies, and contractors who need to check a company before deciding whether to work with it.

The active commercial build is Phase A: search for a UK company, review a free preview, purchase a Basic, Standard, or Premium report, and receive a frozen, timestamped report assembled from public and paid sources. Guest checkout is supported and Premium includes a branded PDF.

Invoice chasing and late-payment recovery belong to a future phase.

---

## The Problem It Solves

Small businesses currently piece together company identity, filing history, insolvency notices, director history, registered charges, and County Court Judgements from multiple sources. InvoiceGuard presents the relevant checks as one factual record.

InvoiceGuard does not issue credit scores, approve or reject companies, or provide financial or legal advice. It reports what was found, what was not found in checked sources, and what could not be retrieved.

---

## Active Routes

```text
/                                      -> Company search and free preview
/api/companies/search                  -> Next.js proxy to Express
/api/companies/[companyNumber]/free-preview
                                       -> Next.js proxy to Express
/reports/[reportReference]             -> Paid report delivery (planned)
/reports/access/[token]                -> Guest report access (planned)
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

1. Visitor searches by registered name or Companies House number.
2. Companies House number becomes the canonical identity.
3. Anonymous visitors are limited to five searches per hashed IP per 24 hours.
4. Free preview calls exactly Companies House, the configured insolvency/disqualified-officer source, and London Gazette.
5. Registry Trust is never called before payment.
6. The UI renders clean, adverse, or standard preview state plus Court Records prompt and report tiers.

### Purchase and Generation

1. Visitor selects Basic, Standard, or Premium.
2. The server creates a one-off Stripe Checkout Session.
3. Stripe webhook signature and event idempotency are verified.
4. The webhook—not the redirect—creates one pending report and enqueues generation.
5. The worker fetches fresh entitled provider data, stores snapshots and statuses, and assembles frozen report data.
6. Companies House failure enters the automatic refund path; other failures produce a visible partial report.

### Delivery

- Every report shows reference, timestamp, company identity, tier, source statuses, disclaimer, and issue link.
- Guest links are emailed, stored as hashes, and expire after 30 days.
- Guest report data is retained for 12 months.
- Premium includes PDF; Basic does not.
- A later account may claim guest reports only after matching-email verification.

---

## Primary Actors

### Public Visitor and Guest Buyer

- Searches without an account within anonymous limits.
- Selects the correct Companies House entity before purchase.
- Sees only free-source results before payment.
- Can purchase with an email address and receives a secure report link.

### Authenticated Business User

- Uses Clerk identity for owned reports.
- May claim earlier guest reports only after the matching email is verified.
- Account history, saved companies, and notes remain Phase B features.

### Admin

- Lucky is the only Phase A admin.
- Reviews report/payment/provider state, transaction counts, and conversion.
- Can issue full or partial refunds with a required reason.
- Every sensitive action is server-authorized and audited.

### External Providers

- Companies House supplies canonical identity and core company records.
- London Gazette supplies strike-off and winding-up notices.
- The configured insolvency/disqualified-officer route supplies free-source flags.
- Registry Trust supplies paid CCJ data only after payment.
- Fair Payment Code supplies Premium-only status when implemented.

---

## Report Products

| Product | Price | Scope |
| --- | ---: | --- |
| Free Preview | GBP 0 | Company identity, status, incorporation, industry, partial address, active director count, and free-source adverse flags. |
| Basic | GBP 7.99 | Preview plus CCJ count/court/year, directors, and registered-address history. No PDF. |
| Standard | GBP 14.99 | Basic plus CCJ amounts/satisfaction, recent filing compliance, and charges. |
| Premium | GBP 27.00 | Standard plus deeper director/insolvency/related-company checks, Fair Payment Code, Confidence Indicator, timestamped reference, and PDF. |

`ENABLE_FLAG_SUMMARY` defaults to `false` everywhere until approved templates receive solicitor sign-off.

### Free Preview Presentation

Always show registered name, company number, status, incorporation date and age, registered town/county, active-director count, Court Records prompt, and paid tiers.

Adverse banners stack when insolvency, disqualification, Gazette strike-off, or Gazette winding-up flags are true. The clean path requires all four flags false and active company status. Provider failure must not be represented as a clean check.

### Paid Data Freshness and Failure

- Every paid report attempts a fresh fetch for every entitled source.
- Cached provider data older than 24 hours is not acceptable for generation.
- Provider snapshots retain checked time, source context, tier, status, and normalized payload/failure.
- Companies House failure prevents delivery and triggers automatic refund handling.
- Non-critical failure produces a partial report with explicit source status.
- Basic/Standard Registry Trust failure offers a free recheck within seven days when service recovers.
- Premium Registry Trust failure is surfaced for Lucky's recheck/partial-refund decision.

---

## Phase A Scope

In scope:

- Company search, free preview, and anonymous rate limiting.
- One-off report products and Stripe payment.
- Paid-only Registry Trust boundary.
- BullMQ report generation, provider snapshots, and partial reports.
- Secure guest delivery, Postmark email, and Premium PDF.
- Mandatory disclaimer, issue reporting, approved copy templates, and Fair Payment Code refresh.
- Clerk-protected admin operations, refunds, conversion analytics, and maintenance jobs.

Out of scope:

- User dashboard, saved companies, notes, watchlists, and subscriptions.
- Payment-signal collection.
- Invoice upload, OCR, chasing, accounting integrations, interest calculators, demand letters, response portals, or SMS.
- AI-generated legal/report copy, credit scores, risk scores, or colour-band risk ratings.

---

## Future Phases and Gates

| Phase | Direction | Gate |
| --- | --- | --- |
| B | Accounts, report history, saved companies, notes | At least 30 real, delivered, non-refunded Phase A purchases and acceptable conversion. |
| C | Starter watchlists and non-CCJ alerts | After Phase B. |
| D | Higher-tier monitoring and enterprise admin | After Phase C. |
| E | Structured payment-experience signals | After sufficient eligible Premium usage. |
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
- Guest access tokens are stored hashed and expire after 30 days.
- Guest report data remains for 12 months.
- Registered-user reports remain until deletion is requested, subject to payment/audit retention duties.
- App-level deletion does not erase required Stripe or admin-audit records.

---

## Commercial Measurement

Phase A measures searches, selected companies, checkout starts, paid/delivered reports, refund rate, revenue by tier, and search-to-purchase conversion. The later-phase gate counts only real user payments that are not tests or refunds and produced a delivered report.

---

## Success and Launch Criteria

- Users can identify the correct company and understand checked versus unchecked sources.
- Registry Trust is technically unreachable from free preview.
- A payment creates exactly one report through the webhook path.
- Paid reports use fresh entitled data and expose provider failures.
- Guest access, admin authorization, refunds, and report immutability are secure and tested.
- Every report and PDF contains approved compliance content.
- Lucky provides the mandatory disclaimer and confirms ICO registration before production launch.
- Admin alerts expose provider, webhook, generation, email, and stuck-report failures.
- Phase A analytics can prove whether the product has commercial traction before expanding scope.
