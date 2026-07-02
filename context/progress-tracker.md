# Progress Tracker

Update after every completed feature. Record actual state only.

---

## Current Status

**Product phase:** Phase A — Company Search and Paid Reports

**Build-plan phase:** Phase 3 — Paid Generation

**Last completed:** 14B — Logic/Data: Generation Queue (A16)

**Next:** AUTH-C — Registration-Before-Payment Retrofit, then 15A — UI/Mock: Paid Source, Tier, and AI Interpretation Sections

**Status:** 14B complete; new client decisions require AUTH-C before continuing the paid-report path

**Latest refinement:** 2026-07-02 client scope update: free tier is Companies House-only, registration
is required before payment, paid reports require Claude interpretation in Phase A, and local design/logo
assets are now authoritative implementation references.

### Current Unit Scope

14B provides the backend-only BullMQ report-generation lifecycle engine: atomic pending claims,
idempotent terminal convergence, safe retry resumption, retry exhaustion, explicit terminal failures,
and 15-minute delayed-report detection. Production consumption remains intentionally unregistered
until 15B supplies the paid-provider generation handler.

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
- [ ] AUTH-C Client-Decision Retrofit: Registration Before Payment
- [ ] 15A UI/Mock: Paid Source and Tier Sections
- [ ] 15B Logic/Data: Providers and Frozen Snapshots (A17-A19)
- [ ] 16A UI/Mock: Browser Reports
- [ ] 16B Logic/Data: Secure Report Delivery (A20)
- [ ] 17A UI/Mock: Authenticated Report Notification Outcomes
- [ ] 17B Logic/Data: Owner Notifications and Postmark (A21-A22 revised)
- [ ] 18A UI/Mock: Premium PDF and Compliance Blocks
- [ ] 18B Logic/Data: PDF, Storage, and Templates (A23-A25)
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
- Server-authoritative one-off report products and working clean/adverse/standard/source-failure preview UI.
- Phase A landing page with debounced Companies House suggestions and canonical company selection into `/search`.
- Brand Asset Guide v1.0 visual foundation: InvoiceGuard navy/emerald palette, Inter typography,
  12px controls, rounded outline icons, and sparse brand-gradient usage.
- Live Companies House adapter support for alphabetical search, registered-office-address, profile, officers, filing history, charges, and insolvency endpoints.
- Development-only deterministic fixtures for all Feature 12 states.
- Two-route checkout/status UI with guest and authenticated fixtures, strict selection/email
  validation, bounded confirmation checks, cancellation retry, and duplicate-refresh messaging.
- Existing guest-first Stripe-hosted Checkout with trusted server pricing, dynamic payment-method support,
  raw-body signature verification, durable event/session idempotency, paid amount/currency snapshots,
  and deterministic report-generation job IDs. Guest entry is now superseded and must be removed in AUTH-C.
- Development/test-only auth previews for sign-in, sign-up, callback, error, signed-in, sign-out,
  unverified-email, owner, non-owner, and guest states; production omits mock auth navigation and
  returns not found for preview routes.
- Safe return-path parsing limited to current Phase A routes, plus reusable account and report-access
  presentation components for AUTH-B and 16A/16B.
- Clerk v7 embedded sign-in/sign-up routes, public middleware context, session-aware account controls,
  verified-email checkout enforcement, HMAC-signed internal principals, and webhook-owned reports.
- Typed BullMQ report-generation processor factory with guarded Drizzle lifecycle transitions,
  retryable/terminal failure handling, deterministic job validation, and delayed-report queries.

---

## Decisions

- Companies House number is canonical identity.
- Phase A is search and one-off paid reports only.
- Free-tier search and preview query Companies House only; no other provider or AI dependency is permitted.
- Users must register/sign in with a verified primary email before Stripe Checkout; no guest purchases or guest access tokens.
- Every paid tier receives an AI interpretation in Phase A using exactly `claude-haiku-4-5-20251001` with `max_tokens: 1500`.
- Figma is complete-system reference; only Phase A-relevant patterns are active.
- Every remaining feature is split into a verified UI/Mock unit and a later Logic/Data unit.
- A Logic/Data unit cannot start until its paired UI/Mock unit is recorded as `UI/Mock Verified` with
  complete deterministic states and passing automated checks. User manual QA is non-blocking.
- Registry Trust runs only after webhook-confirmed payment.
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
        -> normalized factual preview -> other sources shown as not yet checked

Clerk owner -> Stripe webhook -> idempotent pending report -> BullMQ generation lifecycle
            -> 15B entitled providers/snapshots -> Claude interpretation -> frozen delivery
```

Free preview is architecturally isolated from every source except Companies House and from AI. Ready reports, including their interpretation and generation metadata, are frozen artifacts. Redis is ephemeral infrastructure; PostgreSQL is durable truth.

---

## Blockers

- Production requires approved disclaimer wording and Lucky's ICO confirmation.
- Live providers, Stripe, Clerk, Postmark, PDF, and storage require implementation/verification.
- Landing/autocomplete physical browser QA remains pending because the in-app browser bridge was unavailable on 2026-06-27.

### Open Questions

- Final mandatory disclaimer text and approved issue-report address.
- Registry Trust production contract/credentials and exact failure/refund operations.
- PDF rendering and object-storage provider selection.
- Anthropic SDK/credential setup and current official API verification for the fixed model.
- Production hosting choices for API/worker/PostgreSQL/Redis.

---

## Known Debt

- Paid-provider generation handler and production worker composition remain 15B work.
- Live-shaped insolvency endpoint requires production verification for paid reports; it is no longer a free-tier dependency.
- Existing guest checkout/access fixtures, validation, and tests require removal or conversion in AUTH-C.

---

## Verification Baseline

Feature 12 physical verification passed on 2026-06-22 for desktop clean/adverse/source-failure states, exact 390px rate-limit layout, focus order, and live/alert semantics.

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

### Coverage Tracking

| System                                    | Current state                                                          |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| Companies House normalization             | Covered                                                                |
| Gazette normalization                     | Covered                                                                |
| Insolvency/disqualification normalization | Covered                                                                |
| Search/free-preview API                   | Existing coverage; update to assert Companies House-only composition   |
| All non-Companies-House free-tier isolation | Requires expanded regression coverage in AUTH-C/current refinement   |
| Stripe/webhook/pending-report lifecycle   | Covered for checkout, paid/unpaid events, replay, queueing, and status |
| Worker generation lifecycle               | Covered for claim, retry, terminal convergence, failure, and delay     |
| Paid provider/partial/refund outcomes     | Handler contract ready; provider implementation remains 15B            |
| AI interpretation                         | Required in Phase A; planned in 15A/15B                                |
| Owner notification/PDF/admin/maintenance  | Not implemented                                                        |

### Environment Variables in Scope

Active configuration includes `APP_URL`, `API_PORT`, `API_BASE_URL`, `API_PROXY_TIMEOUT_MS`, `DATABASE_URL`, `REDIS_URL`, `WEB_API_SHARED_SECRET`, `SEARCH_IP_HASH_SECRET`, `TRUSTED_CLIENT_IP_HEADER`, `ADMIN_EMAIL`, `ADMIN_ALERT_EMAIL`, `REPORT_GENERATION_STUCK_AFTER_MS`, Clerk/Stripe/Postmark secrets, provider modes/base URLs/timeouts/credentials, and `ENABLE_FLAG_SUMMARY`. Phase A 15B must add a server-only Anthropic credential and lock interpretation to model `claude-haiku-4-5-20251001` and `max_tokens: 1500`. Secrets remain server-only.

---

## Session Notes

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
- Landing suggestions carry the selected Companies House number to `/search`; display-name query text is contextual only and never canonical identity.
- Update this tracker and `ui-registry.md` after every feature.
- V1 context is reference material for depth; the canonical nine files remain the only active source of truth.

---

## Maintenance Rules

- Move status only when implementation and checks prove it.
- Record new decisions, blockers, open questions, checks, and debt immediately.
- Do not mark future work complete because contracts/placeholders exist.
- Keep this file operational; durable product/architecture detail belongs in the corresponding context file.
