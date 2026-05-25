# Code Standards — InvoiceGuard Engineering Standards

# 1. General Principles

- Keep modules small, focused, and single-purpose.
- Fix root causes — never layer hacks or temporary workarounds.
- Respect the architectural boundaries defined in `architecture-context.md`.
- Maintain deterministic workflow behavior.
- Prefer explicitness over clever abstractions.
- Reuse existing patterns and infrastructure whenever possible.
- Do not introduce alternative architectural patterns without approval.
- Maintain strict consistency across apps and packages.
- Prioritize reliability and maintainability over implementation speed.

---

# 2. TypeScript Standards

- Strict mode is required across the entire monorepo.
- Never use `any`.
- All exported functions must have explicit return types.
- All function inputs and outputs must be typed.
- Use `interface` for object contracts where appropriate.
- Use `type` for unions, mapped types, and utility compositions.
- Use `unknown` for external input and validate before usage.
- Never trust third-party API payloads directly.

---

# 3. Monorepo Standards

Shared logic MUST live inside `/packages`.

## Approved Shared Packages

```txt id="aqa4x7"
/packages
  /db
  /types
  /validation
  /queues
  /integrations
  /notifications
  /logger
  /utils
```

---

# Monorepo Rules

- Do not duplicate logic across apps.
- Apps must NEVER import directly from other apps.
- Shared contracts must go through `/packages/types`.
- Shared validation schemas must go through `/packages/validation`.
- Shared queue definitions must go through `/packages/queues`.

---

# 4. Backend Architecture Standards

InvoiceGuard follows strict layered architecture.

---

# 4.1 Layer Structure

Every backend module must follow:

```txt id="jlwm7y"
controller
service
repository
validation
routes
worker
types
```

---

# 4.2 Controller Rules

Controllers must remain extremely thin.

Controllers may ONLY:

- parse requests
- call services
- return responses

Controllers must NEVER:

- access database directly
- contain business logic
- dispatch raw SQL
- perform heavy async processing
- generate PDFs
- call external providers directly

---

# 4.3 Service Rules

Services contain ALL business logic.

Responsibilities:

- orchestrate workflows
- coordinate repositories
- coordinate queues
- enforce business rules

Services must NEVER:

- depend on Express objects
- manipulate HTTP responses
- access raw database drivers directly

---

# 4.4 Repository Rules

Repositories are the ONLY layer allowed to access the database.

Rules:

- use Drizzle ORM exclusively
- return typed data only
- avoid embedding business logic
- isolate persistence concerns

---

# 4.5 Worker Rules

Workers are responsible for:

- asynchronous processing
- retries
- scheduled jobs
- queue-driven workflows

Examples:

- report generation
- email delivery
- OCR processing
- invoice synchronization
- interest recalculation

Workers must NEVER:

- depend on Express request lifecycle
- expose HTTP behavior
- bypass service layer rules unnecessarily

---

# 5. Queue & Event Standards

InvoiceGuard is event-driven internally.

All heavy or retryable operations MUST use queues.

---

# 5.1 Required Queue Use Cases

Queues are mandatory for:

- PDF generation
- report generation
- email delivery
- OCR processing
- invoice synchronization
- webhook processing
- scheduled workflows
- notification dispatch

---

# 5.2 Queue Rules

All jobs must:

- be idempotent
- support retries
- support exponential backoff
- emit structured logs
- fail safely

Never assume:

- single execution
- ordered execution
- guaranteed external availability

---

# 5.3 Event Naming Standards

Use past-tense domain events.

Examples:

```txt id="yrrvxf"
report_purchased
report_generated
invoice_uploaded
invoice_overdue
payment_confirmed
demand_letter_sent
```

Avoid:

- vague names
- UI-oriented names
- technical implementation names

---

# 6. API Design Standards

## API Style

- RESTful
- resource-oriented
- modular endpoint grouping

---

# 6.1 Route Naming

Use consistent route structure.

Examples:

```txt id="lrb4jm"
/api/companies
/api/reports
/api/payments
/api/invoices
/api/letters
```

Avoid:

- verbs in URLs
- inconsistent naming
- RPC-style endpoints

---

# 6.2 Request Validation

All incoming requests MUST be validated using:

- Zod

Validation occurs BEFORE:

- business logic
- queue dispatching
- persistence

Reject invalid requests immediately.

---

# 6.3 Response Handling

- Return raw JSON responses.
- Use proper HTTP status codes.
- Avoid custom response envelope wrappers.
- Keep API responses deterministic.

---

# 7. Error Handling Standards

InvoiceGuard requires centralized error handling.

---

# 7.1 Error System

Use:

- custom error classes
- centralized error middleware

Examples:

```txt id="vijh4x"
AppError
ValidationError
AuthenticationError
AuthorizationError
ExternalIntegrationError
WebhookVerificationError
```

---

# 7.2 Error Rules

- Throw errors in services.
- Never swallow errors silently.
- Never expose raw internal errors publicly.
- Include contextual logging for failures.
- External API failures must remain traceable.

---

# 8. Authentication & Authorization Standards

Authentication handled via:

- Clerk
- middleware-based verification

---

# 8.1 Authentication Rules

- Never implement auth logic inside controllers.
- Never trust frontend auth state directly.
- Attach authenticated user context via middleware.

---

# 8.2 Authorization Rules

Enforce:

- organization ownership
- role checks
- resource ownership

before protected actions.

---

# 9. Database Standards

## ORM

- Drizzle ORM only.

---

# 9.1 Database Access Rules

- Controllers must NEVER access the database.
- Services must NEVER bypass repositories.
- Avoid raw SQL unless absolutely necessary.
- Repository methods must return typed data.

---

# 9.2 Data Design Rules

Store only structured transactional data in PostgreSQL.

Large files belong in:

- Cloudflare R2
  OR
- S3-compatible storage

Database stores:

- metadata
- references
- structured records

---

# 9.3 Financial Data Rules

Financial and workflow events should be append-only where possible.

Avoid destructive updates for:

- payment records
- workflow transitions
- webhook events
- delivery logs
- report purchases

---

# 10. External Integration Standards

External APIs must ALWAYS be isolated behind adapters.

---

# 10.1 Integration Rules

All integrations belong in:

```txt id="f9hf49"
/packages/integrations
```

Examples:

```txt id="vqdhhk"
xero/
quickbooks/
stripe/
companies-house/
registry-trust/
postmark/
twilio/
```

---

# 10.2 Integration Safety Rules

Never trust external payloads directly.

All integrations must support:

- validation
- retries
- timeout handling
- normalized responses
- graceful degradation

---

# 11. Webhook Standards

Webhooks are infrastructure components.

---

# 11.1 Webhook Rules

All webhook endpoints must:

- verify signatures
- respond quickly
- enqueue jobs immediately
- avoid inline heavy processing

---

# 11.2 Webhook Idempotency

Webhook providers may send duplicate events.

Processing must be idempotent.

Store:

- external event IDs
- processing state
- retry metadata

---

# 12. File Naming & Organization

## Naming Convention

Use kebab-case for all files.

Examples:

```txt id="qjlwmv"
company-search.service.ts
report-generation.worker.ts
payment-confirmation.repository.ts
```

---

# 12.1 Folder Rules

Group files by feature/module.

Never organize globally by type.

Correct:

```txt id="7rbr5j"
/modules/company-search
```

Wrong:

```txt id="pjzgw8"
/controllers
/services
/repositories
```

---

# 13. Async & Error Handling Patterns

Use:

- async wrapper utilities
- centralized error middleware

Avoid repetitive try/catch blocks inside controllers.

---

# 14. Logging Standards

## Backend Logging

Use:

- Pino structured logger

Required context:

- request ID
- queue job ID
- module name
- event type
- integration source

---

# 14.1 Logging Rules

Log:

- payment events
- webhook events
- queue failures
- authentication failures
- report purchases
- workflow transitions

Avoid:

- noisy logs
- duplicated logs
- sensitive data exposure

---

# 15. Environment Variable Standards

Environment variables MUST be:

- schema validated
- centralized
- typed

Use:

- Zod environment schemas

Never access:

- `process.env`

directly throughout the codebase.

---

# 16. Security Standards

## Required Security Controls

- Zod validation
- RBAC
- secure HTTP headers
- rate limiting
- signed webhook verification
- upload validation
- file MIME validation
- token expiration enforcement

---

# 16.1 Sensitive Data Rules

Never log:

- secrets
- raw auth tokens
- Stripe secrets
- password hashes
- sensitive payment metadata

---

# 17. Frontend Standards

## 17.1 Component Model

- Default to React Server Components.
- Use `"use client"` only when necessary.
- Prefer server-side data fetching.
- Avoid unnecessary client-side state.

---

# 17.2 Frontend Rules

Components are for:

- presentation
- interaction
- UI orchestration

Components must NEVER:

- contain business logic
- duplicate backend validation
- directly call integrations

---

# 17.3 Data Fetching Rules

Prefer:

- server-side fetching
- server actions
- backend-driven state

Avoid:

- unnecessary client polling
- fragmented API calls
- duplicated requests

---

# 18. State Management Standards

No global state library for MVP unless approved.

Preferred:

- server state
- URL state
- local component state

---

# 19. Forms & Validation

All forms must:

- share backend validation schemas
- validate client-side
- validate server-side

Validation schemas must originate from:

- `/packages/validation`

---

# 20. Testing Standards

## Required Coverage

Test:

- services
- repositories
- workers
- queue processors
- webhook handlers
- critical workflows

---

# 20.1 Critical Workflow Tests

Mandatory coverage for:

- Stripe webhook flow
- report purchase flow
- report generation
- email delivery
- invoice ingestion
- demand letter generation

---

# 20.2 Testing Rules

- Tests must be deterministic.
- Tests must be isolated.
- Do not merge untested business logic.
- Queue workflows require integration testing.

---

# 21. Shared Types & Contracts

All shared contracts belong in:

```txt id="ajl0dr"
/packages/types
```

Includes:

- DTOs
- API contracts
- queue payloads
- webhook payloads
- shared enums

---

# 22. AI Development Constraints

Strict rules for AI-assisted implementation.

---

# 22.1 AI Rules

- Never bypass architectural layers.
- Never introduce new patterns unnecessarily.
- Always reuse existing infrastructure.
- Never duplicate workflow logic.
- Follow execution roadmap strictly.
- Respect module boundaries at all times.

---

# 22.2 Workflow Discipline

Never implement:

- future roadmap units
- speculative infrastructure
- unrelated features

outside scoped execution units.

---

# 23. Prohibited Practices

The following are prohibited:

- using `any`
- database access outside repositories
- business logic inside controllers
- heavy async work inside controllers
- direct third-party API calls inside controllers
- hardcoded secrets
- skipping validation
- silent failures
- duplicated workflow logic
- bypassing queue infrastructure for heavy workflows

---

# 24. Final Standards Definition

A strictly layered, event-driven, queue-oriented, type-safe monorepo architecture where business workflows are deterministic, infrastructure responsibilities are isolated, validation is enforced globally, and all systems are designed for reliable AI-assisted production-grade development.
