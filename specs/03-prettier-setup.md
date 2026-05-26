# Implementation Spec

This spec defines the next InvoiceGuard infrastructure hardening unit.

## Unit

`packages — setup — shared prettier configuration`

---

## Objective

This unit is responsible for reviewing, standardizing, and enforcing Prettier formatting across the InvoiceGuard monorepo.

The repository already has:

- shadcn monorepo foundation
- npm workspaces
- Turborepo
- shared TypeScript configuration
- shared ESLint configuration

This unit exists to ensure formatting behavior is consistent across all workspaces without changing application logic.

---

## Scope

### Included

- Shared Prettier config review
- Root Prettier configuration setup or standardization
- Prettier ignore file setup or review
- Root `format` script verification
- Workspace formatting behavior verification
- Format command alignment where required
- Documentation of non-scope formatting issues if discovered
- Progress tracker update

---

### Excluded

Do NOT implement:

- TypeScript standardization
- ESLint standardization
- database setup
- queue setup
- Clerk setup
- Stripe setup
- Express bootstrap
- frontend implementation
- shared business logic
- Drizzle configuration
- API routes
- UI components
- validation schemas
- shared types

---

## File Scope

### Allowed

```txt
.prettierrc
.prettierrc.*
prettier.config.*
.prettierignore
package.json
/apps/*/package.json
/packages/*/package.json
/context/progress-tracker.md
```

---

### Conditionally Allowed

Only if Prettier config is centralized inside a workspace package:

```txt
/packages/prettier-config/**
/config/prettier/**
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
Any frontend feature file
```

---

## Required Configuration Expectations

Prettier must be configured consistently for:

- TypeScript
- TSX
- JSON
- Markdown
- CSS
- configuration files

Recommended baseline:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## Required Ignore Rules

`.prettierignore` must exclude generated and dependency files such as:

```txt
node_modules
.next
.turbo
dist
build
coverage
package-lock.json
```

Do not ignore source files.

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

- no application logic changes
- no formatting changes to forbidden-scope files
- no dependency changes unless required for Prettier configuration
- no speculative implementation
- preserve shadcn monorepo compatibility
- preserve npm workspace behavior

---

## Testing Requirements

Required validation:

- `npm run format` must resolve correctly
- Prettier configuration must be discoverable from the repository root
- Prettier ignore rules must prevent formatting generated files
- `npm run typecheck` should still pass after configuration
- `npm run lint` behavior should not be worsened by this unit

If `npm run lint` still fails because of the known existing `apps/web/app/layout.tsx` unused Geist import, document that blocker remains unresolved. Do not fix it in this unit because it is outside scope.

---

## Acceptance Criteria

This unit is complete ONLY if:

- shared Prettier configuration exists
- `.prettierignore` exists and is correct
- root format command resolves correctly
- formatting behavior is standardized
- no application logic is modified
- no forbidden-scope files are modified
- no future roadmap unit is implemented
- npm workspace behavior is preserved
- `npm run typecheck` still passes
- known lint blocker is documented if still present
- `context/progress-tracker.md` is updated

---

## Progress Tracker Update Required

After completing this unit:

- move `packages — setup — shared prettier configuration` into Completed Units
- set Current Unit to:

```txt
packages — types — base shared contracts setup
```

- update Next Units queue to keep only the next 3 implementation units
- update App Progress Breakdown
- add session notes describing Prettier configuration decisions
- record architecture decisions if formatting config strategy changes
