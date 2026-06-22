# Progress Tracker

Update after every completed feature. Record actual state only.

---

## Current Status

**Product phase:** Phase A — Company Search and Paid Reports

**Build-plan phase:** Phase 1 — Public Experience and Products

**Last completed:** A11 — Working free-preview UI

**Next:** 12A — UI/Mock: Search and Report Selection

**Status:** Not started

### Current Unit Scope

12A rebuilds the public Phase A shell from relevant Figma patterns using representative mock states. It covers production-intended components, tokens, responsive behavior, accessibility, search/preview/tier states, and physical/Figma verification. It does not add or wire report-product persistence. 12B remains blocked until 12A is recorded as `UI/Mock Verified`.

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

### Remaining

- [ ] 12A UI/Mock: Search and Report Selection
- [ ] 12B Logic/Data: Search and Report Products (A12)
- [ ] 13A UI/Mock: Checkout and Payment Status
- [ ] 13B Logic/Data: Checkout, Webhook, Pending Report (A13-A15)
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
- Eight-table Phase A Drizzle schema and migration.
- Typed BullMQ foundation; processors not implemented.
- Mock/live-shaped Companies House, London Gazette, and insolvency/disqualified-officer adapters.
- Search/profile/free-preview API, Redis/in-memory rate limiting, and hashed-IP search logs.
- Working company search and clean/adverse preview with tier cards.

---

## Decisions

- Companies House number is canonical identity.
- Phase A is search and one-off paid reports only.
- Figma is complete-system reference; only Phase A-relevant patterns are active.
- Every remaining feature is split into a verified UI/Mock unit and a later Logic/Data unit.
- A Logic/Data unit cannot start until its paired UI/Mock unit is recorded as `UI/Mock Verified` with Figma and/or physical-test evidence.
- Registry Trust runs only after webhook-confirmed payment.
- Webhooks create reports; redirects do not.
- PostgreSQL/Drizzle, BullMQ/Redis, Clerk, Stripe, and Postmark are selected.
- `ENABLE_FLAG_SUMMARY=false` everywhere by default.
- No AI-generated legal/report copy or risk scores.

### Architecture Snapshot

```text
Browser -> Next proxy -> Express company routes -> CompanyService
        -> Companies House + Gazette + insolvency/disqualified officers
        -> normalized preview payload -> clean/adverse/standard UI

Stripe webhook (future) -> idempotent pending report -> BullMQ worker
                        -> entitled providers/snapshots -> frozen delivery
```

Free preview is architecturally isolated from Registry Trust. Ready reports are frozen artifacts. Redis is ephemeral infrastructure; PostgreSQL is durable truth.

---

## Blockers

- No blocker for Feature 12.
- Production requires approved disclaimer wording and Lucky's ICO confirmation.
- Live providers, Stripe, Clerk, Postmark, PDF, and storage require implementation/verification.

### Open Questions

- Final mandatory disclaimer text and approved issue-report address.
- Registry Trust production contract/credentials and exact failure/refund operations.
- PDF rendering and object-storage provider selection.
- Production hosting choices for API/worker/PostgreSQL/Redis.

---

## Known Debt

- `app/page.tsx` is a page-level Client Component with inline product components.
- Preview UI mixes semantic variables with raw Tailwind colours.
- Global CSS needs canonical token consolidation.
- Current page is not yet aligned to Phase A-relevant Figma shell patterns.
- Queue processors are not implemented.
- Live-shaped insolvency endpoint requires production verification.

---

## Verification Baseline

Repository typecheck/lint/test/format, integration normalization tests, API route tests, web checks, and local search/preview smokes previously passed after A11. Run fresh checks after changes; historical results are not substitutes.

### Coverage Tracking

| System | Current state |
| --- | --- |
| Companies House normalization | Covered |
| Gazette normalization | Covered |
| Insolvency/disqualification normalization | Covered |
| Search/free-preview API | Covered |
| Registry Trust free-preview isolation | Covered by current dependency tests; preserve |
| Stripe/webhook/report lifecycle | Not implemented |
| Worker generation/partial/refund | Not implemented |
| Guest/email/PDF/admin/maintenance | Not implemented |

### Environment Variables in Scope

Active configuration includes `APP_URL`, `API_PORT`, `DATABASE_URL`, `REDIS_URL`, `ADMIN_EMAIL`, `ADMIN_ALERT_EMAIL`, Clerk/Stripe/Postmark secrets, provider modes/base URLs/timeouts/credentials, and `ENABLE_FLAG_SUMMARY`. Secrets remain server-only.

---

## Session Notes

- Restored the canonical nine-file InvoiceGuard context system after an accidental template revert.
- Use `build-plan.md` for order.
- Preserve A0-A11 behavior during Feature 12 refactor.
- Start with 12A only; do not seed or wire report products until its verification gate passes.
- Update this tracker and `ui-registry.md` after every feature.
- V1 context is reference material for depth; the canonical nine files remain the only active source of truth.

---

## Maintenance Rules

- Move status only when implementation and checks prove it.
- Record new decisions, blockers, open questions, checks, and debt immediately.
- Do not mark future work complete because contracts/placeholders exist.
- Keep this file operational; durable product/architecture detail belongs in the corresponding context file.
