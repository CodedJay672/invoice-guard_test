# InvoiceGuard Progress Tracker

Update this file after every meaningful implementation change. The tracker must reflect actual implementation state, not planned or assumed progress.

## Current Phase

- Phase A - Company Search and Paid Reports

## Current Goal

- Build Phase A paid MVP incrementally from the verified foundation.

## Current Sprint

- Sprint 3 - Report Products and Payments

## Current Unit

- A12 - Report products and tier configuration

## Current Status

- Not Started

## Completed Units

- A0 - Product confirmation and implementation baseline
- A1 - Monorepo and environment foundation
- A2 - Database foundation
- A3 - Shared validation, config, and logging foundation
- A4 - Provider integration contracts
- A5 - Companies House integration
- A6 - Company search API
- A7 - Anonymous search rate limiting and search logs
- A8 - London Gazette integration
- A9 - Insolvency and disqualified officers integration
- A10 - Free preview API
- A11 - Free preview UI

## In Progress

- None currently.

## Next Up

1. A12 - Report products and tier configuration
2. A13 - Stripe one-off checkout
3. A14 - Stripe webhook and idempotency
4. A15 - Purchased report creation and pending lifecycle

## Unit Checklist

### Sprint 0 - Foundation and Baseline

- [x] A0 - Product confirmation and implementation baseline
- [x] A1 - Monorepo and environment foundation
- [x] A2 - Database foundation
- [x] A3 - Shared validation, config, and logging foundation

### Sprint 1 - Company Search Foundation

- [x] A4 - Provider integration contracts
- [x] A5 - Companies House integration
- [x] A6 - Company search API
- [x] A7 - Anonymous search rate limiting and search logs

### Sprint 2 - Free Preview

- [x] A8 - London Gazette integration
- [x] A9 - Insolvency and disqualified officers integration
- [x] A10 - Free preview API
- [x] A11 - Free preview UI

### Sprint 3 - Report Products and Payments

- [ ] A12 - Report products and tier configuration
- [ ] A13 - Stripe one-off checkout
- [ ] A14 - Stripe webhook and idempotency
- [ ] A15 - Purchased report creation and pending lifecycle

### Sprint 4 - Paid Report Generation

- [ ] A16 - Paid report generation queue
- [ ] A17 - Registry Trust paid-only integration boundary
- [ ] A18 - Paid report provider orchestration
- [ ] A19 - Report data snapshot storage

### Sprint 5 - Report Delivery and Guest Access

- [ ] A20 - Report delivery page
- [ ] A21 - Guest report secure access links
- [ ] A22 - Email delivery foundation

### Sprint 6 - PDF, Compliance, and Templates

- [ ] A23 - Premium PDF generation
- [ ] A24 - Mandatory disclaimer and report issue link
- [ ] A25 - Master Copy Template engine behind feature flag
- [ ] A26 - Fair Payment Code scraper for Premium reports

### Sprint 7 - Admin and Operations

- [ ] A27 - Admin dashboard foundation
- [ ] A28 - Admin refund tool
- [ ] A29 - Provider failure and admin alerting
- [ ] A30 - Phase A analytics and conversion tracking

### Sprint 8 - Maintenance, QA, and Launch Readiness

- [ ] A31 - Search log IP anonymisation job
- [ ] A32 - Guest report expiry job
- [ ] A33 - Stuck report detection job
- [ ] A34 - QA, UAT, and production readiness

## Open Questions

- Mandatory legal disclaimer text is not yet supplied. Production launch remains blocked until Lucky provides approved wording.
- ICO registration is not yet confirmed. Production launch remains blocked until Lucky confirms registration.

## Architecture Decisions

- Phase A is company search and paid reports only.
- Invoice chasing is Phase F and must not be implemented in Phase A.
- Phase B-E are gated until Phase A reaches at least 30 real paid transactions.
- Companies House number is the canonical company identity.
- Registry Trust is never called before Stripe payment confirmation.
- Stripe webhooks create paid reports; frontend redirects do not.
- PostgreSQL is the only approved core database.
- Drizzle ORM is the selected typed ORM for this codebase.
- BullMQ handles background jobs.
- Postmark is the Phase A transactional email provider.
- Provider development is mock-first; live adapters are added behind the same contracts when credentials are ready.
- `ENABLE_FLAG_SUMMARY` defaults to false in all environments.
- Mandatory report disclaimer appears on every paid report and PDF from day one once approved wording is supplied.
- Admin access is allowlisted by `ADMIN_EMAIL`.

## Current Blockers

- None for the current implementation unit.

## Last Completed Work

- Completed A11 free preview UI.
- Completed A10 free preview API.
- Completed A8 London Gazette integration.
- Completed A9 insolvency and disqualified officers integration.
- Replaced the starter web page with company search, selectable results, clean/adverse free preview rendering, Court Records prompt, curiosity cards, and report tier cards.
- Added Next.js same-origin proxy routes for company search and free preview API access.
- Added InvoiceGuard brand colour custom properties to the shared UI globals.
- Added `GET /companies/:companyNumber/free-preview` with Companies House, insolvency/disqualified officers, and London Gazette provider checks only.
- Added free preview payload assembly for clean, adverse, and standard paths with Court Records prompt and tier cards.
- Completed A4 provider integration contracts.
- Completed A5 Companies House integration.
- Completed A6 Company search API.
- Completed A7 anonymous search rate limiting and search logs.
- Added mock-first and live-shaped London Gazette clients with normalized strike-off and winding-up flags.
- Added mock-first and live-shaped insolvency/disqualified officers clients with normalized insolvency and director disqualification flags.
- Added mock-first and live Companies House clients behind shared provider contracts.
- Added Companies House config defaults, normalized search/profile/officer-count responses, and filing/charges fetch foundations.
- Added `GET /companies/search?q=` and `GET /companies/:companyNumber` routes with validated inputs and safe provider errors.
- Added Redis-backed anonymous search limiting with in-memory local/test fallback and hashed IP search logging.

## Tests / Checks Run

- `npm.cmd run typecheck` - passed.
- `npm.cmd run lint` - passed.
- `$env:DATABASE_URL='postgres://user:pass@localhost:5432/invoiceguard'; npm.cmd run pg:generate` - generated `packages/db/drizzle/0000_loving_stephen_strange.sql`.
- `node --import tsx -e "const mod = await import('./apps/api/src/app.ts'); mod.createApiApp(); console.log('api app created')"` - passed.
- `node --import tsx apps/worker/src/index.ts` - passed.
- `npm.cmd run typecheck` after A4 - passed.
- `npm.cmd run format` after A4 - passed.
- `npm.cmd run typecheck -w @workspace/integrations` after A5 - passed.
- `npm.cmd run lint -w @workspace/integrations` after A5 - passed.
- `npm.cmd run test -w @workspace/integrations` after A5 - passed.
- `npm.cmd run typecheck -w api` after A6 - passed.
- `npm.cmd run lint -w api` after A6 - passed.
- `npm.cmd run test -w api` after A6 - passed.
- `npm.cmd run typecheck -w api` after A7 - passed.
- `npm.cmd run lint -w api` after A7 - passed.
- `npm.cmd run test -w api` after A7 - passed.
- `npm.cmd run typecheck` after Sprint 1 - passed.
- `npm.cmd run lint` after Sprint 1 - passed.
- `npm.cmd run test` after Sprint 1 - passed.
- `npm.cmd run format` after Sprint 1 - passed.
- `npm.cmd run typecheck -w @workspace/integrations` after A8/A9 - passed.
- `npm.cmd run test -w @workspace/integrations` after A8/A9 - passed.
- `npm.cmd run typecheck -w api` after A10 - passed.
- `npm.cmd run test -w api` after A10 - passed.
- `npm.cmd run typecheck -w web` after A11 - passed.
- `npm.cmd run lint -w web` after A11 - passed.
- `npm.cmd run typecheck` after Sprint 2 - passed.
- `npm.cmd run lint` after Sprint 2 - passed.
- `npm.cmd run test` after Sprint 2 - passed.
- `npm.cmd run format` after Sprint 2 - passed.
- Local smoke: `http://localhost:4000/health` returned ok.
- Local smoke: `http://localhost:3000` returned 200 and contained `InvoiceGuard`.
- Local smoke: `http://localhost:3000/api/companies/search?q=acme` returned ACME search results.
- Local smoke: `http://localhost:3000/api/companies/12345678/free-preview` returned clean-path preview data.
- Local smoke: `http://localhost:3000/api/companies/87654321/free-preview` returned adverse-path preview data.

## Session Notes

- Use `context/sprint-roadmap.md` as the source of truth for implementation order.
- Use this tracker to choose the next implementation unit.
- A5 was implemented mock-first so company search can be verified without live Companies House credentials.
- A6 introduced injectable API dependencies so route tests can run without a live PostgreSQL instance.
- A7 uses Redis when `REDIS_URL` is configured and an in-memory limiter only for local/test operation.
- Sprint 1 is complete; company identity resolution is now available through API routes and remains Companies House number-led.
- Sprint 2 provider integrations are mock-first and expose deterministic clean/adverse fixtures for free preview verification.
- Free preview API tests prove the route calls only the three approved provider clients and does not include Registry Trust.
- Browser plugin verification was attempted, but no in-app browser backend was available in this session.
- Sprint 2 is complete; next implementation should start with A12 report products and tier configuration.
