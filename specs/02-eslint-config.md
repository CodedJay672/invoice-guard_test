# Implementation Spec

This spec defines the next InvoiceGuard infrastructure hardening unit.

## Unit

`packages — setup — shared eslint standardization`

---

## Objective

This unit is responsible for reviewing, standardizing, and enforcing shared ESLint configuration across the existing InvoiceGuard shadcn/Turborepo/npm workspace monorepo.

The repository already has:

- shadcn monorepo foundation
- npm workspaces
- Turborepo
- shared TypeScript configuration inheritance

This unit exists to ensure that:

- linting is consistent across all workspaces
- TypeScript linting rules are standardized
- Next.js linting remains compatible with `apps/web`
- Node.js linting remains compatible with `apps/api` and `apps/worker`
- shared packages inherit a common ESLint baseline
- lint commands work correctly through Turborepo

This unit must only standardize ESLint configuration.

It must NOT implement application logic, business logic, database schemas, queues, services, routes, UI screens, or integration code.

---

## Scope

### Included

This unit includes:

- review existing ESLint configuration files
- standardize shared ESLint config package
- verify ESLint workspace inheritance
- ensure lint scripts exist where required
- align root `npm run lint` behavior with Turborepo
- preserve Next.js lint compatibility for `apps/web`
- support Node.js linting for `apps/api`
- support Node.js linting for `apps/worker`
- support shared package linting
- ensure ESLint works with TypeScript configuration
- verify lint command passes or identify existing non-scope lint issues
- update `context/progress-tracker.md` after completion

---

## Excluded

Do NOT implement:

- Prettier configuration
- TypeScript configuration changes unless required only for ESLint compatibility
- database setup
- Drizzle configuration
- Redis setup
- BullMQ setup
- Express bootstrap
- Clerk authentication
- Stripe integration
- API routes
- frontend pages
- shared utility functions
- validation schemas
- package business contracts
- queue definitions
- integration adapters
- business logic

---

## File Scope

Defines allowed modification boundaries.

### Allowed

```txt
eslint.config.*
.eslintrc.*
/config/eslint/**
/packages/eslint-config/**
/apps/web/eslint.config.*
/apps/api/eslint.config.*
/apps/worker/eslint.config.*
/packages/*/eslint.config.*
/package.json
/apps/*/package.json
/packages/*/package.json
/turbo.json
/context/progress-tracker.md
```

---

### Conditionally Allowed

Only if required to make ESLint resolve existing TypeScript workspace configuration:

```txt
tsconfig.json
tsconfig.*.json
/config/tsconfig/**
/packages/typescript-config/**
/apps/*/tsconfig.json
/packages/*/tsconfig.json
```

Do not change compiler strictness in this unit.

---

### Forbidden

```txt
/apps/**/src/**
/apps/**/app/**
/apps/**/components/**
/packages/**/src/**
/packages/**/schema/**
/packages/**/lib/**
/packages/**/components/**
Any business logic file
Any API route file
Any database schema file
Any queue implementation file
Any integration implementation file
Any frontend feature file
```

---

## Required Configuration Expectations

### Shared ESLint Baseline

A shared ESLint configuration must exist or be standardized for common workspace behavior.

The shared baseline should enforce:

- TypeScript-aware linting
- no unused variables except intentionally ignored names
- no implicit unsafe patterns where practical
- no accidental `any`
- import consistency
- module boundary discipline where feasible
- consistent Node/Browser environment handling per workspace

---

## Workspace-Specific Expectations

### `apps/web`

Must preserve compatibility with:

- Next.js App Router
- React Server Components
- shadcn/ui monorepo imports
- `@workspace/ui` imports
- Tailwind CSS v4
- existing `components.json` behavior

Do NOT break existing Next.js/shadcn configuration.

---

### `apps/api`

Must support:

- Node.js runtime
- Express backend
- TypeScript linting
- backend-only lint rules

---

### `apps/worker`

Must support:

- Node.js runtime
- BullMQ worker runtime
- TypeScript linting
- worker-only lint rules

---

### Shared Packages

Shared packages must support linting for:

```txt
/packages/ui
/packages/db
/packages/types
/packages/validation
/packages/queues
/packages/integrations
/packages/logger
/packages/utils
/packages/typescript-config
```

If `packages/eslint-config` is created or already exists, it must be included in workspace lint behavior.

---

## npm Workspace Rules

This project uses:

```txt
npm
```

Do NOT introduce:

- pnpm
- yarn
- bun

Do NOT create:

```txt
pnpm-workspace.yaml
```

The repository must continue using:

```txt
package-lock.json
```

---

## Standards

- strict linting
- no application logic
- no speculative implementation
- no unrelated file changes
- no dependency changes unless required for ESLint standardization
- preserve shadcn monorepo compatibility
- preserve TypeScript strictness
- preserve npm workspace behavior

---

## Testing Requirements

Required validation:

- `npm run lint` must run through Turborepo
- workspace lint scripts must resolve correctly
- ESLint must detect TypeScript files where relevant
- Next.js/shadcn imports must remain valid
- no business files should be changed to satisfy lint in this unit unless they are generated placeholder files and explicitly within setup scope
- `npm run typecheck` should still pass after ESLint standardization

If lint fails because of pre-existing non-scope application files, document the failure in `context/progress-tracker.md` rather than modifying unrelated implementation files.

---

## Acceptance Criteria

This unit is complete ONLY if:

- shared ESLint configuration is reviewed or established
- workspace ESLint inheritance is standardized
- lint scripts are aligned across applicable workspaces
- `npm run lint` resolves correctly
- `npm run typecheck` still passes
- Next.js web lint compatibility is preserved
- Node API and worker lint compatibility are preserved
- shared package lint compatibility is preserved
- no application logic is modified
- no future roadmap unit is implemented
- no pnpm/yarn/bun files are introduced
- `context/progress-tracker.md` is updated

---

## Progress Tracker Update Required

After completing this unit:

- move `packages — setup — shared eslint standardization` into Completed Units
- set Current Unit to:

```txt
packages — setup — shared prettier configuration
```

- update Next Units queue to keep only the next 3 implementation units
- update App Progress Breakdown
- add session notes describing ESLint configuration decisions
- record architecture decisions if ESLint package structure or inheritance strategy changes
