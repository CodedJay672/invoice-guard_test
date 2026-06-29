# Progress Tracker

Update after every completed feature. Record actual state only.

---

## Current Status

**Product phase:** Phase A — Company Search and Paid Reports

**Build-plan phase:** Phase 2A — Clerk Authentication and Ownership

**Last completed:** AUTH-A — UI/Mock: Authentication and Buyer Identity

**Next:** AUTH-B — Logic/Data: Clerk Authentication Foundation

**Status:** AUTH-A is `UI/Mock Verified`; Clerk wiring and ownership foundation are next

**Latest refinement:** Phase A landing page and canonical landing-to-search handoff completed 2026-06-27; physical browser re-verification pending tooling availability.

### Current Unit Scope

AUTH-A provides production-gated authentication previews, safe internal return paths, restrained
account navigation, verified-email buyer presentation, and owner/non-owner/guest access fixtures.
Clerk sessions, trusted identity propagation, and server authorization remain in AUTH-B.

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
- [ ] AUTH-B Logic/Data: Clerk Authentication Foundation
- [ ] 14A UI/Mock: Report Generation Lifecycle
- [ ] 14B Logic/Data: Generation Queue (A16)
- [ ] 15A UI/Mock: Paid Source and Tier Sections
- [ ] 15B Logic/Data: Providers and Frozen Snapshots (A17-A19)
- [ ] 16A UI/Mock: Browser Reports
- [ ] 16B Logic/Data: Secure Report Delivery (A20)
- [ ] 17A UI/Mock: Guest Access and Email Outcomes
- [ ] 17B Logic/Data: Guest Tokens and Postmark (A21-A22)
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
- Live Companies House adapter support for alphabetical search, registered-office-address, profile, officers, filing history, charges, and insolvency endpoints.
- Development-only deterministic fixtures for all Feature 12 states.
- Two-route checkout/status UI with guest and authenticated fixtures, strict selection/email
  validation, bounded confirmation checks, cancellation retry, and duplicate-refresh messaging.
- Guest-first Stripe-hosted Checkout with trusted server pricing, dynamic payment-method support,
  raw-body signature verification, durable event/session idempotency, paid amount/currency snapshots,
  and deterministic report-generation job IDs.
- Development/test-only auth previews for sign-in, sign-up, callback, error, signed-in, sign-out,
  unverified-email, owner, non-owner, and guest states; production omits mock auth navigation and
  returns not found for preview routes.
- Safe return-path parsing limited to current Phase A routes, plus reusable account and report-access
  presentation components for AUTH-B and 16A/16B.

---

## Decisions

- Companies House number is canonical identity.
- Phase A is search and one-off paid reports only.
- Figma is complete-system reference; only Phase A-relevant patterns are active.
- Every remaining feature is split into a verified UI/Mock unit and a later Logic/Data unit.
- A Logic/Data unit cannot start until its paired UI/Mock unit is recorded as `UI/Mock Verified` with
  complete deterministic states and passing automated checks. User manual QA is non-blocking.
- Registry Trust runs only after webhook-confirmed payment.
- Webhooks create reports; redirects do not.
- PostgreSQL/Drizzle, BullMQ/Redis, Clerk, Stripe, and Postmark are selected.
- `ENABLE_FLAG_SUMMARY=false` everywhere by default.
- No AI-generated legal/report copy or risk scores.
- AUTH-A and AUTH-B are hard prerequisites for 14A; the earlier tracker ordering was stale.
- Phase A account navigation contains sign-in/sign-out only and does not open a dashboard.

### Architecture Snapshot

```text
Browser -> Next proxy -> Express company routes -> CompanyService
        -> Companies House + Gazette + insolvency/disqualified officers
        -> normalized preview payload -> clean/adverse/standard/source-failure UI

Stripe webhook (future) -> idempotent pending report -> BullMQ worker
                        -> entitled providers/snapshots -> frozen delivery
```

Free preview is architecturally isolated from Registry Trust. Ready reports are frozen artifacts. Redis is ephemeral infrastructure; PostgreSQL is durable truth.

---

## Blockers

- Production requires approved disclaimer wording and Lucky's ICO confirmation.
- Live providers, Stripe, Clerk, Postmark, PDF, and storage require implementation/verification.
- Landing/autocomplete physical browser QA remains pending because the in-app browser bridge was unavailable on 2026-06-27.

### Open Questions

- Final mandatory disclaimer text and approved issue-report address.
- Registry Trust production contract/credentials and exact failure/refund operations.
- PDF rendering and object-storage provider selection.
- Production hosting choices for API/worker/PostgreSQL/Redis.

---

## Known Debt

- Queue processors are not implemented.
- Live-shaped insolvency endpoint requires production verification.

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

### Coverage Tracking

| System | Current state |
| --- | --- |
| Companies House normalization | Covered |
| Gazette normalization | Covered |
| Insolvency/disqualification normalization | Covered |
| Search/free-preview API | Covered |
| Registry Trust free-preview isolation | Covered by current dependency tests; preserve |
| Stripe/webhook/pending-report lifecycle | Covered for checkout, paid/unpaid events, replay, queueing, and status |
| Worker generation/partial/refund | Not implemented |
| Guest/email/PDF/admin/maintenance | Not implemented |

### Environment Variables in Scope

Active configuration includes `APP_URL`, `API_PORT`, `API_BASE_URL`, `API_PROXY_TIMEOUT_MS`, `DATABASE_URL`, `REDIS_URL`, `WEB_API_SHARED_SECRET`, `SEARCH_IP_HASH_SECRET`, `TRUSTED_CLIENT_IP_HEADER`, `ADMIN_EMAIL`, `ADMIN_ALERT_EMAIL`, Clerk/Stripe/Postmark secrets, provider modes/base URLs/timeouts/credentials, and `ENABLE_FLAG_SUMMARY`. Secrets remain server-only.

---

## Session Notes

- Restored the canonical nine-file InvoiceGuard context system after an accidental template revert.
- Use `build-plan.md` for order.
- Preserve A0-A11 behavior during Feature 12 refactor.
- Feature 12A passed its physical gate before report products were wired in 12B.
- The Phase A landing page now owns first-entry company discovery; the original full search/free-preview experience lives at `/search`.
- Landing suggestions carry the selected Companies House number to `/search`; display-name query text is contextual only and never canonical identity.
- Update this tracker and `ui-registry.md` after every feature.
- V1 context is reference material for depth; the canonical nine files remain the only active source of truth.

---

## Maintenance Rules

- Move status only when implementation and checks prove it.
- Record new decisions, blockers, open questions, checks, and debt immediately.
- Do not mark future work complete because contracts/placeholders exist.
- Keep this file operational; durable product/architecture detail belongs in the corresponding context file.
