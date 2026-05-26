# Implementation Spec

This spec defines the next InvoiceGuard shared infrastructure unit.

## Unit

`packages — logger — pino logger infrastructure`

---

## Objective

This unit is responsible for establishing the shared logging infrastructure package for InvoiceGuard using Pino.

The `packages/logger` package exists to provide a single source of truth for structured logging across:

- `apps/api`
- `apps/worker`
- shared packages

This unit must only create generic logger infrastructure.

It must NOT implement API request logging middleware, business-event logging, queue processors, webhook handlers, observability integrations, Sentry integration, or application runtime wiring.

---

## Scope

### Included

This unit includes:

- review existing `packages/logger` structure
- install or verify Pino dependency where required
- establish base logger package export structure
- define logger configuration types
- define shared logger factory
- define child logger helper
- define log context typing
- define safe error serialization helper
- verify package-level typecheck
- verify package exports resolve correctly
- update `context/progress-tracker.md`

---

### Excluded

Do NOT implement:

- Express request logging middleware
- API runtime logger wiring
- worker runtime logger wiring
- queue job logging middleware
- webhook-specific logging
- Sentry integration
- OpenTelemetry integration
- business-domain event logs
- database logging
- audit logs
- frontend logging
- API routes
- service/repository/controller layers
- queue definitions
- worker processors

Runtime wiring will be introduced in later scoped units.

---

## File Scope

### Allowed

```txt
/packages/logger/**
/package.json
/package-lock.json
/context/progress-tracker.md
```

---

### Conditionally Allowed

Only if required to fix package export/typecheck behavior:

```txt
/packages/logger/package.json
/packages/logger/tsconfig.json
/packages/logger/eslint.config.*
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
/packages/utils/**
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
packages/logger/

├── src/
│   ├── index.ts
│   ├── logger.ts
│   ├── context.ts
│   └── errors.ts
│
├── package.json
└── tsconfig.json
```

If the existing structure differs, preserve working npm workspace conventions while achieving equivalent organization.

---

## Required Logger Infrastructure

### `context.ts`

Define generic reusable logger context types only.

Expected concepts:

```ts
export interface LogContext {
  requestId?: string;
  jobId?: string;
  module?: string;
  action?: string;
  event?: string;
  userId?: string;
  organizationId?: string;
}
```

Rules:

- Keep context generic.
- Do not define business-specific fields such as `invoiceId`, `reportId`, `stripeSessionId`, or `companyId` in this unit.
- Business-specific log context can be added in later domain units.

---

### `errors.ts`

Define a safe error serializer.

Expected behavior:

- accepts `unknown`
- returns a plain serializable object
- handles `Error` instances
- handles non-Error thrown values
- does not leak sensitive data by default

Example shape:

```ts
export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
}

export function serializeError(error: unknown): SerializedError {
  // implementation
}
```

Rules:

- No `any`.
- Do not throw inside the serializer.
- Avoid exposing arbitrary object contents from unknown thrown values.

---

### `logger.ts`

Define a shared Pino logger factory.

Expected concepts:

```ts
export interface CreateLoggerOptions {
  name?: string;
  level?: string;
  environment?: "development" | "test" | "production";
}

export function createLogger(options?: CreateLoggerOptions): Logger {
  // implementation
}

export function createChildLogger(parent: Logger, context: LogContext): Logger {
  // implementation
}
```

Rules:

- Use Pino only.
- Do not add `pino-pretty` unless already present and explicitly justified.
- Do not bind to Express, BullMQ, or any application runtime.
- Keep logger factory reusable by API and worker runtimes.
- Default log level should be safe and environment-aware.
- Test environment should avoid noisy logs where possible.

---

### `index.ts`

Export all generic logging infrastructure.

Example:

```ts
export * from "./context.js";
export * from "./errors.js";
export * from "./logger.js";
```

Use export specifiers compatible with the current NodeNext TypeScript module resolution strategy.

---

## Package Configuration Requirements

### `package.json`

Expected package name:

```txt
@workspace/logger
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

Pino may be added to:

```txt
packages/logger/package.json
```

if it is not already available.

Do NOT add unrelated logging libraries.

Do NOT introduce:

- winston
- log4js
- bunyan
- pino-http
- pino-pretty
- Sentry packages
- OpenTelemetry packages

unless explicitly approved in a later unit.

---

## Standards

- strict TypeScript
- no `any`
- no runtime app wiring
- no business-domain logging
- no framework coupling
- no Express request types
- no BullMQ job types
- no database coupling
- no validation coupling
- no frontend coupling
- explicit exported types/functions
- safe serialization of unknown errors
- structured JSON logging ready

---

## Testing Requirements

No application tests are required for this unit.

Required validation:

- `npm run typecheck -w @workspace/logger` must pass
- `npm run lint -w @workspace/logger` must pass
- `npm run format -w @workspace/logger` must pass
- full `npm run typecheck` must pass
- full `npm run lint` must pass
- full `npm run format` must pass
- `@workspace/logger` exports must resolve correctly
- no circular dependencies
- no dependency on app code
- no dependency on database, validation, queue, integration, or UI packages

---

## Acceptance Criteria

This unit is complete ONLY if:

- `packages/logger` has a clear base logger infrastructure structure
- Pino is installed or verified
- generic log context types are exported
- safe error serialization helper is exported
- logger factory is exported
- child logger helper is exported
- no business-domain logging is introduced
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

- move `packages — logger — pino logger infrastructure` into Completed Units
- set Current Unit to:

```txt
packages — utils — common utilities setup
```

- update Next Units queue to keep only the next 3 implementation units
- update App Progress Breakdown
- add session notes describing logger package decisions
- record architecture decisions if package export strategy or logging dependency strategy changes
