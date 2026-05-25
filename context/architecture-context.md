# Architecture Context — InvoiceGuard MVP Technical Design

# 1. Architecture Overview

InvoiceGuard follows a split-architecture system with clear separation between:

- frontend application
- backend API
- asynchronous worker infrastructure

The platform is built as a modular monolith with event-driven internals.

The system is intentionally designed this way because InvoiceGuard contains:

- asynchronous workflows
- third-party integrations
- report generation pipelines
- webhook-driven infrastructure
- delayed workflow processing
- retry-sensitive operations

---

# 2. High-Level System Structure

## Frontend

Next.js application responsible for:

- public marketing pages
- company search UI
- intelligence reports
- dashboard interfaces
- enforcement workflows
- account management

---

## Backend API

Node.js + Express API responsible for:

- REST endpoints
- authentication
- orchestration
- validation
- transactional operations
- webhook handling

---

## Worker Infrastructure

Dedicated worker runtime responsible for:

- report generation
- email delivery
- OCR processing
- invoice synchronization
- interest recalculation
- scheduled workflows
- retry-safe processing

Workers MUST remain isolated from API runtime.

---

# 3. Monorepo Structure

Managed using Turborepo.

```txt
/apps
  /web           → Next.js frontend
  /api           → Express backend API
  /worker        → Background workers & queues

/packages
  /db            → Drizzle schema + database client
  /types         → Shared TypeScript contracts
  /validation    → Shared Zod schemas
  /queues        → Queue definitions
  /integrations  → Third-party adapters
  /notifications → Email/SMS abstractions
  /logger        → Shared logging utilities
  /utils         → Shared utilities

/config
  /eslint
  /tsconfig

/context
  → Project context and AI execution files
```

---

# 4. Tech Stack Decisions

## Frontend

- Next.js App Router
- React
- TypeScript (strict mode)
- Tailwind CSS
- Shadcn UI
- TanStack Query

---

## Backend

- Node.js
- Express.js
- TypeScript (strict mode)
- Layer-based architecture

---

## Database

- PostgreSQL
- Drizzle ORM

PostgreSQL is the ONLY approved primary database.

MongoDB is permanently excluded.

---

## Queue Infrastructure

- Redis
- BullMQ

BullMQ is required for:

- asynchronous workflows
- retries
- delayed jobs
- scheduled processing

---

## Object Storage

- Cloudflare R2
  OR
- S3-compatible object storage

Used for:

- PDF reports
- uploaded invoice documents
- generated demand letters
- payment proof uploads

---

## Authentication

- Clerk Authentication

Supports:

- email/password
- Google OAuth
- social sign-ins

---

## Payments

- Stripe

Stripe is authoritative for:

- payment verification
- entitlement activation
- purchase confirmation

Webhook verification is mandatory.

---

## Email Delivery

- Postmark
  OR
- Resend

Used for:

- intelligence report delivery
- demand letters
- notifications
- payment confirmations

---

## SMS Notifications

- Twilio

Used in Phase B only.

---

## OCR Processing

- Tesseract OCR

Used for:

- PDF invoice extraction
- image invoice extraction

Phase B only.

---

## Logging & Monitoring

Backend:

- Pino structured logger
- Sentry

Frontend:

- Console logging (MVP)
- Optional PostHog

---

## Testing

Required:

- unit tests
- integration tests
- API tests
- queue tests
- webhook tests

---

# 5. System Architecture Style

InvoiceGuard follows:

## Modular Monolith Architecture

NOT microservices.

The platform remains:

- one backend application
- one primary database
- one deployment domain

with:

- isolated modules
- strict boundaries
- queue-driven workflows

---

# 6. Event-Driven Internal Architecture

InvoiceGuard is internally event-driven.

This is critical.

The system reacts to:

- business events
- queue events
- webhook events
- workflow transitions

---

## Example Events

```txt
company_searched
report_purchased
report_generated
invoice_uploaded
invoice_overdue
payment_confirmed
demand_letter_sent
dispute_raised
```

---

## Event Flow Pattern

```txt
Business Event Occurs
        ↓
Queue Job Created
        ↓
Worker Processes
        ↓
Database Updated
        ↓
Internal Event Emitted
```

---

# 7. Backend Architecture (Layer-Based)

Every backend module follows the same structure.

```txt
/modules
  /auth
  /company-search
  /reports
  /payments
  /webhooks
  /invoices
  /letters
  /notifications
```

---

## Example Module Structure

```txt
/company-search
  company-search.controller.ts
  company-search.service.ts
  company-search.repository.ts
  company-search.routes.ts
  company-search.validation.ts
  company-search.types.ts
```

---

# 8. Layer Responsibilities

## Controller

Responsibilities:

- HTTP request handling
- response formatting
- validation orchestration

Controllers must NEVER:

- access database directly
- contain business logic

---

## Service

Responsibilities:

- business logic
- workflow orchestration
- queue dispatching
- transaction coordination

---

## Repository

Responsibilities:

- database queries
- persistence logic
- relational access

Repositories must ONLY contain database logic.

---

## Worker Processors

Responsibilities:

- async processing
- retries
- delayed workflows
- heavy operations

Examples:

- PDF generation
- email delivery
- OCR processing
- report aggregation

---

## Validation

Responsibilities:

- input validation
- schema enforcement
- DTO safety

All validation uses:

- Zod

---

# 9. API Design

## Style

- RESTful
- resource-based
- modular endpoint grouping

---

# 10. Example Endpoints

## Auth

```txt
POST /api/auth/register
POST /api/auth/login
```

---

## Company Search

```txt
GET /api/companies/search
GET /api/companies/:id
```

---

## Reports

```txt
POST /api/reports/purchase
GET /api/reports/:id
POST /api/reports/generate
```

---

## Stripe

```txt
POST /api/payments/checkout
POST /api/webhooks/stripe
```

---

## Invoices (Phase B)

```txt
POST /api/invoices/upload
GET /api/invoices
GET /api/invoices/:id
```

---

## Demand Letters (Phase B)

```txt
POST /api/letters/generate
POST /api/letters/send
```

---

# 11. Authentication & Authorization

## Authentication

Handled through:

- Clerk

The backend validates:

- session tokens
- organization ownership
- role permissions

---

## Authorization Model

Initial roles:

```txt
ADMIN
USER
```

Future expansion may introduce:

- organization members
- legal operators
- support roles

---

## Access Rules

Only authenticated users may:

- purchase reports
- connect accounting integrations
- upload invoices
- generate letters

Admin-only operations:

- system management
- report moderation
- intelligence oversight

---

# 12. Queue Architecture

Queue infrastructure is mission-critical.

---

## Core Queues

```txt
company-search-queue
report-generation-queue
pdf-render-queue
email-delivery-queue
webhook-processing-queue
invoice-sync-queue
ocr-processing-queue
interest-calculation-queue
notification-queue
```

---

# 13. Queue Rules

All workers must:

- be idempotent
- support retries
- support exponential backoff
- log failures
- emit structured events

No heavy async workflow should execute directly inside controllers.

---

# 14. Webhook Architecture

Webhook infrastructure is first-class infrastructure.

---

## Supported Webhooks

### Phase A

- Stripe webhooks
- email delivery webhooks

### Phase B

- OAuth lifecycle webhooks
- future payment webhooks

---

## Webhook Processing Rules

All webhook endpoints must:

- verify signatures
- enqueue jobs immediately
- respond quickly
- avoid inline processing

---

## Webhook Flow

```txt
Webhook Received
      ↓
Signature Verification
      ↓
Queue Job Created
      ↓
Worker Processing
      ↓
Database Update
```

---

# 15. Database Architecture

## ORM

- Drizzle ORM

---

## Primary Database

- PostgreSQL

---

# 16. Core Entities

## Phase A

- users
- organizations
- companies
- company_reports
- purchases
- report_entitlements
- webhook_events
- report_generation_jobs

---

## Phase B

- invoices
- invoice_uploads
- demand_letters
- payment_events
- disputes
- company_responses
- payment_intelligence

---

# 17. Data Design Principles

## Important Rules

- financial records should be append-only where possible
- workflow events should remain auditable
- exact intelligence source data should remain traceable
- queue jobs should be recoverable

---

# 18. Company Search Architecture

Company search is Phase A priority.

---

## Search Flow

```txt
Search Request
      ↓
Normalize Query
      ↓
Resolve Company Identity
      ↓
Check Cache
      ↓
If stale → Refresh Queue
      ↓
Aggregate Intelligence
      ↓
Return Teaser Report
```

---

# 19. Caching Strategy

Redis caching is required.

---

## Cached Systems

- company search results
- Companies House responses
- Registry Trust responses
- Fair Payment Code responses
- Bank of England base rates

---

## Cache Rules

- stale refresh pattern preferred
- avoid synchronous multi-API aggregation on every request
- graceful degradation required

---

# 20. Report Generation Architecture

## Report Flow

```txt
Purchase Confirmed
      ↓
Entitlement Created
      ↓
Report Generation Queue
      ↓
PDF Render Worker
      ↓
Object Storage Upload
      ↓
Email Delivery Queue
```

---

# 21. PDF Generation

Reports and demand letters use:

- server-rendered PDF generation

Recommended:

- Puppeteer

Reasons:

- print consistency
- branded layouts
- reliable formatting

---

# 22. Invoice Ingestion Architecture (Phase B)

Invoice ingestion supports:

- Xero
- QuickBooks
- PDF
- CSV
- XLSX
- image uploads
- manual forms

---

## Ingestion Flow

```txt
Upload/API Sync
      ↓
Normalization
      ↓
Validation
      ↓
Unified Invoice Schema
      ↓
Persistence
      ↓
Workflow Trigger
```

---

# 23. OCR Processing Flow

```txt
File Upload
      ↓
Object Storage
      ↓
OCR Queue
      ↓
Field Extraction
      ↓
Validation
      ↓
User Confirmation
```

OCR output must NEVER bypass user confirmation.

---

# 24. Demand Letter Architecture (Phase B)

## Flow

```txt
Invoice Overdue
      ↓
Letter Generation Queue
      ↓
Template Rendering
      ↓
PDF Generation
      ↓
Email Delivery
      ↓
Webhook Tracking
```

AI-generated legal letters are NOT permitted in MVP.

---

# 25. Deployment Architecture

## Frontend

- Vercel

---

## Backend & Workers

- Render
  OR
- Railway

Separate deployments:

- API runtime
- worker runtime

---

## Database

- Neon PostgreSQL
  OR
- Supabase PostgreSQL

---

## Redis

- Upstash Redis

---

# 26. Security Architecture

## Required Security Measures

- Zod validation
- RBAC
- HTTPS everywhere
- signed webhook verification
- secure token generation
- encrypted secrets
- rate limiting
- upload validation

---

# 27. Observability Strategy

## Required

- structured logs
- Sentry error tracking
- queue monitoring
- webhook monitoring

---

## Critical Monitoring Targets

- failed jobs
- retry spikes
- webhook failures
- report generation latency
- email delivery failures

---

# 28. Testing Strategy

## Required Coverage

- unit tests
- integration tests
- queue tests
- webhook tests
- API tests
- end-to-end critical flows

---

## Recommended Tools

- Vitest
- Supertest
- Playwright

---

# 29. Constraints & Tradeoffs

## Intentional Decisions

- modular monolith over microservices
- queue-based async processing
- reusable infrastructure between phases
- phased implementation sequencing

---

## Tradeoffs

- split API/worker architecture adds complexity
- queues increase operational overhead
- caching increases consistency complexity
- report generation introduces infrastructure cost

These tradeoffs are intentional to support:

- reliability
- scalability
- workflow integrity

---

# 30. Final Architecture Definition

InvoiceGuard is a modular-monolith, event-driven SaaS platform built within a Turborepo monorepo, where a Next.js frontend communicates with an Express.js backend API backed by PostgreSQL and Redis, using BullMQ-driven asynchronous workflows, Stripe-powered monetization, third-party intelligence integrations, and dedicated worker infrastructure to power company intelligence reporting and overdue invoice enforcement workflows.
