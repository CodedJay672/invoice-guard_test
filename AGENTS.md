<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# InvoiceGuard Engineering Execution Rules

## Application Building Context

Read the following files in order before implementing or making any architectural decision:

1. `context/project-overview.md` — business model, product definition, revenue model, features, and implementation phases
2. `context/architecture-context.md` — system architecture, domain boundaries, queue design, storage model, workflow orchestration, and infrastructure rules
3. `context/ui-context.md` — design system, typography, color system, dashboard structure, report UI patterns, and component conventions
4. `context/code-standards.md` — implementation conventions, naming rules, architectural boundaries, and backend/frontend standards
5. `context/ai-workflow-rules.md` — AI execution discipline, development workflow, scoping rules, and delivery expectations
6. `context/execution-roadmap.md` — implementation ordering, phase sequencing, and strict unit scoping
7. `context/progress-tracker.md` — current implementation state, active unit, completed units, blockers, and next tasks

Always follow:

- `context/ai-workflow-rules.md`
- `context/code-standards.md`

strictly.

Treat `context/execution-roadmap.md` as the ONLY source of implementation order.

Never implement outside the current scoped unit.

Update `context/progress-tracker.md` after every meaningful implementation change.

If implementation changes:

- architecture
- workflow structure
- implementation standards
- infrastructure assumptions
- domain boundaries

then update the relevant context file BEFORE continuing implementation.

---

# Execution Rules

- Only work on ONE roadmap unit at a time.
- Never implement beyond the current roadmap unit.
- Follow the exact ordering in `context/execution-roadmap.md`.
- Never skip units.
- Never merge unrelated implementation units.
- Never implement speculative future functionality.
- Never implement future phases early.

Phase A and Phase B are intentionally separated.

Do not implement:

- invoice enforcement workflows
- accounting integrations
- OCR ingestion
- demand letter systems
- response portals

while scoped Phase A units are active unless explicitly required by roadmap sequencing.

---

# Implementation Workflow

Implement backend systems incrementally in this order:

1. Validation/schema
2. Shared types/contracts
3. Database models
4. Repository layer
5. Queue definitions
6. Service layer
7. Worker processors
8. Controller layer
9. Routes
10. Tests
11. Frontend integration (separate scoped unit)

Do not skip layers.

Do not combine layers into single implementation units.

---

# Scope Discipline

- Do not modify files outside current unit scope.
- Do not refactor unrelated systems.
- Do not introduce new architectural patterns without approval.
- Do not introduce new dependencies without approval.
- Do not invent product behavior outside documented context files.
- Do not create alternative implementations when a standard pattern already exists.

If requirements are ambiguous:

- stop implementation
- ask questions first

Never guess business logic.

---

# Architecture Enforcement

InvoiceGuard is a modular monolith with event-driven internals.

Maintain strict architectural boundaries.

## Backend Rules

- Controllers must NEVER access the database directly.
- Controllers must NEVER contain business logic.
- Business logic belongs ONLY in services.
- Database access belongs ONLY in repositories.
- Queue orchestration belongs ONLY in workers/services.
- External integrations must be isolated behind adapter layers.
- Shared contracts belong ONLY in `/packages/types`.
- Validation schemas belong ONLY in `/packages/validation`.

---

# Queue & Event Rules

InvoiceGuard is heavily asynchronous.

All long-running or retryable workflows MUST use queues.

Examples:

- report generation
- email delivery
- webhook processing
- API synchronization
- OCR processing
- interest recalculation
- notification dispatch

Never process heavy async workflows directly inside controllers.

All workers must:

- be idempotent
- support retries
- log failures
- emit structured events

---

# Webhook Rules

Webhook endpoints must:

- verify signatures
- respond quickly
- enqueue processing jobs
- avoid inline heavy processing

Webhook events must be idempotent.

Duplicate webhook delivery must never corrupt state.

---

# Database Rules

PostgreSQL is the ONLY approved primary database.

Do not introduce:

- MongoDB
- Firebase
- document database patterns

without explicit approval.

Financial and workflow events should be append-only where applicable.

Avoid destructive updates for:

- payment events
- report generation events
- delivery logs
- workflow state transitions

---

# Frontend Rules

- Default to React Server Components.
- Use `"use client"` only when required.
- Prefer server-side data fetching.
- Avoid unnecessary client state.
- Use server actions where appropriate.
- Keep UI consistent with documented dashboard and report patterns.

---

# Search & Intelligence Rules

The company search and intelligence platform is Phase A priority.

Treat:

- search
- intelligence aggregation
- report generation
- paywall gating
- Stripe integration

as first-class production systems.

Caching and API normalization are mandatory.

Never aggregate multiple external APIs synchronously on every request without caching strategy.

---

# Stripe & Payment Rules

Stripe is authoritative for payment verification.

Never trust frontend payment success states.

All payment confirmation must be validated through:

- Stripe webhooks
- server-side verification

Premium report access must always be entitlement-driven.

---

# Testing Rules

Tests are required for every completed unit where applicable.

Required testing layers:

- unit tests
- integration tests
- queue processing tests
- webhook tests
- API tests

Critical workflows must have integration coverage.

A unit is NOT complete if:

- tests fail
- required tests are missing
- queue flows are unverified
- webhook flows are unverified

---

# Observability Rules

All critical systems must support observability.

Required:

- structured logging
- error tracking
- queue monitoring
- retry visibility

Never swallow errors silently.

All async failures must be logged with context.

---

# Progress Tracking

After completing a unit:

- update `context/progress-tracker.md`
- mark completed work accurately
- update active implementation unit
- document blockers or architecture changes

Progress tracking must always reflect REAL implementation state.

Never mark speculative work as completed.

---

# AI Behavioral Constraints

- Reuse existing patterns whenever possible.
- Maintain consistency across apps and packages.
- Do not introduce parallel architectural styles.
- Prefer extension of existing systems over invention of new systems.
- Preserve architectural cohesion across all modules.

Prioritize:

- maintainability
- consistency
- reliability
- deterministic workflows
- production-grade engineering discipline

over rapid but unstable implementation.
