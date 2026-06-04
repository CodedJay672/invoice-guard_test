# InvoiceGuard Progress Tracker

Update this file after every meaningful implementation change. The tracker must reflect actual implementation state, not planned or assumed progress.

## Current Phase

- Phase A - Company Search and Paid Reports

## Current Goal

- Build Phase A paid MVP incrementally from the verified foundation.

## Current Sprint

- Sprint 1 - Company Search Foundation

## Current Unit

- A5 - Companies House Integration

## Current Status

- Not Started

## Completed Units

- A0 - Product confirmation and implementation baseline
- A1 - Monorepo and environment foundation
- A2 - Database foundation
- A3 - Shared validation, config, and logging foundation
- A4 - Provider integration contracts

## In Progress

- None currently.

## Next Up

1. A5 - Companies House integration
2. A6 - Company search API
3. A7 - Anonymous search rate limiting and search logs
4. A8 - London Gazette integration

## Unit Checklist

### Sprint 0 - Foundation and Baseline

- [x] A0 - Product confirmation and implementation baseline
- [x] A1 - Monorepo and environment foundation
- [x] A2 - Database foundation
- [x] A3 - Shared validation, config, and logging foundation

### Sprint 1 - Company Search Foundation

- [x] A4 - Provider integration contracts
- [ ] A5 - Companies House integration
- [ ] A6 - Company search API
- [ ] A7 - Anonymous search rate limiting and search logs

### Sprint 2 - Free Preview

- [ ] A8 - London Gazette integration
- [ ] A9 - Insolvency and disqualified officers integration
- [ ] A10 - Free preview API
- [ ] A11 - Free preview UI

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

- Completed A4 provider integration contracts.
- Added `ProviderResult<TData>`, normalized provider failure fields, provider names, mock/live provider mode, and `ProviderAdapter<TInput, TData>`.
- Reconciled the baseline scaffold and completed Sprint 0 foundation work.

## Tests / Checks Run

- `npm.cmd run typecheck` - passed.
- `npm.cmd run lint` - passed.
- `$env:DATABASE_URL='postgres://user:pass@localhost:5432/invoiceguard'; npm.cmd run pg:generate` - generated `packages/db/drizzle/0000_loving_stephen_strange.sql`.
- `node --import tsx -e "const mod = await import('./apps/api/src/app.ts'); mod.createApiApp(); console.log('api app created')"` - passed.
- `node --import tsx apps/worker/src/index.ts` - passed.
- `npm.cmd run typecheck` after A4 - passed.
- `npm.cmd run format` after A4 - passed.

## Session Notes

- Use `context/sprint-roadmap.md` as the source of truth for implementation order.
- Use this tracker to choose the next implementation unit.
- Next implementation should start with A5 Companies House integration.
