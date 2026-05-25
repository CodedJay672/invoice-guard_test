# InvoiceGuard

InvoiceGuard is a UK-focused SaaS platform for:

- company payment intelligence
- premium business risk reporting
- overdue invoice enforcement
- statutory late-payment workflows
- accounting platform integrations

The platform combines:

- public company intelligence
- internal payment behavior aggregation
- report monetization
- automated invoice enforcement workflows

into a unified event-driven financial operations platform.

---

# Table of Contents

1. Project Overview
2. Product Phases
3. System Architecture
4. Monorepo Structure
5. Technology Stack
6. Core Architectural Principles
7. Event-Driven Architecture
8. Queue & Worker Infrastructure
9. Webhook Architecture
10. Application Structure
11. Development Workflow
12. Context System
13. Environment Variables
14. Local Development Setup
15. Database Architecture
16. Queue Infrastructure
17. Integrations
18. Frontend Architecture
19. Backend Architecture
20. Testing Strategy
21. Deployment Architecture
22. Security Standards
23. Coding Standards
24. Contribution Workflow
25. Important Engineering Rules
26. Future Roadmap
27. Final Notes

---

# 1. Project Overview

InvoiceGuard is built in two major implementation phases.

---

## Phase A — Company Intelligence Platform

Phase A focuses on:

- company search
- intelligence aggregation
- premium report monetization
- Stripe integration
- PDF report generation
- email delivery

This phase generates revenue immediately while establishing foundational infrastructure.

---

## Phase B — Invoice Enforcement Platform

Phase B expands the system into:

- invoice ingestion
- Xero integration
- QuickBooks integration
- OCR workflows
- statutory interest calculations
- demand letter generation
- response portal workflows
- payment confirmation systems

---

# 2. Product Phases

## Phase A Goals

- monetized company search
- intelligence reporting
- payment workflows
- reusable infrastructure foundations

---

## Phase B Goals

- automated invoice enforcement
- accounting synchronization
- legal workflow orchestration
- overdue payment automation

---

# 3. System Architecture

InvoiceGuard uses:

```txt id="jlwm8m"
Modular Monolith + Event-Driven Internals
```

The architecture intentionally avoids:

- premature microservices
- tightly coupled systems
- synchronous-heavy workflows

---

# High-Level Architecture

```txt id="eqjlwm"
Next.js Frontend
        ↓
Express API
        ↓
PostgreSQL
        ↓
BullMQ + Redis
        ↓
Worker Infrastructure
        ↓
External Integrations
```

---

# 4. Monorepo Structure

Managed using:

- Turborepo

---

## Repository Structure

```txt id="jlwm9k"
/apps
  /web
  /api
  /worker

/packages
  /db
  /types
  /validation
  /queues
  /integrations
  /notifications
  /logger
  /utils

/config
/context
```

---

# 5. Technology Stack

## Frontend

- Next.js App Router
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query

---

## Backend

- Node.js
- Express.js
- TypeScript
- Drizzle ORM

---

## Infrastructure

- PostgreSQL
- Redis
- BullMQ
- Cloudflare R2
- Stripe
- Clerk
- Postmark
- Sentry

---

# 6. Core Architectural Principles

InvoiceGuard is designed around:

- strict layered architecture
- queue-driven workflows
- event-driven processing
- modular domain boundaries
- deterministic workflow orchestration
- asynchronous processing
- infrastructure observability

---

# Important Principles

## Controllers Are Thin

Controllers:

- parse requests
- call services
- return responses

Controllers NEVER:

- access DB directly
- contain business logic
- process heavy workflows

---

## Services Own Business Logic

Services:

- orchestrate workflows
- coordinate repositories
- dispatch queues
- enforce domain rules

---

## Repositories Own Persistence

Repositories are the ONLY layer allowed to:

- access PostgreSQL
- use Drizzle ORM

---

## Workers Own Heavy Async Processing

Workers handle:

- report generation
- PDF rendering
- webhook processing
- OCR
- email delivery
- invoice synchronization

---

# 7. Event-Driven Architecture

InvoiceGuard is internally event-driven.

---

## Example Domain Events

```txt id="jlwm6q"
report_purchased
report_generated
invoice_uploaded
invoice_overdue
payment_confirmed
demand_letter_sent
```

---

## Event Flow Pattern

```txt id="0jlwm4"
Event Occurs
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

# Why This Matters

This architecture allows:

- retry-safe workflows
- async processing
- isolated failures
- scalable workers
- reliable integrations

---

# 8. Queue & Worker Infrastructure

InvoiceGuard relies heavily on:

- BullMQ
- Redis

for workflow orchestration.

---

## Core Queues

```txt id="9jlwm7"
company-search-queue
report-generation-queue
pdf-render-queue
email-delivery-queue
webhook-processing-queue
invoice-sync-queue
ocr-processing-queue
interest-calculation-queue
```

---

## Queue Rules

All jobs MUST:

- be idempotent
- support retries
- support exponential backoff
- log failures
- remain deterministic

---

## Heavy Workflows MUST Use Queues

Examples:

- PDF generation
- email delivery
- OCR
- webhook handling
- invoice synchronization

Never process these inline inside controllers.

---

# 9. Webhook Architecture

Webhooks are treated as infrastructure systems.

---

## Supported Webhooks

### Phase A

- Stripe webhooks
- email delivery webhooks

### Phase B

- Xero webhooks
- QuickBooks webhooks
- payment webhooks

---

## Webhook Processing Flow

```txt id="jlwm1x"
Webhook Received
      ↓
Signature Verification
      ↓
Queue Job
      ↓
Worker Processing
      ↓
Database Update
```

---

## Critical Rules

Webhook handlers MUST:

- verify signatures
- enqueue immediately
- remain lightweight
- support idempotency

---

# 10. Application Structure

## Frontend App (`apps/web`)

Responsible for:

- marketing site
- company search
- intelligence reports
- dashboard UI
- payment flows

---

## API App (`apps/api`)

Responsible for:

- REST APIs
- authentication
- orchestration
- validation
- webhooks
- transactional operations

---

## Worker App (`apps/worker`)

Responsible for:

- queue processing
- retries
- scheduled jobs
- report generation
- async workflows

---

# 11. Development Workflow

InvoiceGuard follows:

- strict roadmap-driven implementation
- AI-assisted development discipline

All implementation order is controlled by:

```txt id="jlwm2u"
context/execution-roadmap.md
```

---

# Critical Rules

- Only ONE roadmap unit active at a time
- Never implement future units early
- Never bypass architectural layers
- Update progress tracker after every completed unit

---

# 12. Context System

The `/context` directory is the authoritative project reference.

---

## Context Files

```txt id="7jlwm0"
AGENTS.md
project-overview.md
architecture-context.md
ui-context.md
code-standards.md
ai-workflow-rules.md
execution-roadmap.md
progress-tracker.md
```

---

## Required Reading Order

1. project-overview.md
2. architecture-context.md
3. ui-context.md
4. code-standards.md
5. ai-workflow-rules.md
6. execution-roadmap.md
7. progress-tracker.md

---

# 13. Environment Variables

## Core Variables

```env id="jlwm8z"
DATABASE_URL=
REDIS_URL=

CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

POSTMARK_API_KEY=

APP_URL=
NODE_ENV=
```

---

## Environment Rules

- Environment variables MUST be schema validated
- Never access process.env directly throughout app
- Use centralized environment loader

---

# 14. Local Development Setup

## Requirements

- Node.js 22+
- pnpm
- PostgreSQL
- Redis

---

## Installation

```bash id="2jlwm1"
pnpm install
```

---

## Start Development

```bash id="5jlwm7"
pnpm dev
```

---

## Start API Only

```bash id="jlwm4w"
pnpm --filter api dev
```

---

## Start Worker Only

```bash id="4jlwm8"
pnpm --filter worker dev
```

---

# 15. Database Architecture

## Primary Database

- PostgreSQL

---

## ORM

- Drizzle ORM

---

## Database Rules

- Controllers NEVER access DB directly
- Services NEVER bypass repositories
- Financial events should remain append-only
- Workflow transitions should remain auditable

---

# Core Entities

## Phase A

- users
- organizations
- companies
- reports
- purchases
- report_entitlements
- webhook_events

---

## Phase B

- invoices
- payment_events
- disputes
- demand_letters
- company_responses

---

# 16. Queue Infrastructure

## Worker Principles

Workers must:

- be isolated
- be retry-safe
- remain idempotent
- emit structured logs

---

## Retry Strategy

Preferred defaults:

```ts id="5jlwm2"
attempts: 5;
backoff: exponential;
```

---

# 17. Integrations

## Phase A Integrations

- Companies House
- Registry Trust
- Insolvency Service
- London Gazette
- Fair Payment Code
- Stripe
- Postmark

---

## Phase B Integrations

- Xero
- QuickBooks
- Twilio

---

## Integration Rules

All integrations MUST:

- live inside `/packages/integrations`
- normalize external payloads
- support retries
- support graceful degradation

---

# 18. Frontend Architecture

## Design System

InvoiceGuard uses:

- token-based design system
- shadcn/ui
- CSS custom properties

---

## Frontend Rules

- default to React Server Components
- minimize `"use client"`
- avoid unnecessary client state
- keep components presentation-focused

---

# 19. Backend Architecture

## Backend Module Structure

```txt id="2jlwm5"
/module
  controller
  service
  repository
  validation
  routes
  worker
```

---

## Layer Responsibilities

### Controller

HTTP only.

### Service

Business logic only.

### Repository

Persistence only.

### Worker

Async processing only.

---

# 20. Testing Strategy

## Required Coverage

- unit tests
- integration tests
- queue tests
- webhook tests
- API tests

---

## Critical Workflow Tests

Mandatory:

- Stripe webhook flow
- report generation
- email delivery
- invoice ingestion
- OCR processing
- demand letter workflows

---

## Recommended Tools

- Vitest
- Supertest
- Playwright

---

# 21. Deployment Architecture

## Frontend

- Vercel

---

## Backend & Workers

- Render
  OR
- Railway

---

## Database

- Neon PostgreSQL
  OR
- Supabase PostgreSQL

---

## Redis

- Upstash Redis

---

# 22. Security Standards

Required:

- Zod validation
- RBAC
- signed webhooks
- rate limiting
- upload validation
- secure token generation

---

## Important Rules

Never:

- log secrets
- trust external payloads
- trust frontend payment state
- skip validation

---

# 23. Coding Standards

## Important Rules

- never use `any`
- never place business logic in controllers
- never bypass repositories
- never hardcode colors
- never bypass queues for heavy workflows

---

## Naming Convention

Use:

- kebab-case filenames
- feature-based organization
- semantic event naming

---

# 24. Contribution Workflow

Before implementation:

1. Read all context files
2. Confirm current roadmap unit
3. Confirm current scope
4. Verify architecture alignment

After implementation:

1. Run tests
2. Verify build
3. Update progress tracker
4. Confirm no unrelated changes

---

# 25. Important Engineering Rules

## Never:

- bypass architectural layers
- implement future roadmap units
- process heavy logic inside controllers
- create duplicate workflow logic
- invent undocumented business rules

---

## Always:

- preserve module boundaries
- preserve queue orchestration
- preserve deterministic workflows
- maintain observability

---

# 26. Future Roadmap

## Planned Future Systems

- invoice enforcement engine
- OCR extraction
- accounting synchronization
- legal workflow orchestration
- payment intelligence aggregation
- analytics infrastructure

---

## Deferred Beyond MVP

- AI-generated legal letters
- ML risk scoring
- predictive analytics
- mobile applications
- multi-region infrastructure

---

# 27. Final Notes

InvoiceGuard is designed as:

- a production-grade SaaS platform
- a queue-oriented workflow system
- an event-driven financial operations platform

The architecture intentionally prioritizes:

- reliability
- observability
- workflow integrity
- maintainability
- long-term scalability

over rapid but unstable implementation.

This repository is structured specifically for:

- disciplined engineering
- scalable infrastructure evolution
- AI-assisted implementation
- deterministic workflow development
- production-grade operational reliability
