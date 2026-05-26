# Implementation Spec

This spec defines the next InvoiceGuard shared infrastructure unit.

## Unit

`packages — utils — common utilities setup`

---

## Objective

This unit is responsible for establishing the shared common utilities package for InvoiceGuard.

The `packages/utils` package exists to provide a single source of truth for small, framework-independent, reusable helper functions used across:

- `apps/api`
- `apps/worker`
- shared packages
- selected frontend-safe code where applicable

This unit must only create generic utilities.

It must NOT implement business-domain utilities for company search, reports, payments, invoices, demand letters, webhooks, queues, integrations, or frontend features.

---

## Scope

### Included

This unit includes:

- review existing `packages/utils` structure
- establish base utility package export structure
- define generic string utilities
- define generic object utilities
- define generic async utilities
- define generic URL/query utilities if framework-independent
- define generic sleep/retry-safe delay helper
- verify package-level typecheck
- verify package exports resolve correctly
- update `context/progress-tracker.md`

---

### Excluded

Do NOT implement:

- Express middleware utilities
- Next.js utilities
- BullMQ utilities
- Stripe/payment utilities
- company search utilities
- report-generation utilities
- invoice utilities
- demand-letter utilities
- webhook utilities
- database utilities
- validation schemas
- API routes
- service/repository/controller layers
- queue definitions
- worker processors
- frontend components
- business logic

Business-domain utilities will be introduced in later scoped units.

---

## File Scope

### Allowed

```txt
/packages/utils/**
/package.json
/package-lock.json
/context/progress-tracker.md
```

---

### Conditionally Allowed

Only if required to fix package export/typecheck behavior:

```txt
/packages/utils/package.json
/packages/utils/tsconfig.json
/packages/utils/eslint.config.*
```

---

### Forbidden

```txt
/apps/**
/packages/db/**
/packages/types/**
/packages/validation/**
/packages/queues/**
/packages/integrations/**
/packages/logger/**
/packages/ui/**
Any business logic file
Any API route file
Any database schema file
Any validation schema file
Any queue implementation file
Any integration implementation file
Any frontend feature file
```

---

## Required Package Structure

The package should follow this structure:

```txt
packages/utils/

├── src/
│   ├── index.ts
│   ├── async.ts
│   ├── object.ts
│   ├── string.ts
│   └── url.ts
│
├── package.json
└── tsconfig.json
```

If the existing structure differs, preserve working npm workspace conventions while achieving equivalent organization.

---

## Required Utility Infrastructure

### `string.ts`

Define generic string helpers only.

Expected helpers:

```ts
export function isNonEmptyString(value: unknown): value is string;

export function normalizeWhitespace(value: string): string;

export function toKebabCase(value: string): string;
```

Rules:

- No business-specific string parsing.
- Do not implement company number parsing.
- Do not implement report slug generation.
- Do not implement invoice number formatting.

---

### `object.ts`

Define generic object helpers only.

Expected helpers:

```ts
export function isRecord(value: unknown): value is Record<string, unknown>;

export function omitUndefined<T extends Record<string, unknown>>(value: T): Partial<T>;

export function pickDefined<T extends Record<string, unknown>>(value: T): Partial<T>;
```

Rules:

- No deep merge utility unless clearly required.
- No unsafe object mutation.
- No `any`.

---

### `async.ts`

Define generic async helpers only.

Expected helpers:

```ts
export function sleep(milliseconds: number): Promise<void>;

export async function withTimeout<T>(
  promise: Promise<T>,
  milliseconds: number,
  message?: string,
): Promise<T>;
```

Rules:

- Do not implement retry logic in this unit.
- Retry utilities will be handled later in queue/integration-specific units if needed.
- `withTimeout` must clean up timers safely.

---

### `url.ts`

Define generic URL helpers only.

Expected helpers:

```ts
export function appendQueryParams(
  url: string,
  params: Record<string, string | number | boolean | null | undefined>,
): string;
```

Rules:

- Must omit `null` and `undefined` query values.
- Must preserve existing query parameters.
- Must not depend on Next.js, Express, or browser-only APIs.
- Use standard `URL` where possible.

---

### `index.ts`

Export all generic utilities.

Example:

```ts
export * from "./async.js";
export * from "./object.js";
export * from "./string.js";
export * from "./url.js";
```

Use export specifiers compatible with the current NodeNext TypeScript module resolution strategy.

---

## Package Configuration Requirements

### `package.json`

Expected package name:

```txt
@workspace/utils
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

This package should not require external runtime dependencies.

Do NOT add utility libraries such as:

- lodash
- ramda
- date-fns
- axios
- qs
- uuid

unless explicitly approved in a later scoped unit.

---

## Standards

- strict TypeScript
- no `any`
- pure functions only where possible
- no business-domain helpers
- no framework coupling
- no Express request/response types
- no Next.js imports
- no BullMQ types
- no database coupling
- no validation coupling
- no logger coupling
- explicit exported functions
- deterministic behavior

---

## Testing Requirements

No application tests are required for this unit.

Required validation:

- `npm run typecheck -w @workspace/utils` must pass
- `npm run lint -w @workspace/utils` must pass
- `npm run format -w @workspace/utils` must pass
- full `npm run typecheck` must pass
- full `npm run lint` must pass
- full `npm run format` must pass
- `@workspace/utils` exports must resolve correctly
- no circular dependencies
- no dependency on app code
- no dependency on database, validation, queue, integration, logger, or UI packages

---

## Acceptance Criteria

This unit is complete ONLY if:

- `packages/utils` has a clear base utility structure
- generic string helpers are exported
- generic object helpers are exported
- generic async helpers are exported
- generic URL helpers are exported
- no business-domain utilities are introduced
- package remains framework-independent
- package remains database-independent
- package remains queue-independent
- package has no unnecessary runtime dependencies
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

- move `packages — utils — common utilities setup` into Completed Units
- set Current Unit to:

```txt
packages — db — drizzle setup + postgres connection
```

- update Next Units queue to keep only the next 3 implementation units
- update App Progress Breakdown
- add session notes describing utility package decisions
- record architecture decisions if package export strategy changes
