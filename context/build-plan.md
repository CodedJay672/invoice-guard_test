# Build Plan

## Core Principle

Every remaining feature is split into two independently tracked units:

1. **UI/Mock unit (`A`)** — build every user-visible or operational state with representative mock data.
2. **Logic/Data unit (`B`)** — implement services, persistence, providers, queues, and real-data wiring only after the UI/Mock unit is verified and recorded as complete.

An `A` unit is not a disposable wireframe. It must use production-intended components, responsive structure, accessibility behavior, and canonical tokens. Mock data may be replaced; the verified presentation contract should remain.

---

## UI/Mock Verification Gate

No `B` unit may start until its paired `A` unit has:

- All listed happy, loading, empty, partial, error, disabled, and edge states built.
- Desktop/mobile, keyboard/focus, and accessibility states covered by deterministic fixtures and automated checks where practical.
- Relevant Figma comparison completed when a matching design exists.
- Product copy and phase scope checked against context.
- Automated verification evidence recorded in `progress-tracker.md`.
- New/changed component patterns recorded in `ui-registry.md`.
- Web typecheck and lint passing for production code used by the mock.
- Explicit status: `UI/Mock Verified`.

Allowed verification methods:

| Method | Use |
| --- | --- |
| Figma comparison | Layout, hierarchy, spacing, typography, component and responsive intent where Phase A designs exist. |
| Physical browser testing | Interaction, responsive behavior, loading/error transitions, focus, forms, dialogs, tables, and navigation. |
| Document/PDF inspection | Report pagination, print hierarchy, disclaimer placement, identifiers, and source status. |
| Operational mock testing | Admin/maintenance/job states that need fixtures rather than a public design. |

Agent-run physical browser testing and user manual QA are encouraged but non-blocking. Their absence
does not prevent `UI/Mock Verified` status when the complete state matrix, accessibility contracts,
responsive implementation, and automated checks pass.

When Figma depicts future-only behavior, adapt only the Phase A visual pattern. Phase scope always wins.

---

## Logic/Data Completion Gate

A `B` unit is complete only when:

- Real data replaces mock data without changing the verified presentation contract unnecessarily.
- API, database, provider, queue, security, privacy, and failure requirements pass.
- Mock fixtures remain available for deterministic UI/state testing where useful.
- Narrow checks and repository-level checks pass.
- The real end-to-end flow has automated integration coverage; user manual QA remains non-blocking.
- `progress-tracker.md` records implementation and verification evidence.

---

## Completed Foundation

- [x] A0 Phase A product baseline
- [x] A1 npm/Turborepo monorepo
- [x] A2 PostgreSQL/Drizzle schema and migration
- [x] A3 Shared config, validation, logging, utilities, and queues
- [x] A4 Provider contracts
- [x] A5 Companies House integration
- [x] A6 Company search API
- [x] A7 Anonymous rate limit and search logs
- [x] A8 London Gazette integration
- [x] A9 Insolvency/disqualified-officer integration
- [x] A10 Free-preview API with three approved sources
- [x] A11 Working clean/adverse free-preview UI

Existing A0-A11 behavior is preserved. The current public UI still requires token, component, and Figma-alignment work in 12A.

---

## Phase 1 — Public Experience and Products

### 12A — UI/Mock: Search and Report Selection

Build with mock fixtures:

- Phase A navigation, wordmark, search hero, source-trust strip, factual company snapshot, CTA, and footer.
- Search idle, typing, loading, results, no-results, invalid-query, rate-limited, and provider-error states.
- Preview loading, clean, adverse with multiple banners, standard/non-active, and source-failed states.
- Court Records unchecked/locked card.
- Basic, Standard, and Premium cards with prices, entitlements, PDF availability, disabled/ready CTA states.
- Responsive mobile, tablet, and desktop layouts.

Verification: Figma comparison for Phase A-relevant shell patterns plus physical browser testing of every state. Do not include the Figma risk score or recovery features.

### 12B — Logic/Data: Search and Report Products

Depends on: **12A — UI/Mock Verified**.

- Preserve and wire existing search/free-preview APIs into verified components.
- Extract interactive logic from page-level composition.
- Consolidate canonical design tokens and remove raw colour classes.
- Seed/read report products at 799, 1499, and 2700 pence.
- Validate trusted entitlements and PDF flags server-side.
- Preserve tests proving free preview cannot call Registry Trust.

#### Landing/Search Refinement

- `/` is the Phase A landing page and keeps all interactive behavior in the autocomplete client leaf.
- Landing autocomplete uses the existing same-origin company-search proxy and requires selection of a canonical Companies House entity.
- Selection navigates to `/search` with the company number and display query; `/search` loads that company preview directly while retaining its standalone search controls.
- Landing copy remains limited to Phase A company intelligence and one-off reports. Recovery, subscriptions, accounting sync, watchlists, and risk scores remain excluded.

---

## Phase 2 — Checkout and Payment Confirmation

### 13A — UI/Mock: Checkout and Payment Status

- Checkout summary with canonical company identity, selected tier, exact price, and entitlements.
- Guest email and authenticated states.
- Invalid/inactive product, validation failure, redirecting, cancelled, failed, paid/pending, duplicate-refresh, and delayed-confirmation states.
- Clear language that payment confirmation comes from Stripe, not the redirect.

Verification: deterministic form, validation, focus-contract, responsive-structure, refresh, and navigation coverage. User manual QA is non-blocking.

### 13B — Logic/Data: Stripe Checkout, Webhook, and Pending Report

Depends on: **13A — UI/Mock Verified**.

- Create server-authoritative one-off Stripe Checkout Sessions.
- Mount correct raw-body signature verification.
- Persist `stripe_events` for durable idempotency.
- Create exactly one pending purchased report from the webhook.
- Enqueue exactly one generation job.
- Test invalid metadata, signature failure, duplicate/replayed events, guest/auth identity, and atomic effects.

---

## Phase 2A — Clerk Authentication and Ownership

Authentication is Phase A infrastructure for report ownership and admin authorization. It does not
open the Phase B dashboard, report history, saved companies, notes, watchlists, or subscriptions.
Complete `AUTH-A` and `AUTH-B` before starting 14A.

### AUTH-A — UI/Mock: Authentication and Buyer Identity

- Signed-out, sign-in, sign-up, callback/loading, authentication-error, signed-in, sign-out, and
  unverified-email states.
- Guest checkout remains available; signed-in checkout shows the verified account email as read-only.
- Navigation/account controls preserve the existing public shell and return users to their intended
  Phase A route after authentication.
- Representative owner, non-owner, and guest report-access presentation states for later secure
  delivery wiring.
- No account dashboard, report-history page, saved companies, notes, watchlists, or subscriptions.

Verification: deterministic auth/buyer-identity state coverage, redirect and focus contracts,
production fixture guards, and responsive public-shell checks. User manual QA is non-blocking.

### AUTH-B — Logic/Data: Clerk Authentication Foundation

Depends on: **AUTH-A — UI/Mock Verified** and **13B — Logic/Data complete**.

- Install and configure Clerk using validated server-only/publishable environment values and current
  Next.js App Router guidance.
- Add the root Clerk provider, auth routes, request protection/identity middleware, and shared
  server-side helpers for authenticated user ID plus verified primary email.
- Keep public search, preview, guest checkout, and guest report access usable without authentication.
- Pass authenticated identity to Express through a signed trusted web-to-API boundary; never trust a
  browser-supplied Clerk user ID or email.
- For signed-in checkout, persist `clerk_user_id` on the pending report and use the verified account
  email; preserve the existing guest-email path for signed-out buyers.
- Expose reusable owner/admin authorization primitives for 16B and 20B without implementing those
  later units early.
- Test sign-in callback safety, unverified email handling, sign-out, guest regression, forged identity
  rejection, signed-in report ownership, and secret/client-bundle boundaries.

---

## Phase 3 — Paid Generation

### 14A — UI/Mock: Report Generation Lifecycle

- Pending, generating, slow/stuck, ready, partial, failed, refund-required, refund-processing, and refunded states.
- Safe refresh/polling presentation and recovery guidance.
- Provider/source progress without exposing internal errors.

Verification: automated fixture transitions plus responsive/accessibility contract checks; user manual QA is non-blocking.

### 14B — Logic/Data: Report Generation Queue

Depends on: **14A — UI/Mock Verified**.

- Implement typed/idempotent report worker processing.
- Define valid lifecycle transitions and retryable/terminal failure rules.
- Configure retries and stuck threshold.
- Make reprocessing converge without duplicate effects.

### 15A — UI/Mock: Paid Report Source and Tier Sections

- Source-status list for success, failed, unavailable, stale, pending, and not-entitled states.
- Complete and partial Basic, Standard, and Premium section fixtures.
- Companies House foundational failure/refund state.
- Registry Trust recheck and Premium escalation states.

Verification: automated tier/state matrix coverage and factual-language review; user manual QA is non-blocking.

### 15B — Logic/Data: Paid Providers and Frozen Snapshots

Depends on: **15A — UI/Mock Verified**.

- Implement paid-only Registry Trust and provider usage/cost logging.
- Orchestrate sources from trusted tier entitlements.
- Enforce fresh-data/cache-age rules.
- Store snapshots, statuses, timestamps, reference, and frozen report JSON.
- Implement Companies House refund-required and non-critical partial-report behavior.
- Alert admin and test report immutability.

---

## Phase 4 — Delivery

### 16A — UI/Mock: Browser Reports

- Complete and partial Basic, Standard, and Premium report pages.
- Header, company identity, reference, timestamp, tier, source status, entitled sections, summary placeholder, disclaimer, issue link, and PDF action.
- Loading, access-denied, not-ready, not-found, and provider-failure states.
- Screen, mobile, and print layouts.

Verification: Phase A Figma comparison where applicable plus automated screen/mobile/print contract checks; user manual QA is non-blocking.

### 16B — Logic/Data: Secure Browser Report Delivery

Depends on: **16A — UI/Mock Verified** and **AUTH-B — Logic/Data complete**.

- Add secure owner/guest report lookup.
- Build tier-safe display payloads from frozen report data only.
- Prevent not-entitled leakage and ready-report mutation.
- Wire real source statuses and lifecycle state.

### 17A — UI/Mock: Guest Access and Email Outcomes

- Valid, invalid, expired, already-claimed, email-sending, email-delayed, email-failed, and claim-to-account states.
- Guest access email rendered with representative report/link data.

Verification: automated link-state and email-preview coverage at mobile/desktop structures; user manual QA is non-blocking.

### 17B — Logic/Data: Guest Tokens and Postmark

Depends on: **17A — UI/Mock Verified** and **AUTH-B — Logic/Data complete**.

- Generate secure tokens and store only hashes.
- Enforce 30-day expiry and verified-email claim.
- Implement idempotent Postmark jobs and terminal failure visibility.
- Test wrong token, expiry boundary, retries, duplicate jobs, and safe claim behavior.

---

## Phase 5 — PDF and Compliance

### 18A — UI/Mock: Premium PDF and Compliance Blocks

- Premium PDF mock with identity, reference, timestamp, tier, source status, report sections, page-one disclaimer, and printed issue URL.
- Browser disclaimer/issue blocks.
- Flag-summary disabled placeholder and approved-template fixture.
- Multi-page, long-content, partial-source, and print states.

Verification: document/PDF inspection, print testing, copy review, and comparison with relevant report design. Basic has no PDF.

### 18B — Logic/Data: PDF, Storage, Disclaimer, and Templates

Depends on: **18A — UI/Mock Verified** and approved disclaimer/template copy where required.

- Select/document PDF and object-storage implementation.
- Generate Premium PDF from frozen report data.
- Persist object reference, surface failure, and retry safely.
- Implement mandatory disclaimer and exact approved templates behind `ENABLE_FLAG_SUMMARY=false`.
- Add snapshot/exact-copy tests.

### 19A — UI/Mock: Fair Payment Code States

- Present, absent, stale, refreshing, and source-failed Premium states.

Verification: automated report/admin state coverage and factual copy review; user manual QA is non-blocking.

### 19B — Logic/Data: Fair Payment Code Refresh

Depends on: **19A — UI/Mock Verified**.

- Implement seven-day refresh, persistence, Premium consumption, and visible failure status.

---

## Phase 6 — Admin and Operations

### 20A — UI/Mock: Admin Dashboard

- Reports, payments, provider failures, search activity, revenue, conversion, and transaction-gate views.
- Filters, pagination, detail panels, loading, empty, degraded, unauthorized, and alert states.
- Responsive table alternatives.

Verification: automated role/state/table coverage and relevant Figma admin comparison if available; user manual QA is non-blocking.

### 20B — Logic/Data: Admin Authorization, Queries, and Alerts

Depends on: **20A — UI/Mock Verified** and **AUTH-B — Logic/Data complete**.

- Apply the shared Clerk identity helpers and enforce verified-email `ADMIN_EMAIL` authorization.
- Implement operational queries and provider/webhook/stuck-report alerts.
- Calculate qualifying transactions, revenue, and conversion correctly.
- Test non-admin denial server-side.

### 21A — UI/Mock: Refund Workflow

- Full/partial refund, required reason, confirmation, processing, success, failure, duplicate/already-refunded, and audit-history states.

Verification: automated dialog/focus/destructive-action contract tests with mock reports; user manual QA is non-blocking.

### 21B — Logic/Data: Stripe Refunds and Audit Logs

Depends on: **21A — UI/Mock Verified**.

- Implement authorized, reason-required, idempotent full/partial refunds.
- Keep Stripe/report/refund state consistent.
- Write admin audit records and test duplicate/failure behavior.

---

## Phase 7 — Maintenance and Launch

### 22A — UI/Mock: Maintenance and Reliability Visibility

- Admin fixtures for stuck reports, expired guest links, anonymisation runs, scheduled-job health, alert delivery, and maintenance failures.
- Define physical time-boundary test cases before scheduling jobs.

Verification: operational mock testing. Figma is optional unless matching admin designs exist.

### 22B — Logic/Data: Retention and Reliability Jobs

Depends on: **22A — UI/Mock Verified**.

- Anonymise/delete search IP identity after 90 days.
- Expire guest links after 30 days while retaining report data for 12 months.
- Detect stuck reports and alert admin.
- Make jobs scheduled, idempotent, observable, and boundary-tested.

### 23A — UI/Mock: Phase A UAT Candidate

- Assemble all verified UI/Mock and implemented flows into the release candidate.
- Re-run full responsive, accessibility, print, error, and Phase A Figma comparison.
- Perform physical UAT for every public/admin state and record defects.

Verification: signed-off UAT notes and no unresolved critical visual/interaction defects.

### 23B — Logic/Data: Production Readiness

Depends on: **23A — UI/Mock Verified** and all prior B units complete.

- Run end-to-end payment/provider/report/refund/guest/admin/maintenance flows.
- Verify live credentials, rate limits, Stripe replay, backup/rollback, monitoring, alert routing, privacy, and security.
- Clear disclaimer and ICO blockers before production deployment.

---

## Unit Specification Template

Every unit specification records:

- Objective and user/operational outcome.
- Scope and explicit non-goals.
- States or data contracts involved.
- Dependencies and phase constraints.
- Verification method and evidence required.
- Acceptance criteria and checks.
- Required tracker/registry updates.

For a `B` unit, the paired verified `A` unit is always a hard dependency.

---

## Future Reference

Phase A Clerk authentication provides identity, report ownership, verified-email claiming, and admin
authorization only. Do not schedule Phase B account dashboards/history/saved companies, Phase C-D
watchlists, Phase E payment signals, or Phase F recovery until their gates open and a new `/architect`
plan is approved.
