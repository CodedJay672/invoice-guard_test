# Implementation Spec

This spec defines the first InvoiceGuard infrastructure hardening unit.

## Unit

`packages — setup — monorepo configuration hardening`

---

## Objective

This unit is responsible for standardizing and hardening the existing shadcn monorepo foundation for InvoiceGuard architectural requirements.

The repository is already initialized using:

- shadcn/ui monorepo structure
- Turborepo
- npm workspaces

This unit exists to:

- align workspace configuration
- standardize repository conventions
- prepare shared package infrastructure
- validate workspace integrity
- establish repository-wide engineering consistency

This unit does NOT create the monorepo from scratch.

---

## Scope

### Included

This unit includes:

- root workspace configuration review
- npm workspace verification
- Turborepo pipeline verification
- root script standardization
- root `.gitignore` hardening
- root `.env.example` setup
- shared repository conventions
- workspace naming verification
- package namespace standardization
- shadcn workspace alignment verification
- shared package path verification
- repository metadata cleanup
- root README alignment updates if necessary

---

### Excluded

Do NOT implement:

- Express bootstrap
- database setup
- Redis setup
- BullMQ setup
- frontend pages
- authentication
- Stripe integration
- API routes
- business logic
- validation schemas
- shared utilities
- Drizzle schemas
- queue implementations

---

## File Scope

### Allowed

```txt
/
package.json
turbo.json
.gitignore
.env.example
README.md
/apps/**
/packages/**
/config/**
```

---

### Forbidden

```txt
Business logic implementation
API route implementation
Database schema implementation
Authentication implementation
Stripe implementation
Queue processors
Worker logic
Frontend application logic
```

---

## Required Verification

The following infrastructure must be verified and standardized:

### npm Workspaces

Workspace configuration must exist inside:

```json
package.json
```

---

### Turborepo

The repository must contain:

```txt
turbo.json
```

with valid pipelines for:

- dev
- build
- lint
- test
- typecheck

---

### shadcn Monorepo Alignment

The repository must remain compatible with:

- shadcn monorepo CLI behavior
- shared workspace component installation
- shared UI package exports

---

### Shared Workspace Expectations

The repository must support:

```txt
/apps/web
/apps/api
/apps/worker

/packages/ui
/packages/db
/packages/types
/packages/validation
/packages/queues
/packages/integrations
/packages/logger
/packages/utils
```

---

## Standards

- npm workspaces only
- strict TypeScript compatibility
- no product logic
- no speculative implementation
- no unnecessary dependencies
- workspace-first architecture
- shadcn monorepo compatibility preserved

---

## Testing Requirements

Required validation:

- workspace installs successfully
- turbo commands resolve correctly
- npm workspace resolution works
- package references resolve correctly
- shadcn component imports remain valid
- root scripts execute correctly

---

## Acceptance Criteria

This unit is complete ONLY if:

- workspace configuration is validated
- Turborepo configuration is validated
- npm workspace configuration is correct
- repository conventions are standardized
- root scripts are standardized
- `.env.example` exists
- `.gitignore` is hardened
- shared package structure is verified
- shadcn monorepo compatibility is preserved
- no application logic is implemented
- no future roadmap units are implemented
- workspace commands resolve correctly
- progress tracker updated

---

## Progress Tracker Update Required

After completing this unit:

- move `packages — setup — monorepo configuration hardening` into Completed Units
- set next unit to:

```txt
packages — setup — shared tsconfig standardization
```

- update architecture decisions if infrastructure conventions changed
