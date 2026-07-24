# Progress Tracker

## 2026-07-14 — Clerk Pending-Session Redirect Loop Fix

- Changed the shared server identity resolver to recognize Clerk v7 pending sessions as authenticated
  identities instead of signed-out visitors. Pending users remain subject to the existing verified
  primary-email requirement before checkout.
- Added regression coverage for pending-session handling plus signed-out, unverified, and normalized
  verified identity classification. This prevents the browser-side Clerk session and server-rendered
  checkout/topbar state from sending an authenticated user between checkout and sign-in indefinitely.
- Focused lint and typecheck passed, all 52 web assertions passed, and the Next.js 16.2.6 production
  build completed successfully with every authenticated Phase A route compiled.

## 2026-07-14 — Visitor Report Purchase Entry Flow

- Connected all four landing pricing actions to tier-aware company search and preserved validated
  purchase intent through company selection, overview review, desktop tabs, and the mobile selector.
- Added live product purchase cards to company overview plus checkout actions on CCJ, Fair Payment
  Code, and AI Summary locks, with a safe Single Report fallback when no tier was selected.
- Consolidated public web product metadata while retaining server-authoritative checkout pricing;
  existing Clerk, Stripe, webhook, credit redemption, refund, and delivery behavior is unchanged.
- Focused web typecheck passed; 49 existing web assertions and 2 purchase-intent assertions passed;
  changed-file lint and formatting passed; the Next.js 16.2.6 production build passed. Full web lint
  remains blocked by the pre-existing unnecessary assertion in `lib/data/search-companies.ts:66`.

## 2026-07-11 — Financial Flow Production Hardening

- Customer balance now sums only unused credits from active or partially refunded purchases through
  one shared eligibility predicate; refund-pending and refunded purchases are excluded consistently.
- Admin refunds now accept partially refunded packs, preserve the purchase's previous status for
  definitive Stripe failure recovery, and continue to reserve purchases while refunds are pending.
- Added project-owned Field/FieldSet/RadioGroup primitives after the official shadcn registry timed
  out, then migrated checkout selection to the shared accessible composition.
- Replaced Google-hosted Next fonts with locally packaged Inter and Geist Mono; the production build
  compiled and generated every route without outbound font requests.
- Added a Testcontainers PostgreSQL financial suite covering eligible balance, partially refunded
  redemption/refund, refund-pending exclusion, and concurrent final-credit claims. The suite is
  automatically runnable in Docker-enabled environments; it skipped here because no container runtime
  is installed.

## 2026-07-11 — Credit Redemption and Refund Integrity

- Added durable credit purchases linked to reports and ledger entries, oldest-purchase redemption,
  idempotent owner-authorized redemption endpoints/actions, and an explicit review page showing the
  balance before and after one credit is used.
- Added queued Stripe partial-refund processing for foundational report failures and admin-requested
  unused credits, refund webhook convergence, purchase/refund status, audit logging, and deterministic
  reconciliation jobs.
- Added migration backfill for existing paid sessions, commercial-shape constraints, non-negative
  projections, and a database trigger that prevents credit-ledger updates or deletes.
- Checkout now rejects inactive live tiers, payment status exposes purchased/used/remaining credits,
  and empty or unavailable data fails visibly.
- Affected API, worker, web, database, queue, and validation typechecks pass. API (40), worker (37),
  web (45), database (9), and validation (12) tests pass.

## 2026-07-11 — Paid Report Unlock and Credit Packs

- Rebuilt authenticated `/checkout` around live company-preview product data with four selectable
  credit packs, identical full-report inclusions, unit pricing, immediate redemption, retained-credit
  totals, verified owner identity, cancellation recovery, and Stripe-hosted payment handoff.
- Added authoritative `credit_quantity` product data plus durable owner credit accounts and an
  append-only ledger. Stripe-confirmed report creation, pack grant, initial one-credit redemption,
  and balance update now commit in one idempotent database transaction.
- Added an authenticated owner-only credit balance endpoint and additive Drizzle migration with
  non-negative balance and purchase/report uniqueness constraints.
- Focused API, database, and web tests pass; web, API, and database typechecks pass.

Update after every completed feature. Record actual state only.

---

## Current Status

**Product phase:** Phase A — Company Search and Paid Reports

**Build-plan phase:** 19A - Fair Payment Code States

**Last completed:** 12D - Logic/Data: Companies House Tab Data

**Next:** 19A - UI/Mock: Fair Payment Code States

**Status:** 12D is implemented. Production free company tabs now read live Companies House data through typed API routes, same-origin Next.js proxies, server-only DAL helpers, and the design-matched 12C workspace presentation. CCJs, Fair Payment Code, and AI Summary remain paid placeholders with no free-tab provider calls.

**Latest refinement:** 2026-07-10 design update: public company tabs now follow the supplied tab
designs, surface design-visible Companies House fields when returned, and show blurred paid
InvoiceGuard interpretation placeholders without generating or exposing AI conclusions to free users.

### Current Unit Scope

19A resumes the paid Fair Payment Code UI/mock work now that free Companies House tabs are live-data backed.

---

## Progress

### Completed

- [x] A0 Product baseline
- [x] A1 Monorepo/environment
- [x] A2 PostgreSQL/Drizzle foundation
- [x] A3 Config, validation, logging, utilities, queues
- [x] A4 Provider contracts
- [x] A5 Companies House
- [x] A6 Company search API
- [x] A7 Anonymous rate limit/search logs
- [x] A8 London Gazette
- [x] A9 Insolvency/disqualified officers
- [x] A10 Free-preview API
- [x] A11 Free-preview UI
- [x] 12A UI/Mock: Search and Report Selection — `UI/Mock Verified` 2026-06-22
- [x] 12B Logic/Data: Search and Report Products (A12)

### Remaining

- [x] 13A UI/Mock: Checkout and Payment Status — `UI/Mock Verified` 2026-06-28 under automated gate policy
- [x] 13B Logic/Data: Checkout, Webhook, Pending Report (A13-A15)
- [x] AUTH-A UI/Mock: Authentication and Buyer Identity — `UI/Mock Verified` 2026-06-29
- [x] AUTH-B Logic/Data: Clerk Authentication Foundation
- [x] 14A UI/Mock: Report Generation Lifecycle — `UI/Mock Verified` 2026-06-30
- [x] 14B Logic/Data: Generation Queue (A16)
- [x] AUTH-C Client-Decision Retrofit: Registration Before Payment — complete 2026-07-02
- [x] 15A UI/Mock: Paid Source and Tier Sections — `UI/Mock Verified` 2026-07-02
- [x] 15B Logic/Data: Providers and Frozen Snapshots (A17-A19)
- [x] 16A UI/Mock: Browser Reports — `UI/Mock Verified` 2026-07-02
- [x] 16B Logic/Data: Secure Report Delivery (A20)
- [x] 17A UI/Mock: Authenticated Report Notification Outcomes — `UI/Mock Verified` 2026-07-03
- [x] 17B Logic/Data: Owner Notifications and Postmark (A21-A22 revised)
- [x] 18A UI/Mock: Premium PDF and Compliance Blocks — `UI/Mock Verified` 2026-07-03
- [x] 18B Logic/Data: PDF, Storage, and Templates (A23-A25)
- [x] 12C UI/Mock: Free Companies House Tab Workspace — `UI/Mock Verified` 2026-07-10
- [x] 12D Logic/Data: Companies House Tab Data - complete 2026-07-10
- [ ] 19A UI/Mock: Fair Payment Code States
- [ ] 19B Logic/Data: Fair Payment Code Refresh (A26)
- [ ] 20A UI/Mock: Admin Dashboard
- [ ] 20B Logic/Data: Admin Authorization and Operations (A27, A29-A30)
- [ ] 21A UI/Mock: Refund Workflow
- [ ] 21B Logic/Data: Refunds and Audit Logs (A28)
- [ ] 22A UI/Mock: Maintenance Visibility
- [ ] 22B Logic/Data: Retention and Reliability Jobs (A31-A33)
- [ ] 23A UI/Mock: Phase A UAT Candidate
- [ ] 23B Logic/Data: Production Readiness (A34)

---

## What Exists

- Next.js 16 web, Express 5 API, worker, and shared workspace packages.
- Eight-table Phase A Drizzle schema and forward-only context-compliance migration.
- Typed BullMQ foundation; processors not implemented.
- Mock/live-shaped Companies House, London Gazette, and insolvency/disqualified-officer adapters.
- Search/profile/free-preview API, atomic Redis/in-memory rate limiting, signed proxy identity, and HMAC-hashed search logs.
- Server-authoritative one-off credit-pack report products and Companies House-only preview with explicit not-yet-checked paid sources.
- Phase A landing page with direct query submission into `/search?q=...`; autocomplete is not part of the active landing flow.
- `/search` Server Component data access through `apps/web/lib/data`, with company-result links to `/company/[houseNumber]/overview`.
- Reusable public company workspace shell for `/company/[houseNumber]/*` with shared masthead,
  design-ordered desktop tabs, mobile selector, source-status panel, development/test-only tab
  fixtures, richer Companies House-backed record cards for charges/insolvency/officers, and paid
  placeholders for CCJs, Fair Payment Code, AI Summary, and per-tab InvoiceGuard interpretation panels.
- Brand Asset Guide v1.0 visual foundation: InvoiceGuard navy/emerald palette, Inter typography,
  12px controls, rounded outline icons, and sparse brand-gradient usage.
- Live Companies House adapter support for alphabetical search, registered-office-address, profile, officers, filing history, charges, and insolvency endpoints.
- Typed free-tab API routes, 15-minute success-only Redis/in-memory tab cache, bounded pagination for
  filing history/charges/officers, same-origin Next.js tab proxies, and server-only workspace DAL
  helpers.
- Free-tab Companies House contracts include design-visible charge delivered dates/codes,
  officer nationality/date-of-birth/identity-verification details, active/resigned officer counts,
  and typed insolvency practitioners.
- Development-only deterministic fixtures for all Feature 12 states.
- Two-route checkout/status UI with verified-owner and verification-required fixtures, strict selection
  validation, bounded confirmation checks, cancellation retry, and duplicate-refresh messaging.
- Registration-first Stripe-hosted Checkout with trusted server pricing, signed Clerk principal,
  owner-scoped status, raw-body signature verification, durable event/session idempotency, paid
  amount/currency snapshots, and deterministic report-generation job IDs.
- Development/test-only auth previews for sign-in, sign-up, callback, error, signed-in, sign-out,
  unverified-email, owner, and non-owner states; production omits mock auth navigation and
  returns not found for preview routes.
- Safe return-path parsing limited to current Phase A routes, plus reusable account and report-access
  presentation components for AUTH-B and 16A/16B.
- Clerk v7 embedded sign-in/sign-up routes, public middleware context, session-aware account controls,
  verified-email checkout enforcement, HMAC-signed internal principals, and webhook-owned reports.
- Typed BullMQ report-generation processor factory with guarded Drizzle lifecycle transitions,
  retryable/terminal failure handling, deterministic job validation, and delayed-report queries.
- Development/test-only `/reports/preview` with deterministic Basic, Standard, and Premium complete,
  partial, source-state, refund-required, Registry Trust recovery, and AI interpretation fixtures.
- Reusable paid source-status, tier-entitled fact, AI interpretation, and recovery-action components;
  production hides the preview route with `notFound()`.
- Responsive fixture-driven `/reports/[reportReference]` browser report with desktop tabs, mobile
  section selector, expanded print document, complete/partial/access/not-ready/not-found/provider
  states, provisional issue/disclaimer copy, and historical Premium-only PDF UI states.
- Secure browser delivery with verified Clerk-owner authorization, concealed missing/non-owner
  responses, strict frozen-artifact and response schemas, entitlement-safe DTO projection, uncached
  server-only DAL access, lifecycle-only non-deliverable states, and development-only fixtures.
- Owner-visible report-ready email status fixtures for sending, sent, delayed, and failed delivery;
  delayed/failed email never blocks a completed report or suggests repurchase/regeneration.
- Production-gated compact report-ready email preview with company/tier/reference/time metadata,
  canonical authenticated report link, sign-in guidance, and no findings, personal data, or token.
- Durable owner-ready notification records created with ready/partial report finalization, deterministic
  BullMQ jobs, startup reconciliation, current verified-primary Clerk lookup, code-owned multipart
  templates, and at-most-once Postmark submission with explicit ambiguous-delivery visibility.
- Production-gated `/reports/preview/pdf` with deterministic Premium complete, long-content,
  partial-source, and flag-summary page sheets; shared browser/document compliance blocks, page-one
  disclaimer, printed fixture issue URL, print breaks, and a development-only ready-state preview link.
- Worker-only Claude Haiku 4.5 interpretation adapter with fixed 1,500-token output limit,
  prompt/schema locking, nullable source mirroring, and validated frozen artifact metadata.
- Frozen paid entitlements, report-linked immutable source snapshots, tier-aware paid generation,
  Registry Trust mock boundary, internal Fair Payment Code lookup, recovery policy metadata,
  provider alerts, and production worker composition.

---

## Decisions

- Companies House number is canonical identity.
- Phase A is search and one-off paid reports only.
- Free-tier search, preview, and company tabs query Companies House only; no other provider or AI dependency is permitted.
- Companies House filing history, charges, officers, and insolvency are free tab data.
- Anonymous free-tab reads consume the same five-per-24-hour allowance as search, including cache
  hits; authenticated requests remain exempt.
- Successful normalized free-tab responses are cached for 15 minutes by company number, tab, page,
  and limit. Provider failures are returned through the structured error envelope and are never cached
  or replaced by stale/fixture data.
- CCJs, Fair Payment Code, and AI summaries are paid-only.
- Users must register/sign in with a verified primary email before Stripe Checkout; no guest purchases or guest access tokens.
- Every paid tier receives AI interpretation in Phase A using exactly `claude-haiku-4-5-20251001` with `max_tokens: 1500`; the public AI Summary tab summarizes Companies House overview data only.
- Figma is complete-system reference; only Phase A-relevant patterns are active.
- Every remaining feature is split into a verified UI/Mock unit and a later Logic/Data unit.
- A Logic/Data unit cannot start until its paired UI/Mock unit is recorded as `UI/Mock Verified` with
  complete deterministic states and passing automated checks. User manual QA is non-blocking.
- Registry Trust runs only after webhook-confirmed payment.
- Public product codes are `single_report`, `starter_pack`, `business_pack`, and `agency_pack`; pack size changes credit quantity and price, not report depth.
- The price section is the authoritative public product display; persisted prices are 2000, 5400, 8000, and 14000 pence.
- Current credit-pack products grant full report entitlements and share the same Registry Trust free-recheck recovery path.
- Webhooks create reports; redirects do not.
- PostgreSQL/Drizzle, BullMQ/Redis, Clerk, Stripe, and Postmark are selected.
- `ENABLE_FLAG_SUMMARY=false` remains the default for the separate legacy template summary.
- AI interpretation is bounded to frozen factual report data and cannot provide legal/financial advice, credit decisions, risk scores, or invented conclusions.
- AUTH-A and AUTH-B are hard prerequisites for 14A; the earlier tracker ordering was stale.
- Phase A account navigation contains sign-in/sign-out only and does not open a dashboard; authentication is nevertheless mandatory before payment.
- `context/designs/brand_asset.png` is the canonical brand source. Its risk visuals do not override
  the product prohibition on risk scoring.

### Architecture Snapshot

```text
Browser -> Next proxy -> Express company routes -> CompanyService
        -> Companies House only for free tier
        -> normalized overview/filing-history/charges/officers/insolvency tabs
        -> CCJs/Fair Payment Code/AI shown as paid placeholders

Clerk owner -> Stripe webhook -> idempotent pending report -> BullMQ generation lifecycle
            -> 15B entitled providers/snapshots -> Claude interpretation -> frozen delivery
```

Free search, preview, and tabs are architecturally isolated from every source except Companies House and from AI. Ready reports, including their interpretation and generation metadata, are frozen artifacts. Redis is ephemeral infrastructure; PostgreSQL is durable truth.

---

## Blockers

- Production requires approved disclaimer wording and Lucky's ICO confirmation.
- Live providers, Stripe, Clerk, Postmark, PDF, and storage require implementation/verification.
- Landing/search physical browser QA remains pending because the in-app browser bridge was unavailable on 2026-06-27.

### Open Questions

- Final mandatory disclaimer text and approved issue-report address.
- Registry Trust production contract and credentials; mock behavior and failure/refund operations
  are implemented, while live mode intentionally fails closed.
- PDF rendering and object-storage provider selection.
- A production Anthropic credential is still required; SDK/API integration is implemented and
  verified against the current structured-output contract.
- Production hosting choices for API/worker/PostgreSQL/Redis.

---

## Known Debt

- Live-shaped insolvency endpoint requires production verification for paid reports; it is no longer a free-tier dependency.

---

## Verification Baseline

Feature 12 physical verification passed on 2026-06-22 for desktop clean/adverse/source-failure states, exact 390px rate-limit layout, focus order, and live/alert semantics.

2026-07-02 Feature 15B verification: repository typecheck, lint, full tests, changed-file
formatting, and the serial production build passed. Coverage includes frozen entitlement matrices,
safe migration backfill, paid-only Registry Trust mock/fail-closed live mode, tier-safe provider
selection, 24-hour successful-snapshot reuse, Companies House refund-required behavior, Registry
Trust recovery metadata, Premium Fair Payment Code lookup/evidence coverage, Claude composition,
atomic finalization, and live worker composition.

Final uncached gates passed on 2026-06-22: formatting, typecheck (12 tasks), lint (14 tasks), tests (11 workspace tasks; 33 executable assertions), and production build (12 tasks). The migration guard smoke tests passed without applying changes to a live database. Production `npm audit` reports no high-severity findings; two moderate PostCSS advisories remain inside pinned Next.js 16.2.6, and npm offers only an invalid breaking downgrade.

2026-06-27 landing/search refinement checks: repository formatting, typecheck (12 tasks), lint (14 tasks), and tests (11 workspace tasks; 34 executable assertions) passed. The web production build passed with `/` static and `/search` dynamic. Browser verification could not run because the browser execution bridge rejected initialization before opening the local app.

2026-06-28 Feature 13A automated checks: repository formatting, typecheck (12 tasks), lint (14 tasks),
and tests (12 workspace tasks; 40 executable assertions) passed. The web production build passed with
dynamic `/checkout` and `/checkout/status` routes. Production audit reports two moderate PostCSS
advisories inside pinned Next.js; the offered remediation is a breaking downgrade. Physical checkout
verification could not run because the browser bridge rejected initialization before opening localhost.

2026-06-28 Feature 13A physical-verification retry: the development-only fixture server started, but
the in-app browser bridge rejected initialization before a browser tab opened. Per the verification
gate, no desktop, 390px, focus, interaction, navigation, or screenshot evidence was claimed; 13A
remained pending at that point under the former physical gate.

2026-06-28 gate-policy decision: agent-run physical verification and user manual QA are non-blocking
across future units. 13A was accepted from its complete fixture matrix and automated checks.

2026-06-28 Feature 13B checks: formatting passed; typecheck passed 12 tasks; lint passed 14 tasks;
tests passed 12 workspace tasks; the final focused API suite passed 23 assertions, including raw
webhook signature acceptance/rejection, and five shared checkout-validation
assertions. Focused API and Next.js production builds passed; Next emitted dynamic checkout, status,
and same-origin status-proxy routes. The aggregate Turbo build exceeded the command timeout after its
workspace compilation stage, while the focused API and web builds completed successfully.

2026-06-29 AUTH-A checks: focused web typecheck and lint passed; all nine web assertions passed,
including every auth fixture, production fixture/preview guards, safe Phase A return paths,
open-redirect rejection, guest/editable and authenticated/read-only checkout identity, and existing
checkout privacy/production guards. Source-only Prettier checks
passed. The web production build compiled successfully and generated production-gated `/sign-in`,
`/sign-up`, and `/auth/preview` routes whose server components call `notFound()` in production.
The broad web formatting script remains noisy because it scans existing `.next` artifacts; no
generated files were changed. User manual browser QA remains non-blocking.

2026-06-29 AUTH-B implementation checks: installed `@clerk/nextjs` 7.5.9 and `@clerk/ui` 1.23.0;
focused web, API, and utils TypeScript checks passed. Repository tests passed 12 workspace tasks,
including 25 API assertions plus new signed-principal and authenticated-checkout ownership coverage.
Repository lint passed 13 unaffected workspaces and focused web lint passed after cleanup. The web
production build passed with dynamic Clerk sign-in/sign-up routes and the Next.js proxy. The build
used a process-only alias for the existing legacy local publishable-key name; `.env` was not modified.
The first sandboxed `clerk doctor --json` attempt timed out inside `npx`; the later host verification
below supersedes that environment-specific result.

2026-06-30 AUTH-B completion verification: repository typecheck passed 12 tasks, lint passed 14 tasks,
and tests passed 12 workspace tasks including forged-principal rejection and authenticated checkout
ownership. The host production build passed all 12 tasks. Clerk CLI 1.5.0 doctor verified login,
authentication, git-remote project linkage, development instance, and application reachability.
Production instance configuration remains a deployment-time warning and does not block this unit.

2026-06-30 Feature 14A checks: focused web lint and typecheck passed; all 16 web assertions passed,
including the complete lifecycle matrix, production fixture guards, malformed-reference rejection,
deterministic pending-to-ready and generating-to-partial transitions, terminal-state convergence,
responsive classes, semantic-token enforcement, and accessible live-status contracts. The Next.js
production build passed and emitted dynamic `/reports/[reportReference]/status`. User manual QA is
non-blocking under the project-wide automated gate policy.

2026-06-30 Feature 14B checks: focused worker lint, typecheck, build, and all 11 worker assertions
passed. Coverage includes ready/partial/refund-required outcomes, terminal no-ops, retry resumption,
retry exhaustion, non-retryable failure, missing/malformed IDs, concurrent terminal convergence,
the exact 15-minute delayed boundary, canonical BullMQ contracts, and the production-consumer gate.
Repository typecheck passed 12 tasks, lint passed 14 tasks, and tests passed 12 workspace tasks.
The aggregate Turbo build exceeded its four-minute command window without a reported compilation
failure; focused worker, config, API, and Next.js production builds all passed afterward.

2026-07-02 AUTH-C checks: generated and reviewed forward migration `0003_wandering_punisher.sql`
with an ownerless-row failure guard before making `clerk_user_id` non-null and removing guest
columns/indexes. Focused API tests passed 25 assertions, web passed 16, and worker passed 11; all
focused suites terminate normally. Aggregate typecheck passed 12 tasks, lint passed 14 tasks, tests
passed 12 tasks, and the production build passed 12 tasks with Next.js compiling all Phase A routes.
Coverage includes signed-out checkout rejection, trusted verified ownership, owner-scoped status,
missing webhook-owner rejection, migration safety, and Companies House-only free-preview isolation.

2026-07-02 Feature 15A checks: focused web typecheck and lint passed; all 24 web assertions passed,
including complete and partial fixtures for every paid tier, all six source states, all five AI states,
Companies House refund-required behavior, entitlement-safe section omission, tier-specific Registry
Trust recovery, production preview guards, semantic-token use, and accessible status contracts.
Focused Prettier checks passed. The Next.js production build passed and emitted the dynamic
`/reports/preview` route, whose Server Component returns `notFound()` in production. User manual QA
is non-blocking under the project-wide automated gate policy.

2026-07-02 Feature 16A checks: focused web TypeScript and lint passed; all 30 web assertions passed,
including complete and partial reports for every tier, entitlement-safe navigation, access/not-ready/
not-found/provider states, all four Premium PDF states, provisional compliance and issue contracts,
semantic-token enforcement, accessible tabs/mobile selection, and expanded print behavior. Focused
formatting passed. The Next.js 16.2.6 production build compiled successfully and emitted dynamic
`/reports/[reportReference]`; production fixture access remains closed with `notFound()` until 16B.

2026-07-03 Feature 16B checks: focused report-delivery tests passed 8 assertions and the full API
suite passed 33 assertions, covering unsigned access, trusted ownership, concealed missing/non-owner
responses, lifecycle data withholding, malformed-artifact failure, and the Basic/Standard/Premium
entitlement-leakage matrix. The web suite passed 30 assertions. Repository typecheck passed 12 tasks,
lint passed 14 tasks, tests passed 12 tasks, and the production build passed 12 tasks. Next.js 16.2.6
emitted dynamic `/reports/[reportReference]` with production owner-authorized frozen delivery.

2026-07-03 Feature 17A checks: focused web typecheck and lint passed; all 34 web assertions passed,
including every notification outcome across complete/partial report fixtures, safe canonical email
links, production preview guards, existing signed-out redirect and owner lookup contracts, semantic
tokens, mobile/desktop email structure, and accessible live status. The Next.js 16.2.6 production
build compiled successfully and emitted dynamic `/reports/preview/email`; the route calls
`notFound()` in production. User manual QA remains non-blocking under the automated gate policy.

2026-07-03 Feature 17B checks: generated and reviewed `0005_glorious_old_lace.sql`; focused worker,
API, database, configuration, and web tests passed. Coverage includes unique durable notifications,
deterministic startup reconciliation, verified-primary Clerk resolution, accepted/rejected/ambiguous
Postmark outcomes, at-most-once resubmission guards, escaped multipart templates, canonical secure
links, live owner-authorized status projection, and recipient privacy. Focused worker/API/web
typechecks and worker/API lint passed. Repository typecheck passed 12 tasks, lint passed 14 tasks,
tests passed 12 tasks, and the production build passed 12 tasks with Next.js 16.2.6 compiling every
Phase A route.

2026-07-03 Feature 18A checks: focused formatting, web TypeScript, web lint, all 38 web assertions,
and the focused Next.js 16.2.6 production build passed. Coverage includes all four Premium document
fixtures, Premium-only entitlement, default-disabled and explicit non-production flag-summary states,
page-one disclaimer, printed issue URL, shared browser/document compliance presentation, deterministic
page order, long/partial content, semantic-token enforcement, print breaks, and production preview
closure. Repository typecheck passed 12 tasks, lint passed 14 tasks, tests passed 12 tasks, and the
production build passed 12 tasks with `/reports/preview/pdf` emitted as a dynamic route that calls
`notFound()` in production. User manual document/print QA remains non-blocking under the automated
gate policy.

2026-07-03 Feature 18B checks: installed Playwright and AWS S3-compatible SDK support; generated and
reviewed `0006_fresh_naoko.sql`; real headless Chromium produced a tagged A4 PDF with a valid `%PDF`
signature (48,310 bytes). Repository typecheck passed 13 tasks, lint passed 15 tasks, tests passed 13
tasks, and the production build passed 13 tasks. Coverage includes shared escaped document HTML,
deterministic object keys/checksums, transient and terminal generation failure, durable one-to-one
artifact state with cascade deletion, trusted-owner download/retry, private object existence checks,
automatic Premium-only publication, startup reconciliation, and the dynamic same-origin PDF route.
Production PDF consumption intentionally remains idle until R2 configuration and approved code-owned
compliance copy exist; `ENABLE_FLAG_SUMMARY=false` remains canonical.

2026-07-09 structure/data boundary fix checks: `npx drizzle-kit check` passed; the disposable dev
database schemas were reset and `npm run pg:migrate` applied the corrected migration chain
successfully. Repository typecheck passed 13 tasks. Focused tests passed for `packages/validation`
(6 assertions), `apps/web` (38 assertions), `apps/worker` (37 assertions), and `apps/api` (35
assertions). Focused lint passed for web, API, and worker. The stale `0008` migration metadata was
removed with the bad migration.

2026-07-10 Companies House account payload bugfix: live profile `accounts.accounting_reference_date`
string day/month values are normalized to numbers, and `last_accounts.type` is treated as the string
that Companies House returns. Focused checks passed for integrations tests (16 assertions),
validation tests (8 assertions), API tests (35 assertions), web tests (38 assertions), typecheck for
integrations, validation, types, API, and web, and lint for integrations and validation.

2026-07-10 client update recorded: Companies House is a free resource for filing history, charges,
officers, and insolvency; only CCJs, Fair Payment Code, and AI summaries remain paid. Added 12C/12D
retrofit plan before continuing to Fair Payment Code work.

2026-07-10 Feature 12C checks: web typecheck passed, web lint passed, and the full web test suite
passed 44 assertions. Coverage includes every company workspace tab, populated/empty/loading/failed
fixture coverage for free Companies House tabs, paid placeholders for CCJs, Fair Payment Code, and
AI Summary, blurred AI Summary placeholder behavior, production fixture-query guards, `aria-current`
active tabs, native mobile selector accessibility, semantic-token checks, and factual-language
guards against clean/adverse paid-source conclusions.

2026-07-10 Feature 12D checks: focused integrations tests passed 17 assertions, validation tests
passed 11 assertions, API tests passed 40 assertions, and web tests passed 45 assertions. Root
typecheck passed 13 tasks and the production build passed 13 tasks after allowing Next.js to fetch
configured Google Fonts. Focused lint passed for integrations, validation, API, web, worker, config,
database, types, queues, UI, utils, logger, report-document, and typescript-config. The aggregate
`npm run lint` Turbo wrapper repeatedly timed out after dependency-package lint output with no rule
failure; affected workspace lint scripts were run directly instead. Coverage includes typed free-tab
schemas, design-visible Companies House fields, malformed/empty normalized records, pagination
metadata, route validation, anonymous quota exhaustion including cached tab hits, authenticated quota
bypass, success-only 15-minute cache keys, failure non-caching, Companies House-only provider
composition, same-origin DAL/proxy contracts, live overview failure states without fixture identity,
paid placeholders, blurred InvoiceGuard interpretation locks, tab order, and production
fixture-query rejection.

### Coverage Tracking

| System                                      | Current state                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Companies House normalization               | Covered                                                                                    |
| Gazette normalization                       | Covered                                                                                    |
| Insolvency/disqualification normalization   | Covered                                                                                    |
| Search/free-preview API                     | Covered for Companies House-only response and failure boundaries                           |
| All non-Companies-House free-tier isolation | Covered for free search, preview, workspace UI, and 12D free-tab route/service composition |
| Stripe/webhook/pending-report lifecycle     | Covered for checkout, paid/unpaid events, replay, queueing, and status                     |
| Worker generation lifecycle                 | Covered for claim, retry, terminal convergence, failure, and delay                         |
| Paid provider/partial/refund outcomes       | Covered by tier, snapshot reuse, recovery, and refund tests                                |
| AI interpretation                           | Composed into frozen paid generation with terminal fallback                                |
| Secure browser report delivery              | Covered for ownership, concealment, lifecycle, validation, and tiers                       |
| Owner notifications                         | Covered for ownership, durable state, retries, ambiguity, and live UI projection           |
| PDF/admin/maintenance                       | 18B PDF delivery covered; admin and maintenance pending                                    |

### Environment Variables in Scope

Active configuration includes `APP_URL`, `API_PORT`, `API_BASE_URL`, `API_PROXY_TIMEOUT_MS`, `DATABASE_URL`, `REDIS_URL`, `WEB_API_SHARED_SECRET`, `SEARCH_IP_HASH_SECRET`, `TRUSTED_CLIENT_IP_HEADER`, `ADMIN_EMAIL`, `ADMIN_ALERT_EMAIL`, `REPORT_GENERATION_STUCK_AFTER_MS`, Clerk/Stripe/Postmark secrets, provider modes/base URLs/timeouts/credentials, server-only `ANTHROPIC_API_KEY`, `ENABLE_FLAG_SUMMARY`, `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `PDF_COMPLIANCE_VERSION`. Interpretation is locked in code to model `claude-haiku-4-5-20251001` and `max_tokens: 1500`. Secrets remain server-only.

---

## Session Notes

- 2026-07-12: completed the final financial architecture cleanup. Refund terminal outcomes now use
  one idempotent `@workspace/db` transaction shared by the API webhook and refund worker; checkout
  persistence is decomposed into session, credit, and refund repositories; and the GitHub Actions
  `Financial PostgreSQL` check runs the strict Testcontainers suite before affected typecheck/lint.
  Configure branch protection to require `Financial integrity / Financial PostgreSQL` before merge.
- Restored the canonical nine-file InvoiceGuard context system after an accidental template revert.
- Use `build-plan.md` for order.
- Preserve A0-A11 behavior during Feature 12 refactor.
- Feature 12A passed its physical gate before report products were wired in 12B.
- The Phase A landing page now owns first-entry company discovery; the original full search/free-preview experience lives at `/search`.
- 2026-07-01: Brand Asset Guide v1.0 replaced the temporary public design source as the canonical
  brand reference. The obsolete source was removed. Risk-score examples in the guide remain
  explicitly outside approved product behavior.
- 2026-07-02: registered `context/designs/landing_page.html`, `landing_page.png`,
  `free-preview-suggestions.png`, `paid-search-result.png`, and `payment-page.png`; registered
  light/dark-surface logo assets under `apps/web/public/`; recorded Companies House-only free tier,
  mandatory pre-payment registration, and paid-report Phase A AI interpretation.
- 2026-07-10: client clarified that Companies House filing history, charges, officers, and insolvency
  are free tab data. Only CCJs, Fair Payment Code, and AI summaries are paid. The public AI Summary
  tab is paid-only and summarizes Companies House overview data.
- 2026-07-10: 12D wired production free tabs to live Companies House data with success-only short
  caching and no fixture substitution on real failures.
- 2026-07-12: implemented Companies House provider-page parity across canonical free-company
  contracts, normalization, search results, and company workspace presentation. Full addresses now
  retain premises/care-of/PO box fields; profiles retain confirmation-statement dates; filings retain
  description substitutions; charges retain particulars type and supplied charge flags. Search and
  overview now use explicit Companies House-style fact hierarchy and shared display terminology.
  Focused integrations (17), validation (12), API (40 passed/1 Docker-only skipped), and web (46)
  tests passed. Repository typecheck passed 13 tasks; focused integrations/API/web lint and builds
  passed; the Next.js 16.2.6 production build completed successfully for all public company routes.
  Aggregate lint/test/build wrappers exceeded the shared command window, so affected workspace gates
  were run directly; the full repository test run had already passed 12 tasks before the timeout.
- 2026-07-13: expanded Companies House parity to retain complete JSON-safe provider responses across
  search, profile, filing-history, charges, officers, and insolvency paths. Search and every free tab
  now include a collapsed recursive provider-metadata disclosure; null/blank/empty values disappear,
  while `false` and `0` remain visible. Filing contracts additionally normalize annotations,
  associated filings, resolutions, subcategory, barcode, and paper-filed state. Removed factual UI
  fallbacks that rendered missing Companies House values as "Not listed" or "Not supplied".
  Focused typecheck and lint passed for integrations, validation, API, and web. Tests passed for
  integrations (17), validation (12), API (40 passed/1 Docker-only skipped), and web (48). Focused
  integrations/API builds and the Next.js 16.2.6 production build passed; every company/search route
  compiled successfully.
- 2026-07-13: filing-history presentation now composes Companies House description identifiers with
  returned `description_values`. Confirmation statements and accounts use provider-style sentences
  with long-form UK dates, and every returned description value remains visibly labelled beneath the
  primary filing description for forward compatibility with unknown templates.
  Web typecheck and lint passed, all 49 web assertions passed, and the Next.js 16.2.6 production
  build completed successfully with every company and search route generated.
- 2026-07-13: corrected live filing description-value reconciliation. Filing rows now recover raw
  `description_values` from the retained Companies House payload by matching `transaction_id`, with
  normalized values taking precedence. Legacy filings display the provider's returned `description`
  value as their primary text. Web typecheck/lint, 49 tests, and production build passed.
- 2026-07-13: versioned the Companies House tab-cache namespace as `v2` so pre-parity Redis entries
  cannot suppress newly retained filing `description_values` or keep rendering `Legacy`. New requests
  bypass the old namespace and repopulate the 15-minute cache from the corrected provider pipeline.
  The focused API cache tests and web filing-description tests passed; API and web typechecks passed.
- 2026-07-13: fixed the filing-history field-loss boundary identified from the web server payload.
  Every normalized filing now carries its complete JSON-safe Companies House item as
  `providerPayload`, including `description_values`, links, identifiers, and unknown future fields.
  Runtime validation preserves that evidence, the web mapper reads description values from the
  per-filing payload, and the tab-cache namespace is now `v3`. End-to-end API coverage proves both
  normalized description values and the literal raw filing reach the frontend. Focused tests passed
  for integrations (7), validation (5), API (17), and web (9); all five affected workspace
  typechecks and focused lint passed.
- Landing suggestions carry the selected Companies House number to `/search`; display-name query text is contextual only and never canonical identity.
- Update this tracker and `ui-registry.md` after every feature.
- V1 context is reference material for depth; the canonical nine files remain the only active source of truth.

---

## Maintenance Rules

- Move status only when implementation and checks prove it.
- Record new decisions, blockers, open questions, checks, and debt immediately.
- Do not mark future work complete because contracts/placeholders exist.
- Keep this file operational; durable product/architecture detail belongs in the corresponding context file.

- 2026-07-16: implemented free Companies House corporate disqualified-officer search and detail flows with shareable tabs and pagination, the shared anonymous quota, complete provider metadata, and factual detail presentation. Integrations passed 18 tests. API passed 43 tests with one expected Docker-only skip. Web and API lint passed, repository typecheck passed 13 tasks, and the Next.js 16.2.6 production build compiled both new public routes and proxy resources.
- 2026-07-16: added natural disqualified-officer search and detail support with nested Corporate and People tabs. Integrations passed 19 tests, API passed 43 tests with one expected Docker-only skip, and web passed 55 tests. Focused integrations, API, and web lint passed; repository typecheck passed 13 tasks; the Next.js 16.2.6 production build compiled the natural public and proxy routes. All changed feature files pass Prettier. The repository-wide format check remains red on 34 pre-existing files outside this feature.
