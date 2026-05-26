# Implementation Spec

This spec defines the next InvoiceGuard shared infrastructure unit.

## Unit

`packages — queues — BullMQ queue infrastructure`

---

## Objective

This unit is responsible for establishing the shared queue infrastructure package for InvoiceGuard using BullMQ and Redis.

The `packages/queues` package exists to provide a single source of truth for:

* queue creation
* queue configuration
* worker-safe queue registration
* queue naming conventions
* shared queue options
* future queue payload typing foundations

This unit must only establish generic queue infrastructure.

It must NOT implement business-domain queues, queue processors, workers, job handlers, webhook processing, invoice synchronization logic, report generation logic, or application runtime wiring.

---

## Scope

### Included

This unit includes:

* review existing `packages/queues` structure
* install or verify BullMQ dependency where required
* install or verify Redis connection dependency where required
* establish shared Redis connection infrastructure for queues
* establish queue creation infrastructure
* establish queue naming infrastructure
* establish queue option configuration helpers
* establish shared queue default settings
* establish queue export foundation
* establish worker-safe reusable queue utilities
* verify package-level typecheck
* verify package exports resolve correctly
* update `context/progress-tracker.md`

---

## Excluded

Do NOT implement:

* company search queue
* report generation queue
* PDF rendering queue
* email delivery queue
* Stripe webhook queue
* invoice sync queue
* OCR queue
* demand letter queue
* queue workers
* queue processors
* retry orchestration workflows
* scheduled jobs
* BullMQ worker runtime bootstrap
* API runtime queue wiring
* Redis caching infrastructure
* Bull Board
* queue monitoring UI
* business-domain queue payloads
* service/repository/controller logic
* API routes
* frontend implementation

Business queues and workers will be introduced in later scoped units.

---

## File Scope

### Allowed

```txt
/packages/queues/**
/package.json
/package-lock.json
/context/progress-tracker.md
```

---

### Conditionally Allowed

Only if required to expose or validate queue environment variables:

```txt
.env.example
/package.json
/turbo.json
```

Do not modify unrelated environment variables.

---

### Forbidden

```txt
/apps/**
/packages/db/**
/packages/types/**
/packages/validation/**
/packages/integrations/**
/packages/logger/**
/packages/utils/**
/packages/ui/**
Any business logic file
Any API route file
Any queue processor file
Any worker implementation file
Any integration implementation file
Any frontend feature file
```

---

## Required Package Structure

The package should follow this structure:

```txt
packages/queues/

├── src/
│   ├── index.ts
│   ├── connection.ts
│   ├── queue.ts
│   ├── names.ts
│   └── options.ts
│
├── package.json
└── tsconfig.json
```

If the existing structure differs, preserve working npm workspace conventions while achieving equivalent organization.

---

## Required Queue Infrastructure

### `connection.ts`

Define Redis connection infrastructure for BullMQ.

Expected responsibilities:

* centralized Redis connection creation
* reusable BullMQ connection configuration
* lazy-safe connection creation where practical
* environment-driven connection string usage

Recommended pattern:

```ts
export interface QueueConnectionOptions {
  connectionString: string;
}

export function createQueueConnection(
  options: QueueConnectionOptions,
) {
  // implementation
}
```

Rules:

* Do not hardcode Redis URLs.
* Do not create queue instances here.
* Do not create workers here.
* Do not connect to Redis at module import time unless explicitly necessary.

---

### `names.ts`

Define centralized queue naming infrastructure.

Expected pattern:

```ts
export const QUEUE_NAMES = {
  // future queues
} as const;
```

At this stage:

* queue names may remain empty
  OR
* include only generic placeholder-safe constants if needed.

Rules:

* Do not define business-domain queues prematurely unless required for infrastructure validation.
* No inline hardcoded queue names across files.

---

### `options.ts`

Define shared queue/job default configuration.

Expected concepts:

```ts
export const DEFAULT_QUEUE_OPTIONS = {
  // retries
  // cleanup
  // backoff
};

export const DEFAULT_JOB_OPTIONS = {
  // attempts
  // removeOnComplete
  // removeOnFail
};
```

Rules:

* defaults must remain generic
* no workflow-specific retry policies
* no business-domain assumptions
* cleanup settings should be production-safe

---

### `queue.ts`

Define reusable queue factory infrastructure.

Expected concepts:

```ts
export interface CreateQueueOptions {
  name: string;
  connectionString: string;
}

export function createQueue(
  options: CreateQueueOptions,
) {
  // implementation
}
```

Rules:

* Use BullMQ only.
* Do not create workers here.
* Do not register processors here.
* Do not define business payloads here.
* Queue creation must be reusable by API and worker runtimes.

---

### `index.ts`

Export all generic queue infrastructure.

Example:

```ts
export * from "./connection.js";
export * from "./names.js";
export * from "./options.js";
export * from "./queue.js";
```

Use export specifiers compatible with the current NodeNext TypeScript module resolution strategy.

---

## Package Configuration Requirements

### `package.json`

Expected package name:

```txt
@workspace/queues
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

The following dependencies may be added to `packages/queues` if not already present:

* `bullmq`
* `ioredis`

Do NOT introduce:

* agenda
* bree
* pg-boss
* rabbitmq clients
* kafka clients
* bull-board
* redis caching SDKs

unless explicitly approved in a later unit.

---

## Environment Rules

`REDIS_URL` is required for runtime queue infrastructure.

`.env.example` should include:

```txt
REDIS_URL=
```

if it does not already exist.

Do not introduce real credentials.

---

## Standards

* strict TypeScript
* no `any`
* no business queues
* no queue processors
* no workers
* no retry orchestration logic
* no framework coupling
* no Express imports
* no Next.js imports
* no BullMQ processor registration
* no validation coupling
* no logger coupling unless explicitly required later
* explicit exported types/functions
* reusable infrastructure only
* production-safe queue defaults

---

## Testing Requirements

No application tests are required for this unit.

Required validation:

* `npm run typecheck -w @workspace/queues` must pass
* `npm run lint -w @workspace/queues` must pass
* `npm run format -w @workspace/queues` must pass
* full `npm run typecheck` must pass
* full `npm run lint` must pass
* full `npm run format` must pass
* `@workspace/queues` exports must resolve correctly
* no circular dependencies
* no dependency on app code
* no dependency on database, validation, integration, logger, utils, or UI packages

---

## Acceptance Criteria

This unit is complete ONLY if:

* `packages/queues` has a clear queue infrastructure structure
* BullMQ is installed or verified
* Redis dependency is installed or verified
* Redis connection factory is exported
* queue factory is exported
* queue naming infrastructure exists
* queue options infrastructure exists
* no business-domain queues are introduced
* no workers are introduced
* no queue processors are introduced
* package remains framework-independent
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

* move `packages — queues — BullMQ queue infrastructure` into Completed Units
* set Current Unit to:

```txt
packages — integrations — integration package foundation
```

* update Next Units queue to keep only the next 3 implementation units
* update App Progress Breakdown
* add session notes describing queue infrastructure decisions. remove old session notes.
* record architecture decisions if Redis client strategy, BullMQ configuration strategy, or queue export strategy changes
