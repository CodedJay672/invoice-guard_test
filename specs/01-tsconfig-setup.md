# Implementation Spec

This spec defines the next implementation unit for standardizing shared TypeScript configuration across the InvoiceGuard monorepo.

## Unit

`packages — setup — shared tsconfig standardization`

---

## Objective

This unit is responsible for reviewing, standardizing, and enforcing shared TypeScript configuration across the existing shadcn/Turborepo/npm workspace monorepo.

The repository has already been initialized and the monorepo foundation has already been hardened.

This unit exists to ensure that:

- TypeScript configuration is consistent across all workspaces
- strict TypeScript rules are enforced
- shared package builds inherit a common baseline
- app-level TypeScript configurations remain compatible with their runtime targets
- frontend, API, worker, and package workspaces can typecheck reliably

This unit must only standardize TypeScript configuration.

It must NOT implement application logic, business logic, database schemas, queues, services, routes, UI screens, or integration code.

---

## Scope

### Included

This unit includes:

- review existing TypeScript configuration files
- standardize shared base TypeScript config
- verify strict compiler options
- ensure app-level TypeScript configs extend shared config where appropriate
- ensure package-level TypeScript configs extend shared config where appropriate
- preserve Next.js-specific TypeScript requirements for `apps/web`
- preserve Node.js-specific TypeScript requirements for `apps/api` and `apps/worker`
- ensure shared package configs support declarations where needed
- verify path/import compatibility with the existing shadcn monorepo setup
- ensure `npm run typecheck` resolves successfully
- update `context/progress-tracker.md` after completion

---

## Excluded

Do NOT implement:

- ESLint configuration
- Prettier configuration
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

---

## File Scope

Defines allowed modification boundaries.

### Allowed

```txt
tsconfig.json
tsconfig.*.json
/config/tsconfig/**
/apps/web/tsconfig.json
/apps/api/tsconfig.json
/apps/worker/tsconfig.json
/packages/typescript-config/**
/package.json
/turbo.json
/context/progress-tracker.md
```

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
```

---

## Required Configuration Expectations

### Root TypeScript Baseline

A shared base configuration must exist or be standardized for common compiler behavior.

Expected baseline rules:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

---

### App-Specific Configuration

Each app may have runtime-specific configuration.

#### `apps/web`

Must preserve compatibility with:

- Next.js App Router
- React Server Components
- shadcn/ui monorepo imports
- Tailwind CSS v4
- `@workspace/ui` imports

Do NOT break existing Next.js-generated configuration.

---

#### `apps/api`

Must support:

- Node.js runtime
- Express backend
- TypeScript strict mode
- module resolution compatible with current package setup

---

#### `apps/worker`

Must support:

- Node.js runtime
- BullMQ worker runtime
- TypeScript strict mode
- module resolution compatible with current package setup

---

### Package-Level Configuration

Shared packages must support:

- strict TypeScript
- declaration output where required
- clean workspace imports
- future build compatibility

Target packages include:

```txt
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

## shadcn Monorepo Compatibility Rules

Do NOT break the existing shadcn monorepo structure.

Preserve compatibility with:

```tsx
import { Button } from "@workspace/ui/components/button";
```

and shared UI imports from:

```tsx
import { cn } from "@workspace/ui/lib/utils";
```

If `components.json` files exist, do NOT modify them unless TypeScript config changes require import compatibility corrections.

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

- strict TypeScript
- no `any`
- explicit type safety
- no speculative implementation
- no unrelated file changes
- no application logic
- no dependency changes unless required for TypeScript configuration correctness
- preserve current shadcn workspace architecture

---

## Testing Requirements

Required validation:

- `npm install` should not be required unless configuration dependencies change
- `npm run typecheck` must pass
- `npm run build` should not fail because of TypeScript configuration
- existing workspace imports must remain valid
- no package should lose strict compiler settings
- no workspace should be accidentally excluded from typechecking

---

## Acceptance Criteria

The unit is complete ONLY if:

- shared TypeScript baseline is standardized
- strict compiler options are enforced
- app-level configs inherit or align with the shared baseline
- package-level configs inherit or align with the shared baseline
- Next.js config remains functional
- Node app configs remain functional
- shadcn workspace imports remain functional
- npm workspace behavior remains unchanged
- `npm run typecheck` passes
- `npm run build` does not fail because of TypeScript configuration
- no application logic is modified
- no future roadmap unit is implemented
- `context/progress-tracker.md` is updated

---

## Progress Tracker Update Required

After completing this unit:

- move `packages — setup — shared tsconfig standardization` into Completed Units
- set Current Unit to:

```txt
packages — setup — shared eslint standardization
```

- update Next Units queue to keep only the next 3 implementation units
- update App Progress Breakdown
- add session notes describing TypeScript configuration decisions
- record architecture decisions if TypeScript inheritance or module resolution strategy changes
