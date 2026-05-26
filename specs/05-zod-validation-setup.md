# Implementation Spec

This spec defines the next InvoiceGuard shared infrastructure unit.

## Unit

`packages — validation — zod validation infrastructure`

---

## Objective

This unit is responsible for establishing the shared validation infrastructure package for InvoiceGuard using Zod.

The `packages/validation` package exists to provide a single source of truth for reusable validation primitives, schema helpers, and safe parsing utilities used across:

- `apps/api`
- `apps/web`
- `apps/worker`
- shared packages

This unit must only create generic validation infrastructure.

It must NOT implement business-domain validation schemas for company search, reports, payments, invoices, demand letters, webhooks, or integrations.

---

## Scope

### Included

This unit includes:

- review existing `packages/validation` structure
- install or verify Zod dependency where required
- establish base validation package export structure
- define generic reusable validation helpers
- define generic validation result types if required
- define shared primitive validators only
- provide safe parsing helpers
- verify package-level typecheck
- verify package exports resolve correctly
- update `context/progress-tracker.md`

---

### Excluded

Do NOT implement:

- company search validation schemas
- report validation schemas
- Stripe/payment validation schemas
- invoice validation schemas
- demand letter validation schemas
- webhook validation schemas
- database schemas
- Drizzle models
- API routes
- service/repository/controller layers
- queue definitions
- worker processors
- frontend components
- business logic

Business-domain schemas will be introduced in later scoped units.

---

## File Scope

### Allowed

```txt
/packages/validation/**
/package.json
/package-lock.json
/context/progress-tracker.md
```

---

### Conditionally Allowed

Only if required to fix package export/typecheck behavior:

```txt
/packages/validation/package.json
/packages/validation/tsconfig.json
/packages/validation/eslint.config.*
```

---

### Forbidden

```txt
/apps/**
/packages/db/**
/packages/types/**
/packages/queues/**
/packages/integrations/**
/packages/logger/**
/packages/utils/**
/packages/ui/**
Any business logic file
Any API route file
Any database schema file
Any queue implementation file
Any frontend feature file
```

---

## Required Package Structure

The package should follow this structure:

```txt
packages/validation/

├── src/
│   ├── index.ts
│   ├── primitives.ts
│   ├── helpers.ts
│   └── results.ts
│
├── package.json
└── tsconfig.json
```

If the existing structure differs, preserve working npm workspace conventions while achieving equivalent organization.

---

## Required Validation Infrastructure

### `primitives.ts`

Define generic reusable Zod primitives only.

Examples:

```ts
import { z } from "zod";

export const nonEmptyStringSchema = z.string().trim().min(1);

export const emailSchema = z.string().trim().email().toLowerCase();

export const uuidSchema = z.string().uuid();

export const isoDateStringSchema = z.string().datetime();

export const positiveIntegerSchema = z.number().int().positive();

export const paginationPageSchema = z.number().int().min(1);

export const paginationLimitSchema = z.number().int().min(1).max(50);
```

Do not define business-specific primitives such as company number, report tier, invoice status, payment status, or letter status in this unit.

---

### `helpers.ts`

Define generic schema helper functions.

Expected helpers:

```ts
import type { z } from "zod";

export function parseWithSchema<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown,
): z.infer<TSchema> {
  return schema.parse(input);
}

export function safeParseWithSchema<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown,
): z.SafeParseReturnType<unknown, z.infer<TSchema>> {
  return schema.safeParse(input);
}
```

Do not couple helpers to Express, Next.js, or any specific framework.

---

### `results.ts`

Define generic validation result contracts if useful.

Example:

```ts
export interface ValidationErrorIssue {
  path: string;
  message: string;
  code: string;
}
```

Do not duplicate Zod internals unnecessarily.

---

### `index.ts`

Export all generic validation infrastructure.

Example:

```ts
export * from "./helpers.js";
export * from "./primitives.js";
export * from "./results.js";
```

Use export specifiers compatible with the current NodeNext TypeScript module resolution strategy.

---

## Package Configuration Requirements

### `package.json`

Expected package name:

```txt
@workspace/validation
```

Expected exports:

```json
{
  "exports": {
    ".": "./src/index.ts"
  }
}
```

If the repository uses a different established package export pattern, preserve that pattern.

---

## Dependency Rules

Zod may be added to:

```txt
packages/validation/package.json
```

if it is not already available.

Do NOT add unrelated validation libraries.

Do NOT introduce:

- yup
- joi
- valibot
- class-validator

---

## Standards

- strict TypeScript
- no `any`
- no business schemas
- no framework coupling
- no Express request types
- no Next.js request types
- no database coupling
- no queue coupling
- explicit exported types/functions
- pure reusable helpers only

---

## Testing Requirements

No business tests are required for this unit.

Required validation:

- `npm run typecheck -w @workspace/validation` must pass
- `npm run lint -w @workspace/validation` must pass
- `npm run format -w @workspace/validation` must pass
- full `npm run typecheck` must pass
- full `npm run lint` must pass
- full `npm run format` must pass
- `@workspace/validation` exports must resolve correctly
- no circular dependencies
- no dependency on app code
- no dependency on database, queue, integration, logger, or UI packages

---

## Acceptance Criteria

This unit is complete ONLY if:

- `packages/validation` has a clear base infrastructure structure
- Zod is installed or verified
- generic validation primitives are exported
- generic parsing helpers are exported
- no business-domain schemas are introduced
- package remains framework-independent
- package remains database-independent
- package remains queue-independent
- exports resolve correctly
- package-level typecheck passes
- package-level lint passes
- package-level format passes
- full workspace typecheck passes
- full workspace lint passes
- full workspace format passes
- no future roadmap unit is implemented
- no forbidden files are modified
- `context/progress-tracker.md` is updated

---

## Progress Tracker Update Required

After completing this unit:

- move `packages — validation — zod validation infrastructure` into Completed Units
- set Current Unit to:

```txt
packages — logger — pino logger infrastructure
```

- update Next Units queue to keep only the next 3 implementation units
- update App Progress Breakdown
- add session notes describing validation package decisions
- record architecture decisions if package export strategy or validation dependency strategy changes
