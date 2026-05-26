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

- Phase 1 — Monorepo Infrastructure Hardening

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
packages — validation — zod validation infrastructure
```

---

# 5. Current Unit Scope Definition

## packages — validation — zod validation infrastructure

### Scope Status

```txt id="9rf7mw"
Not started
```

---

### Included

- Shared validation package review
- Zod validation infrastructure setup
- Package-level typecheck verification
- Validation export structure alignment

---

### Excluded

- Business logic
- Queue setup
- Clerk setup
- Stripe setup
- Express bootstrap
- Frontend implementation
- Drizzle configuration
- Business-domain validation schemas
- Database schemas
- API routes
- Service/repository/controller layers

---

### Completion Checklist

A unit is only complete if all are true:

- [x] Requirements reviewed
- [x] Scope confirmed
- [ ] Validation package reviewed
- [ ] Validation infrastructure implemented
- [ ] Typecheck passes
- [ ] Progress tracker updated

---

# 6. Completed Units

List completed units in order.

## Completed

```txt id="lwmjlwm"
1. packages — setup — monorepo configuration hardening
2. packages — setup — shared tsconfig standardization
3. packages — setup — shared eslint standardization
4. packages — setup — shared prettier configuration
5. packages — types — base shared contracts setup
```

---

# 7. In Progress

Only ONE active unit may exist here.

## Current In Progress

```txt id="gvl2dx"
packages — validation — zod validation infrastructure
```

---

# 8. Next Units (Queue)

Next 3 implementation units only.

1. `packages — validation — zod validation infrastructure`
2. `packages — logger — pino logger infrastructure`
3. `packages — utils — common utilities setup`

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
      ↓
Company Resolution
      ↓
Cache Lookup
      ↓
External Intelligence Aggregation
      ↓
Teaser Report Generation
      ↓
Stripe Checkout
      ↓
Webhook Verification
      ↓
Report Entitlement
      ↓
PDF Generation
      ↓
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
Not started
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

- validation infrastructure
- logger infrastructure
- utils setup
- drizzle setup
- queue infrastructure
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

- Completed `packages — setup — monorepo configuration hardening`.
- npm workspace configuration verified with `npm install`.
- Root scripts standardized for `build`, `dev`, `lint`, `test`, `typecheck`, and `format`.
- Turborepo task resolution verified for `dev` and `build`.
- Root `build`, `lint`, `test`, and `typecheck` pass.
- Shared workspace paths registered for `apps/api`, `apps/worker`, `packages/db`, `packages/types`, `packages/validation`, `packages/queues`, `packages/integrations`, `packages/logger`, and `packages/utils`.
- shadcn UI package exports and workspace imports remain valid.
- `.env.example` added with required Phase A environment variable names.
- `.gitignore` hardened for dependencies, build outputs, caches, logs, and OS files.
- Root README aligned to npm workspace usage.
- Git status required a one-off `safe.directory` override; the checkout currently has many untracked project files and `README.md` as the only tracked diff visible from this sandbox user.
- npm audit currently reports 2 dependency vulnerabilities from the existing dependency tree; no dependency changes were made for this unit.
- Company Search is Phase A implementation priority
- Phase A is monetization-first sequencing, NOT reduced scope
- Invoice enforcement remains part of overall MVP
- Queue infrastructure is foundational
- Stripe is mandatory Phase A infrastructure
- Search aggregation must support caching and stale refresh patterns
- Heavy workflows must remain asynchronous
- Report generation is queue-driven
- Webhook infrastructure is first-class infrastructure
- Modular monolith architecture approved
- Event-driven internal architecture approved
- Worker runtime separated from API runtime
- Phase B systems intentionally deferred to later roadmap units
- Completed `packages - setup - shared tsconfig standardization`.
- Shared TypeScript baseline now explicitly enforces `strict`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `forceConsistentCasingInFileNames`, and `skipLibCheck`.
- Added shared Node.js and package-build TypeScript presets under `packages/typescript-config`.
- Added tsconfig inheritance for `apps/api`, `apps/worker`, and foundation packages without adding application or business logic.
- Converted placeholder typecheck scripts in API, worker, and foundation packages to `tsc --noEmit`.
- Preserved the existing Next.js/shadcn web tsconfig and `@workspace/ui` import paths.
- Verified `npm run typecheck` passes across the workspace.
- Verified `npm run build` passes; existing placeholder build scripts still emit Turbo output warnings.
- Completed `packages - setup - shared eslint standardization`.
- Standardized shared ESLint presets under `packages/eslint-config` with TypeScript-aware linting, explicit `no-explicit-any`, ignored-name handling for intentionally unused identifiers, Turbo environment variable checks, and a direct app-import restriction.
- Added a shared Node.js ESLint preset and workspace `eslint.config.*` inheritance for `apps/api`, `apps/worker`, `packages/db`, `packages/types`, `packages/validation`, `packages/queues`, `packages/integrations`, `packages/logger`, `packages/utils`, `packages/typescript-config`, and `packages/eslint-config`.
- Preserved Next.js App Router lint compatibility for `apps/web` using the ESLint CLI, `@next/eslint-plugin-next`, Core Web Vitals rules, and an App Router-compatible `no-html-link-for-pages` override.
- Replaced placeholder lint scripts with `eslint .` for API, worker, and foundation package workspaces; root `npm run lint` continues to execute through Turborepo.
- Verified `npm run lint -- --force` reaches all 13 lint workspaces; 12 pass and `web` fails only on existing forbidden-scope file `apps/web/app/layout.tsx` for unused `Geist` import.
- Left `apps/web/app/layout.tsx` unchanged because `apps/**/app/**` is forbidden by `specs/02-eslint-config.md`; this lint issue is recorded in Current Blockers.
- Verified `npm run typecheck` passes across the workspace after ESLint standardization.
- Applied shared Prettier baseline in `.prettierrc` with semicolons enabled, double quotes, trailing commas, 100-character print width, 2-space tabs, LF endings, and the existing Tailwind plugin integration preserved.
- Updated `.prettierignore` to exclude generated/dependency outputs required by `specs/03-prettier-setup.md`, including `node_modules`, `.next`, `.turbo`, `dist`, `build`, `coverage`, and `package-lock.json`.
- Standardized root and workspace `format` scripts to `prettier --check .` so validation is non-mutating and cannot rewrite forbidden-scope source files during this unit.
- Verified Prettier configuration discovery from the repository root with `npx.cmd prettier --find-config-path package.json`, which resolved to `.prettierrc`.
- Verified `.prettierignore` excludes `package-lock.json` with `npx.cmd prettier --file-info package-lock.json`, which returned ignored.
- Verified all workspace package manifests expose `format: prettier --check .` through `npm.cmd pkg get scripts --workspaces`.
- Verified representative workspace format behavior with `npm.cmd run format -w @workspace/types`; the command resolves but reports existing formatting in `packages/types/eslint.config.js`, which is outside this unit's allowed edit scope.
- Verified changed configuration and package manifest files pass Prettier with `npx.cmd prettier --check --ignore-unknown ...`.
- `npm.cmd run format` initially resolved correctly but reported existing formatting differences in 48 non-scope files; no forbidden-scope files were formatted during the original scoped Prettier unit.
- `npm.cmd run typecheck` initially failed because existing package `tsconfig.json` files used `"ignoreDeprecations": "6.0"`, which TypeScript rejected; those blockers were cleared after explicit user approval to resolve validation blockers.
- `npm.cmd run lint` passes across all 13 workspaces; the previously documented `apps/web/app/layout.tsx` unused Geist lint blocker is no longer present in the current checkout.
- Completed `packages — setup — shared prettier configuration`.
- Cleared the Prettier blocker by running `npx.cmd prettier --write .` after explicit user approval to resolve full-repo formatting issues outside the original Prettier unit scope.
- Removed invalid `"ignoreDeprecations": "6.0"` compiler options from `apps/web/tsconfig.json` and foundation package `tsconfig.json` files because TypeScript rejected the value during validation.
- Verified `npm.cmd run format` passes across the repository.
- Verified `npm.cmd run typecheck` passes across the workspace.
- Verified `npm.cmd run lint` passes across all 13 lint workspaces after repo-wide formatting.
- Implemented the base `@workspace/types` shared contract structure under `packages/types/src`.
- Added generic common, identifier, timestamp, pagination, and API response/error contracts only; no business-domain contracts were introduced.
- Added `@workspace/types` package exports pointing at `./src/index.ts` and verified Node export resolution resolves to `packages/types/src/index.ts`.
- Used type-only barrel exports with explicit `.js` specifiers to satisfy the workspace NodeNext TypeScript resolution rules.
- Verified `npm.cmd run typecheck -w @workspace/types`, `npm.cmd run lint -w @workspace/types`, and `npm.cmd run format -w @workspace/types` pass.
- Verified full `npm.cmd run typecheck` passes across the workspace.
- Verified full `npm.cmd run lint` passes across all 13 lint workspaces.
- Formatted `specs/04-base-contracts.md` only to clear the shared contracts validation blocker.
- Formatted `fixes/01-fix-formatter.md` after explicit user approval because it also blocked the root format check.
- Verified full `npm.cmd run format` passes across the repository.
- Verified full `npm.cmd run typecheck` passes across the workspace.
- Verified full `npm.cmd run lint` passes across all 13 lint workspaces.
- Completed `packages — types — base shared contracts setup`.
- Advanced current scope to `packages — validation — zod validation infrastructure`.

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
