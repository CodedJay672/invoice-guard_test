# Implementation Spec

This spec defines the next InvoiceGuard shared package unit.

## Unit

`packages — types — base shared contracts setup`

---

## Objective

This unit is responsible for establishing the base shared TypeScript contracts package for InvoiceGuard.

The `packages/types` package exists to provide a single source of truth for shared type definitions used across:

- `apps/web`
- `apps/api`
- `apps/worker`
- shared packages

This unit must only define foundational, non-business-specific shared contracts.

It must NOT implement business logic, validation schemas, database schemas, queues, services, controllers, routes, integrations, or frontend features.

---

## Scope

### Included

This unit includes:

- review existing `packages/types` structure
- establish base export structure
- define shared primitive utility types
- define shared API response contracts
- define shared pagination contracts
- define shared ID/timestamp contracts
- define shared environment/common enums only if generic
- verify package-level typecheck
- verify package exports resolve correctly
- update `context/progress-tracker.md`

---

### Excluded

Do NOT implement:

- company search business types
- report business types
- Stripe/payment business types
- invoice types
- demand letter types
- queue payload types
- webhook payload types
- database schema types
- Zod validation schemas
- Drizzle schema models
- API routes
- repository/service/controller logic
- frontend components
- worker processors

Business-domain contracts will be introduced in later scoped units.

---

## File Scope

### Allowed

```txt
/packages/types/**
/package.json
/turbo.json
/context/progress-tracker.md
```

---

### Conditionally Allowed

Only if required to fix package export/typecheck behavior:

```txt
/tsconfig.json
/packages/types/tsconfig.json
/packages/types/package.json
```

---

### Forbidden

```txt
/apps/**
/packages/db/**
/packages/validation/**
/packages/queues/**
/packages/integrations/**
/packages/logger/**
/packages/utils/**
/packages/ui/**
Any business logic file
Any API route file
Any database schema file
Any validation schema file
Any queue implementation file
Any frontend feature file
```

---

## Required Package Structure

The package should follow this structure:

```txt
packages/types/

├── src/
│   ├── api.ts
│   ├── common.ts
│   ├── pagination.ts
│   ├── identifiers.ts
│   ├── timestamps.ts
│   └── index.ts
│
├── package.json
└── tsconfig.json
```

If the existing structure differs, preserve working shadcn/npm workspace conventions while achieving equivalent organization.

---

## Required Shared Contracts

### `common.ts`

Define only generic reusable types such as:

```ts
export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type Maybe<T> = T | null | undefined;
```

Do not overbuild utility types.

---

### `identifiers.ts`

Define generic ID contracts.

Examples:

```ts
export type EntityId = string;

export type OrganizationId = string;

export type UserId = string;
```

Do not define business-specific IDs such as `InvoiceId`, `ReportId`, or `CompanyId` yet unless required by existing package structure.

---

### `timestamps.ts`

Define reusable timestamp contracts.

Examples:

```ts
export interface TimestampFields {
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeleteTimestampFields {
  deletedAt: string | null;
}
```

Use ISO string representation for shared API-facing timestamp contracts.

---

### `pagination.ts`

Define generic pagination contracts.

Examples:

```ts
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<TItem> {
  data: TItem[];
  meta: PaginationMeta;
}
```

---

### `api.ts`

Define generic API contracts.

Examples:

```ts
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccessResponse<TData> {
  data: TData;
}

export interface ApiErrorResponse {
  error: ApiError;
}
```

Do not introduce custom response envelopes if the current standards require raw JSON responses. These contracts should be available for typed API clients and error handling only.

---

## Export Requirements

`packages/types/src/index.ts` must export all base contracts.

Example:

```ts
export * from "./api";
export * from "./common";
export * from "./identifiers";
export * from "./pagination";
export * from "./timestamps";
```

Package exports must allow consumers to import from:

```ts
import type { PaginationMeta } from "@workspace/types";
```

---

## Package Configuration Requirements

### `package.json`

Must expose package exports correctly.

Expected package name:

```txt
@workspace/types
```

Expected export behavior:

```json
{
  "exports": {
    ".": "./src/index.ts"
  }
}
```

If the monorepo uses compiled package output, align exports with the existing package-build convention.

---

## Standards

- strict TypeScript
- no `any`
- no runtime code unless necessary
- type-only package behavior
- no business logic
- no validation logic
- no database coupling
- no framework coupling
- no Express/Next.js-specific types
- kebab-case filenames where applicable
- explicit exported interfaces/types

---

## Testing Requirements

No business tests are required for this unit.

Required validation:

- `npm run typecheck` must pass
- `npm run lint` must pass
- `npm run format` must pass
- `@workspace/types` exports must resolve correctly
- no circular dependencies
- no dependency on app code
- no dependency on database, validation, queues, or integrations packages

---

## Acceptance Criteria

This unit is complete ONLY if:

- `packages/types` has a clear base contract structure
- shared generic contracts are defined
- business-specific contracts are not introduced early
- exports resolve correctly
- package remains framework-independent
- package remains database-independent
- package remains validation-independent
- `npm run typecheck` passes
- `npm run lint` passes
- `npm run format` passes
- no future roadmap unit is implemented
- no forbidden files are modified
- `context/progress-tracker.md` is updated

---

## Progress Tracker Update Required

After completing this unit:

- move `packages — types — base shared contracts setup` into Completed Units
- set Current Unit to:

```txt
packages — validation — zod validation infrastructure
```

- update Next Units queue to keep only the next 3 implementation units
- update App Progress Breakdown
- add session notes describing shared type package decisions
- record architecture decisions if package export strategy changes
