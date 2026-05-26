# Implementation Spec

This spec defines the next InvoiceGuard shared infrastructure unit.

## Unit

`packages — db — drizzle setup + postgres connection`

---

## Objective

This unit is responsible for establishing the shared database infrastructure package for InvoiceGuard using Drizzle ORM and PostgreSQL.

The `packages/db` package exists to provide a single source of truth for:

- Drizzle client creation
- PostgreSQL connection configuration
- schema export foundation
- migration configuration foundation
- future repository-layer database access

This unit must only set up database infrastructure.

It must NOT implement business-domain schemas, repositories, migrations for product entities, services, controllers, routes, queues, integrations, or frontend features.

---

## Scope

### Included

This unit includes:

- review existing `packages/db` structure
- install or verify Drizzle ORM dependencies where required
- install or verify PostgreSQL driver dependency where required
- establish Drizzle client setup
- establish PostgreSQL connection setup
- establish schema export foundation
- establish migration configuration foundation
- establish environment-driven database URL usage
- create `drizzle.config.ts` if required
- verify package-level typecheck
- verify package exports resolve correctly
- update `context/progress-tracker.md`

---

### Excluded

Do NOT implement:

- user schema
- organization schema
- company schema
- report schema
- purchase schema
- invoice schema
- webhook event schema
- payment schema
- queue schemas
- business-domain migrations
- repositories
- services
- controllers
- API routes
- seed scripts
- data access business logic
- Clerk integration
- Stripe integration
- Redis/BullMQ setup
- frontend implementation

Domain schemas will be introduced in later scoped units.

---

## File Scope

### Allowed

```txt
/packages/db/**
/package.json
/package-lock.json
/drizzle.config.ts
/context/progress-tracker.md
```

---

### Conditionally Allowed

Only if required to expose or validate database environment variables:

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
/packages/types/**
/packages/validation/**
/packages/queues/**
/packages/integrations/**
/packages/logger/**
/packages/utils/**
/packages/ui/**
Any business logic file
Any API route file
Any business-domain database schema file
Any repository file
Any service file
Any controller file
Any queue implementation file
Any integration implementation file
Any frontend feature file
```

---

## Required Package Structure

The package should follow this structure:

```txt
packages/db/

├── src/
│   ├── index.ts
│   ├── client.ts
│   ├── connection.ts
│   └── schema/
│       └── index.ts
│
├── package.json
└── tsconfig.json
```

If the existing structure differs, preserve working npm workspace conventions while achieving equivalent organization.

---

## Required Database Infrastructure

### `connection.ts`

Define PostgreSQL connection configuration infrastructure.

Expected responsibilities:

- read database URL from a function parameter or environment-safe config boundary
- validate that a connection string exists before creating a client
- avoid connecting at import time unless explicitly intentional
- keep connection setup reusable by API and worker runtimes

Recommended pattern:

```ts
export interface DatabaseConnectionOptions {
  connectionString: string;
}

export function createPostgresClient(options: DatabaseConnectionOptions) {
  // implementation
}
```

Rules:

- Do not access `process.env` directly across many files.
- If direct environment access is needed, keep it centralized and minimal.
- Do not hardcode connection strings.
- Do not create domain-specific database logic.

---

### `client.ts`

Define Drizzle database client creation.

Expected responsibilities:

- accept a PostgreSQL client/connection
- create and return a Drizzle database instance
- prepare for future schema registration

Recommended pattern:

```ts
export function createDatabase(connectionString: string) {
  // create postgres client
  // return drizzle instance
}
```

Rules:

- Do not define product schemas in this file.
- Do not run migrations in this file.
- Do not execute queries in this file.
- Do not create repositories in this file.

---

### `schema/index.ts`

Create the schema export foundation.

At this stage it should be intentionally empty or infrastructure-only.

Example:

```ts
// Domain schemas will be exported from this file as they are introduced by scoped roadmap units.
export {};
```

Rules:

- Do not add business-domain tables.
- Do not add user/company/report/invoice schemas yet.

---

### `index.ts`

Export database infrastructure.

Example:

```ts
export * from "./client.js";
export * from "./connection.js";
export * as schema from "./schema/index.js";
```

Use export specifiers compatible with the current NodeNext TypeScript module resolution strategy.

---

## Drizzle Configuration

If `drizzle.config.ts` is created, it must:

- use PostgreSQL dialect
- reference the future schema path
- reference a migrations output directory
- read `DATABASE_URL` safely
- avoid importing application code

Expected paths:

```txt
schema: "./packages/db/src/schema/index.ts"
out: "./packages/db/drizzle"
```

If the repo already uses a different Drizzle convention, preserve the existing convention if it works.

---

## Package Configuration Requirements

### `package.json`

Expected package name:

```txt
@workspace/db
```

Expected exports:

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema/index.ts"
  }
}
```

If the repository uses a different established package export pattern, preserve that pattern.

---

## Dependency Rules

The following dependencies may be added to `packages/db` if not already present:

- `drizzle-orm`
- `postgres`

The following dev dependency may be added at the appropriate workspace/root level if required:

- `drizzle-kit`

Do NOT introduce:

- Prisma
- TypeORM
- Sequelize
- Knex
- MongoDB clients
- Supabase client SDK
- Firebase SDK

unless explicitly approved in a later unit.

---

## Environment Rules

`DATABASE_URL` is required for runtime database connections.

`.env.example` should include:

```txt
DATABASE_URL=
```

if it does not already exist.

Do not introduce real credentials.

Do not commit secrets.

---

## Standards

- strict TypeScript
- no `any`
- no business schemas
- no repository logic
- no queries
- no migrations for product entities
- no framework coupling
- no Express imports
- no Next.js imports
- no BullMQ imports
- no validation coupling
- no logger coupling unless explicitly required later
- explicit exported types/functions
- no connection string hardcoding

---

## Testing Requirements

No application tests are required for this unit.

Required validation:

- `npm run typecheck -w @workspace/db` must pass
- `npm run lint -w @workspace/db` must pass
- `npm run format -w @workspace/db` must pass
- full `npm run typecheck` must pass
- full `npm run lint` must pass
- full `npm run format` must pass
- `@workspace/db` exports must resolve correctly
- `@workspace/db/schema` exports must resolve correctly
- no circular dependencies
- no dependency on app code
- no dependency on validation, queue, integration, logger, utils, or UI packages

---

## Acceptance Criteria

This unit is complete ONLY if:

- `packages/db` has a clear database infrastructure structure
- Drizzle ORM is installed or verified
- PostgreSQL driver is installed or verified
- database connection factory is exported
- Drizzle database factory is exported
- schema export foundation exists
- Drizzle config exists if required
- no business-domain schemas are introduced
- no repositories are introduced
- no product migrations are introduced
- package remains framework-independent
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

- move `packages — db — drizzle setup + postgres connection` into Completed Units
- set Current Unit to:

```txt
packages — queues — BullMQ queue infrastructure
```

- update Next Units queue to keep only the next 3 implementation units
- update App Progress Breakdown
- add session notes describing database package decisions
- record architecture decisions if database client, connection, Drizzle config, or package export strategy changes
