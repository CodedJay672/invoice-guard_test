# Progress Tracker

This file is the single source of truth for InvoiceGuard implementation state.

It must ALWAYS reflect:

- actual implementation state
- current execution scope
- architecture decisions
- roadmap alignment

Never track speculative or assumed progress.

Update this file after every completed implementation unit.

---

# 1. Current Phase

**Current Phase:**

- Phase 1 â€” Monorepo Infrastructure Hardening

---

# 2. Current App in Focus

**Current App:**

- packages

---

# 3. Current Git Branch

**Current Branch:**

```txt id="q7m1wp"
chore/monorepo-foundation
```

---

# 4. Current Unit of Work

**Current Unit:**

```txt id="v3ht2l"
packages â€” integrations â€” integration package foundation
```

---

# 5. Current Unit Scope Definition

## packages â€” integrations â€” integration package foundation

### Scope Status

```txt id="9rf7mw"
Not started
```

---

### Included

- Shared integrations package review
- Integration package foundation setup
- Export structure alignment
- Package-level typecheck verification

---

### Excluded

- Business logic
- Database schema setup
- Clerk setup
- Stripe setup
- Express bootstrap
- Frontend implementation
- Business-domain logging workflows
- Business-domain integration adapters
- API routes
- Service/repository/controller layers
- Logger infrastructure changes

---

### Completion Checklist

A unit is only complete if all are true:

- [ ] Requirements reviewed
- [ ] Scope confirmed
- [ ] Integrations package reviewed
- [ ] Integration package foundation implemented
- [ ] Typecheck passes
- [ ] Progress tracker updated

---

# 6. Completed Units

List completed units in order.

## Completed

```txt id="lwmjlwm"
1. packages â€” setup â€” monorepo configuration hardening
2. packages â€” setup â€” shared tsconfig standardization
3. packages â€” setup â€” shared eslint standardization
4. packages â€” setup â€” shared prettier configuration
5. packages â€” types â€” base shared contracts setup
6. packages â€” validation â€” zod validation infrastructure
7. packages â€” logger â€” pino logger infrastructure
8. packages â€” utils â€” common utilities setup
9. packages â€” db â€” drizzle setup + postgres connection
10. packages â€” queues â€” BullMQ queue infrastructure
```

---

# 7. In Progress

Only ONE active unit may exist here.

## Current In Progress

```txt id="gvl2dx"
packages â€” integrations â€” integration package foundation
```

---

# 8. Next Units (Queue)

Next 3 implementation units only.

1. `packages â€” integrations â€” integration package foundation`
2. `api â€” setup â€” express bootstrap`
3. `api â€” setup â€” async wrapper + global error middleware`

---

# 9. Blockers

## Current Blockers

```txt id="3t5t7f"
None
```

---

# 10. Open Questions

Questions requiring architectural clarification before implementation.

## Current Open Questions

```txt id="l0wwti"
Should report purchases be organization-scoped or user-scoped?
```

---

# 11. System Invariants

These rules must NEVER be violated.

- Controllers never access database directly
- Services contain business logic only
- Repositories own persistence logic only
- Validation executes before controller logic
- Shared validation lives in `packages/validation`
- Shared types live in `packages/types`
- Shared queues live in `packages/queues`
- Heavy async workflows must use BullMQ
- Webhooks must verify signatures
- Stripe is authoritative for payment verification
- Queue jobs must be idempotent
- Frontend apps consume shared packages only
- Only ONE implementation unit may be active at a time
- Phase B systems must not be implemented during active Phase A scope

---

# 12. Phase A Architecture Snapshot

## Company Search Flow

```txt id="1x76pf"
User Search
      â†“
Company Resolution
      â†“
Cache Lookup
      â†“
External Intelligence Aggregation
      â†“
Teaser Report Generation
      â†“
Stripe Checkout
      â†“
Webhook Verification
      â†“
Report Entitlement
      â†“
PDF Generation
      â†“
Email Delivery
```

---

## Search Data Sources

Current planned integrations:

- Companies House API
- Registry Trust API
- Insolvency Service API
- London Gazette API
- Fair Payment Code Register

---

## Report Tiers

### Basic

- limited intelligence visibility

### Standard

- expanded insights

### Premium

- full report
- PDF export
- email delivery

---

## Payment Strategy

### Stripe Checkout

- server-generated checkout sessions
- webhook-based verification
- entitlement-driven access control

---

## Queue Strategy

Heavy workflows handled asynchronously:

- report generation
- PDF rendering
- email delivery
- webhook processing
- cache refresh jobs

---

# 13. Architecture Decisions (Log)

## Decision: Architecture Style

### Decision

InvoiceGuard will use:

```txt id="e0o6po"
Modular Monolith + Event-Driven Internals
```

---

### Reason

Supports:

- maintainability
- queue-driven workflows
- scalable async processing
- implementation simplicity

without premature microservices complexity.

---

### Impact

All future systems must:

- preserve module isolation
- preserve queue orchestration patterns
- preserve centralized persistence architecture

---

## Decision: Queue Infrastructure

### Decision

Async workflows will use:

```txt id="mjlwm5"
BullMQ + Redis
```

---

### Reason

Supports:

- retries
- delayed jobs
- workflow orchestration
- queue monitoring
- event-driven processing

---

### Impact

Heavy workflows must NEVER execute inline inside controllers.

---

## Decision: Authentication Provider

### Decision

Authentication handled using:

```txt id="7f91i6"
Clerk
```

---

### Reason

Reduces:

- auth complexity
- credential management burden
- OAuth implementation overhead

while improving security and implementation speed.

---

### Impact

Backend auth middleware must validate Clerk sessions consistently.

---

## Decision: Payment Provider

### Decision

Payments handled using:

```txt id="4lzk7u"
Stripe
```

---

### Reason

Supports:

- checkout sessions
- webhooks
- entitlement workflows
- subscription expansion later

---

### Impact

Stripe webhook infrastructure becomes mandatory.

---

## Decision: TypeScript Configuration Inheritance

### Decision

InvoiceGuard workspaces inherit shared TypeScript baselines from:

```txt id="tsconfig-inheritance"
@workspace/typescript-config
```

---

### Reason

Centralized TypeScript presets keep strict compiler behavior consistent across apps and packages while preserving Next.js-specific and Node.js-specific runtime settings.

---

### Impact

All future app and package workspaces must extend the shared TypeScript presets unless a roadmap unit explicitly approves a different configuration.

---

## Decision: ESLint Configuration Inheritance

### Decision

InvoiceGuard workspaces inherit shared ESLint baselines from:

```txt id="eslint-inheritance"
@workspace/eslint-config
```

The shared package exposes separate presets for:

```txt id="eslint-presets"
base
node
next-js
react-internal
```

---

### Reason

Centralized ESLint presets keep TypeScript-aware linting, unused variable handling, no-explicit-any enforcement, Turbo environment checks, React rules, Next.js rules, and Node.js globals consistent across apps and packages.

---

### Impact

All future app and package workspaces must use the shared ESLint package unless a roadmap unit explicitly approves a different linting strategy. Next.js linting must continue to run through the ESLint CLI because Next.js 16 removed `next lint`.

---

## Decision: Prettier Configuration Strategy

### Decision

InvoiceGuard uses a root `.prettierrc` as the shared Prettier configuration source for all workspaces.

Workspace `format` scripts use:

```txt id="prettier-check-script"
prettier --check .
```

---

### Reason

A root Prettier config keeps formatting rules consistent across TypeScript, TSX, JSON, Markdown, CSS, and configuration files while check-only scripts avoid mutating forbidden-scope source files during infrastructure verification units.

---

### Impact

Future workspace packages should inherit root Prettier behavior and expose a non-mutating `format` check unless a later roadmap unit explicitly approves a separate write-format workflow.

---

## Decision: Validation Package Export and Dependency Strategy

### Decision

The shared validation package is exported as:

```txt id="validation-export"
@workspace/validation -> ./src/index.ts
```

The package owns a direct dependency on:

```txt id="validation-dependency"
zod
```

---

### Reason

Validation schemas and parsing helpers need a single reusable source of truth that can be consumed by apps and shared packages without coupling to Express, Next.js, databases, queues, or integrations.

---

### Impact

Future validation schemas must be added through `packages/validation` when their roadmap unit is active, use Zod, and preserve NodeNext-compatible `.js` export specifiers in source barrels.

---

## Decision: Logger Package Export and Dependency Strategy

### Decision

The shared logger package is exported as:

```txt id="logger-export"
@workspace/logger -> ./src/index.ts
```

The package owns a direct dependency on:

```txt id="logger-dependency"
pino
```

---

### Reason

Pino provides structured JSON logging for API, worker, and shared package runtimes through one reusable logger package without coupling logging infrastructure to Express, BullMQ, databases, or business-domain modules.

---

### Impact

Future runtime logging must consume `@workspace/logger`, preserve generic logger context as the base contract, avoid logging sensitive data, and keep request, queue, webhook, and business-event wiring inside their later scoped roadmap units.

---

## Decision: Database Package Export and Dependency Strategy

### Decision

The shared database package is exported as:

```txt id="db-export"
@workspace/db -> ./src/index.ts
@workspace/db/schema -> ./src/schema/index.ts
```

The package owns direct dependencies on:

```txt id="db-dependencies"
drizzle-orm
postgres
```

Drizzle migrations are configured from the repository root through:

```txt id="drizzle-config"
drizzle.config.ts
```

---

### Reason

Centralized database infrastructure gives API, worker, and future repository layers one PostgreSQL and Drizzle connection foundation without introducing business-domain schemas during infrastructure setup.

---

### Impact

Future database schemas must be introduced only by scoped roadmap units through `packages/db/src/schema/index.ts` exports. Repositories must consume `@workspace/db` rather than creating independent database clients.

---

## Decision: Queue Package Export and Dependency Strategy

### Decision

The shared queue package is exported as:

```txt id="queues-export"
@workspace/queues -> ./src/index.ts
```

The package owns direct dependencies on:

```txt id="queues-dependencies"
bullmq
ioredis
```

Generic queue creation uses BullMQ `Queue` instances with centralized Redis connection creation and production-safe default job options.

---

### Reason

Centralized queue infrastructure gives API and worker runtimes one reusable BullMQ foundation without introducing business-domain queues, workers, processors, or payload contracts during the infrastructure setup unit.

---

### Impact

Future queue units must define business queue names and payload contracts only when their roadmap unit is active, consume `@workspace/queues`, preserve NodeNext-compatible `.js` export specifiers, and avoid creating workers or processors inside the shared queue factory.

---

# 14. Repository Conventions

- Repositories return raw persistence data only
- Repositories never contain business logic
- Repositories never throw HTTP errors
- Services orchestrate repositories
- Controllers map HTTP requests to services
- Validation must happen before controller execution
- Queue dispatching belongs in services/workers only

---

# 15. Environment Variables In Use

## Active Environment Variables

```txt id="krmj4z"
DATABASE_URL
REDIS_URL
CLERK_SECRET_KEY
CLERK_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
POSTMARK_API_KEY
APP_URL
NODE_ENV
```

---

# 16. Deferred Systems

These systems are intentionally deferred until active roadmap scope requires them.

## Deferred Until Phase B

- Xero integration
- QuickBooks integration
- OCR processing
- invoice ingestion
- demand letters
- dispute workflows
- response portal
- Twilio SMS workflows
- payment confirmation workflows

---

## Deferred Beyond MVP

- AI-generated legal letters
- predictive payment scoring
- ML risk analysis
- mobile applications
- multi-region deployments
- multi-language support

---

# 17. Test Coverage Tracking

## Phase A Systems

### Company Search

#### Status

```txt id="5e4x1d"
Not started
```

---

### Stripe Integration

#### Status

```txt id="mwlvm0"
Not started
```

---

### Report Generation

#### Status

```txt id="q79jlwm"
Not started
```

---

### Email Delivery

#### Status

```txt id="7gjlwm"
Not started
```

---

### Queue Infrastructure

#### Status

```txt id="0jlwm1"
Foundation complete
```

---

## Phase B Systems

### Invoice Ingestion

#### Status

```txt id="jjlwm9"
Deferred
```

---

### Demand Letters

#### Status

```txt id="ljlwm2"
Deferred
```

---

### OCR Processing

#### Status

```txt id="fjlwm8"
Deferred
```

---

# 18. App Progress Breakdown

## Packages

### Status

```txt id="wlvm9v"
In progress
```

### Remaining Core Units

- integrations foundation

---

## API

### Status

```txt id="vlq8e7"
Not started
```

### Remaining Core Units

- express bootstrap
- security middleware
- Clerk integration
- Stripe integration
- company search modules
- report infrastructure
- webhook infrastructure

---

## Worker

### Status

```txt id="yjlwm4"
Not started
```

### Remaining Core Units

- BullMQ setup
- queue processors
- report workers
- PDF generation workers
- email delivery workers

---

## Web Frontend

### Status

```txt id="2jlwm7"
Not started
```

### Remaining Core Units

- application shell
- public landing pages
- company search UI
- report pages
- Stripe checkout flow
- dashboard foundation

---

# 19. Session Notes

- Completed `packages — queues — BullMQ queue infrastructure`.
- Implemented `@workspace/queues` infrastructure under `packages/queues/src` with `connection.ts`, `queue.ts`, `names.ts`, `options.ts`, and `index.ts`.
- Added centralized `REDIS_URL` lookup and lazy BullMQ Redis connection creation using `ioredis`; no Redis connection is created at module import time.
- Added generic BullMQ queue factory helpers with no business-domain queue names, payload contracts, processors, workers, routes, services, repositories, or runtime wiring.
- Added generic queue naming infrastructure with `QUEUE_NAMES` intentionally empty until scoped business queue units are active.
- Added production-safe generic default job options for attempts, exponential backoff, and completed/failed job cleanup.
- Added `@workspace/queues` package exports pointing at `./src/index.ts` and verified Node export resolution resolves to `packages/queues/src/index.ts`.
- Added approved queue dependencies `bullmq` and `ioredis` to `@workspace/queues`, with `ioredis` aligned to BullMQ's bundled client version for TypeScript compatibility.
- Verified `npm.cmd run typecheck -w @workspace/queues`, `npm.cmd run lint -w @workspace/queues`, and `npm.cmd run format -w @workspace/queues` pass.
- Verified full `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run format` pass across the workspace.
- Verified `packages/queues` has no imports from apps, database, validation, integrations, logger, utils, or UI packages.
- Advanced current scope to `packages — integrations — integration package foundation`.

---
# 20. Rules For Maintaining This File

- Must be updated after every completed unit
- Must reflect REAL implementation state
- Only one active unit at a time
- Do not leave stale entries
- Do not carry outdated queue items
- Keep architecture snapshots synchronized with implementation
- Keep deferred systems synchronized with roadmap sequencing

---

# 21. Final Definition

A structured execution log tracking InvoiceGuard implementation state, roadmap sequencing, architecture decisions, queue infrastructure evolution, system invariants, testing coverage, and phased execution progress for disciplined AI-assisted production-grade system development.
