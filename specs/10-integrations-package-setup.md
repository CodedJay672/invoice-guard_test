# Implementation Spec

This spec defines the next InvoiceGuard shared infrastructure unit.

## Unit

`packages — integrations — integration package foundation`

---

## Objective

This unit is responsible for establishing the shared integration infrastructure package for InvoiceGuard.

The `packages/integrations` package exists to provide a single source of truth for future third-party integration adapters used by:

* company intelligence APIs
* payment providers
* email providers
* accounting platforms
* future external services

This unit must only create generic integration infrastructure.

It must NOT implement concrete provider adapters for Companies House, Registry Trust, Insolvency Service, London Gazette, Fair Payment Code, Stripe, Postmark, Xero, QuickBooks, Twilio, or any other provider.

---

## Scope

### Included

This unit includes:

* review existing `packages/integrations` structure
* establish base integration package export structure
* define generic integration error types
* define generic integration result types
* define generic HTTP method types
* define generic request/response metadata contracts
* define generic external service configuration types
* define generic timeout/retry option contracts
* define provider-agnostic integration helpers if needed
* verify package-level typecheck
* verify package exports resolve correctly
* update `context/progress-tracker.md`

---

### Excluded

Do NOT implement:

* Companies House adapter
* Registry Trust adapter
* Insolvency Service adapter
* London Gazette adapter
* Fair Payment Code adapter
* Stripe adapter
* Postmark adapter
* Resend adapter
* Xero adapter
* QuickBooks adapter
* Twilio adapter
* provider-specific API clients
* provider-specific request signing
* provider-specific schemas
* webhook handlers
* queue jobs
* services
* repositories
* controllers
* API routes
* frontend implementation
* business logic

Concrete integrations will be introduced in later scoped units.

---

## File Scope

### Allowed

```txt
/packages/integrations/**
/package.json
/package-lock.json
/context/progress-tracker.md
```

---

### Conditionally Allowed

Only if required to fix package export/typecheck behavior:

```txt
/packages/integrations/package.json
/packages/integrations/tsconfig.json
/packages/integrations/eslint.config.*
```

---

### Forbidden

```txt
/apps/**
/packages/db/**
/packages/types/**
/packages/validation/**
/packages/queues/**
/packages/logger/**
/packages/utils/**
/packages/ui/**
Any concrete provider adapter
Any business logic file
Any API route file
Any database schema file
Any validation schema file
Any queue implementation file
Any webhook implementation file
Any frontend feature file
```

---

## Required Package Structure

The package should follow this structure:

```txt
packages/integrations/

├── src/
│   ├── index.ts
│   ├── errors.ts
│   ├── http.ts
│   ├── result.ts
│   ├── config.ts
│   └── retry.ts
│
├── package.json
└── tsconfig.json
```

If the existing structure differs, preserve working npm workspace conventions while achieving equivalent organization.

---

## Required Integration Infrastructure

### `http.ts`

Define generic HTTP contracts only.

Expected concepts:

```ts
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface IntegrationRequestMetadata {
  method: HttpMethod;
  url: string;
  provider: string;
  requestId?: string;
}

export interface IntegrationResponseMetadata {
  statusCode: number;
  provider: string;
  requestId?: string;
  durationMs?: number;
}
```

Rules:

* No provider-specific endpoint contracts.
* No concrete fetch client implementation unless absolutely generic.
* No Stripe, Companies House, Xero, Postmark, or provider-specific logic.

---

### `result.ts`

Define provider-agnostic integration result contracts.

Expected concepts:

```ts
export interface IntegrationSuccess<TData> {
  success: true;
  data: TData;
  metadata?: IntegrationResponseMetadata;
}

export interface IntegrationFailure<TError = IntegrationError> {
  success: false;
  error: TError;
  metadata?: IntegrationResponseMetadata;
}

export type IntegrationResult<TData, TError = IntegrationError> =
  | IntegrationSuccess<TData>
  | IntegrationFailure<TError>;
```

Rules:

* Use generics.
* Do not use `any`.
* Do not couple result types to Zod, Express, BullMQ, or provider SDKs.

---

### `errors.ts`

Define generic integration error types.

Expected concepts:

```ts
export type IntegrationErrorCode =
  | "integration_timeout"
  | "integration_network_error"
  | "integration_auth_error"
  | "integration_rate_limited"
  | "integration_invalid_response"
  | "integration_provider_error"
  | "integration_unknown_error";

export interface IntegrationError {
  code: IntegrationErrorCode;
  message: string;
  provider: string;
  retryable: boolean;
  statusCode?: number;
  cause?: unknown;
}
```

Rules:

* Keep errors provider-agnostic.
* Do not expose secrets or raw provider payloads by default.
* Include retryability signal for future queue/integration workflows.

---

### `config.ts`

Define generic external service configuration contracts.

Expected concepts:

```ts
export interface IntegrationAuthConfig {
  apiKey?: string;
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface IntegrationConfig {
  provider: string;
  baseUrl?: string;
  timeoutMs?: number;
  auth?: IntegrationAuthConfig;
}
```

Rules:

* No provider-specific environment variables.
* No direct `process.env` access.
* No concrete provider config loading.

---

### `retry.ts`

Define retry option contracts only.

Expected concepts:

```ts
export interface IntegrationRetryOptions {
  attempts: number;
  backoffMs: number;
  retryableStatusCodes?: readonly number[];
}
```

Rules:

* Do not implement retry execution in this unit unless it is completely generic and dependency-free.
* Do not import queue utilities.
* Do not create BullMQ jobs.
* Do not create provider clients.

---

### `index.ts`

Export all generic integration infrastructure.

Example:

```ts
export * from "./config.js";
export * from "./errors.js";
export * from "./http.js";
export * from "./result.js";
export * from "./retry.js";
```

Use export specifiers compatible with the current NodeNext TypeScript module resolution strategy.

---

## Package Configuration Requirements

### `package.json`

Expected package name:

```txt
@workspace/integrations
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

This unit should not require runtime dependencies.

Do NOT add:

* axios
* got
* ky
* node-fetch
* Stripe SDK
* Xero SDK
* QuickBooks SDK
* Twilio SDK
* Postmark SDK
* Resend SDK
* Companies House-specific SDKs

unless explicitly approved in later scoped provider units.

---

## Standards

* strict TypeScript
* no `any`
* no provider-specific adapters
* no business-domain logic
* no framework coupling
* no Express imports
* no Next.js imports
* no BullMQ imports
* no database coupling
* no validation coupling
* no logger coupling
* explicit exported types/interfaces
* provider-agnostic contracts only
* future adapter-ready structure

---

## Testing Requirements

No application tests are required for this unit.

Required validation:

* `npm run typecheck -w @workspace/integrations` must pass
* `npm run lint -w @workspace/integrations` must pass
* `npm run format -w @workspace/integrations` must pass
* full `npm run typecheck` must pass
* full `npm run lint` must pass
* full `npm run format` must pass
* `@workspace/integrations` exports must resolve correctly
* no circular dependencies
* no dependency on app code
* no dependency on database, validation, queue, logger, utils, or UI packages

---

## Acceptance Criteria

This unit is complete ONLY if:

* `packages/integrations` has a clear provider-agnostic infrastructure structure
* generic HTTP contracts are exported
* generic result contracts are exported
* generic integration error contracts are exported
* generic integration config contracts are exported
* generic retry option contracts are exported
* no concrete provider adapter is introduced
* no provider-specific SDK is added
* no runtime dependency is added unnecessarily
* package remains framework-independent
* package remains database-independent
* package remains queue-independent
* exports resolve correctly
* package-level typecheck passes
* package-level lint passes
* package-level format passes
* full workspace typecheck passes
* full workspace lint passes
* full workspace format passes
* no future roadmap unit is implemented
* no forbidden files are modified
* `context/progress-tracker.md` is updated

---

## Progress Tracker Update Required

After completing this unit:

* move `packages — integrations — integration package foundation` into Completed Units
* set Current Unit to:

```txt
api — setup — express bootstrap
```

* update Next Units queue to keep only the next 3 implementation units
* update App Progress Breakdown
* add session notes describing integration package decisions
* record architecture decisions if package export strategy or integration contract strategy changes
