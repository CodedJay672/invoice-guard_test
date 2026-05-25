# AI Workflow Rules — InvoiceGuard AI-Assisted Development Workflow

# 1. Purpose

This document defines the execution discipline for all AI-assisted development inside the InvoiceGuard monorepo.

Its purpose is to ensure:

- architectural consistency
- deterministic implementation
- scoped execution
- reliable progress tracking
- production-grade engineering quality

These rules are mandatory.

AI agents must follow them strictly.

---

# 2. Core Development Philosophy

InvoiceGuard is:

- a production SaaS platform
- event-driven internally
- workflow-oriented
- integration-heavy
- queue-based

This is NOT:

- a prototype codebase
- a rapid hackathon build
- an unstructured MVP

All implementation decisions must prioritize:

- reliability
- maintainability
- workflow integrity
- long-term scalability

over implementation speed.

---

# 3. Single Source of Truth

The authoritative project context lives in:

```txt id="dyc8oh"
/context
```

AI agents must read ALL context files before implementation.

---

# Required Read Order

1. `project-overview.md`
2. `architecture-context.md`
3. `ui-context.md`
4. `code-standards.md`
5. `ai-workflow-rules.md`
6. `execution-roadmap.md`
7. `progress-tracker.md`

---

# 4. Strict Scope Enforcement

## Critical Rule

AI agents must ONLY implement:

- the currently active roadmap unit
- the explicitly scoped implementation task

Nothing else.

---

# Never:

- implement future roadmap units
- anticipate future architecture prematurely
- “helpfully” build ahead
- merge unrelated concerns
- expand scope implicitly

---

# Correct Behavior

If the active roadmap unit is:

```txt id="x8d98h"
auth — session validation schema
```

ONLY implement:

- validation schema
- related types
- related exports

Do NOT implement:

- routes
- services
- controllers
- middleware
- repositories

unless explicitly scoped.

---

# 5. Implementation Sequencing Rules

InvoiceGuard follows strict implementation ordering.

---

# Required Backend Order

Implement backend systems in this order:

1. Validation/schema
2. Shared types/contracts
3. Database models
4. Repository layer
5. Queue definitions
6. Service layer
7. Worker processors
8. Controller layer
9. Routes
10. Tests
11. Frontend integration

---

# Important Rule

Do NOT skip implementation layers.

Do NOT collapse multiple layers into one unit.

---

# 6. Phase Discipline

InvoiceGuard is implemented in phases.

---

# Phase A

Priority systems:

- authentication
- organizations
- company search
- intelligence aggregation
- report generation
- Stripe payments
- email delivery

---

# Phase B

Deferred systems:

- invoice ingestion
- OCR
- Xero integration
- QuickBooks integration
- demand letters
- dispute workflows
- response portal

---

# Critical Rule

Do NOT implement:

- Phase B systems
- Phase B infrastructure
- Phase B workflows

during active Phase A execution unless explicitly required by roadmap sequencing.

---

# 7. Architectural Discipline

InvoiceGuard uses:

- modular monolith architecture
- event-driven internals
- queue-based workflows

AI agents must preserve this architecture.

---

# NEVER:

- introduce microservices
- introduce alternative architectural patterns
- bypass queues for heavy workflows
- bypass repositories
- bypass service layer
- tightly couple modules

---

# 8. Queue Workflow Rules

InvoiceGuard relies heavily on asynchronous processing.

Heavy workflows MUST use queues.

---

# Queue-Mandatory Operations

Examples:

- report generation
- PDF rendering
- email delivery
- OCR processing
- webhook handling
- invoice synchronization
- scheduled workflows

---

# Never Execute Heavy Logic:

- inside controllers
- inside route handlers
- inside webhook handlers

---

# Correct Pattern

```txt id="6m9hqm"
Request
   ↓
Validation
   ↓
Service
   ↓
Queue Job
   ↓
Worker
   ↓
Persistence
```

---

# 9. Event-Driven Rules

InvoiceGuard reacts to business-domain events.

Examples:

```txt id="m8f3ao"
report_purchased
report_generated
invoice_uploaded
invoice_overdue
payment_confirmed
```

---

# Event Rules

- events must be named clearly
- events must represent completed domain actions
- events must remain deterministic
- workflow transitions must remain traceable

---

# 10. Webhook Rules

Webhook systems are infrastructure components.

---

# Webhook Requirements

All webhook handlers must:

- verify signatures
- enqueue processing immediately
- remain lightweight
- support idempotency

---

# NEVER:

- process heavy logic inline
- trust raw webhook payloads
- assume single delivery
- skip verification

---

# 11. External Integration Rules

All external systems must be isolated.

---

# Required Integration Structure

```txt id="mrh8n8"
/packages/integrations
```

---

# Integration Rules

- normalize all provider responses
- validate external payloads
- support retries
- support graceful degradation
- isolate provider-specific logic

---

# 12. Database Workflow Rules

PostgreSQL is the primary source of truth.

---

# Important Rules

- repositories are the ONLY DB access layer
- financial events should remain append-only
- workflow history should remain auditable
- exact workflow transitions must remain traceable

---

# Never:

- mutate workflow state destructively
- bypass repositories
- embed raw SQL unnecessarily

---

# 13. Testing Discipline

Testing is mandatory.

---

# Required Coverage

Every meaningful unit should include:

- unit tests
- integration tests
- queue tests where applicable
- webhook tests where applicable

---

# Critical Systems Requiring Coverage

- Stripe webhook flow
- report generation
- queue workflows
- payment verification
- email delivery
- invoice ingestion
- OCR processing

---

# A Unit Is NOT Complete If:

- tests are missing
- tests fail
- workflows are unverified
- queues are unverified

---

# 14. Progress Tracking Rules

The file:

```txt id="oz7a11"
context/progress-tracker.md
```

is the ONLY authoritative implementation state tracker.

---

# AI agents MUST update:

- completed units
- current active unit
- current branch
- current phase
- blockers
- architecture changes

after every meaningful implementation step.

---

# Important Rule

Progress tracking must reflect REAL implementation state.

Never:

- mark speculative work complete
- assume implementation success
- skip tracker updates

---

# 15. Refactoring Rules

Refactoring is heavily restricted.

---

# AI Agents MUST NOT:

- refactor unrelated modules
- restructure architecture unnecessarily
- rename systems arbitrarily
- introduce alternative abstractions

unless explicitly requested.

---

# 16. Dependency Rules

AI agents must NOT:

- introduce new libraries
- introduce infrastructure dependencies
- add frameworks

without explicit approval.

---

# Preferred Strategy

Always prefer:

- existing infrastructure
- existing patterns
- native platform capabilities

before introducing dependencies.

---

# 17. Frontend Workflow Rules

Frontend implementation is separate from backend units.

---

# Frontend Rules

- default to React Server Components
- minimize `"use client"`
- keep components presentation-focused
- avoid business logic in components
- prefer server-driven data fetching

---

# 18. Error Handling Rules

Errors must remain:

- structured
- centralized
- observable

---

# Never:

- swallow errors silently
- expose raw internal errors
- ignore queue failures
- suppress webhook failures

---

# Required:

- structured logging
- contextual error tracking
- retry visibility
- failure observability

---

# 19. AI Decision-Making Rules

When uncertain:

- STOP implementation
- ask clarifying questions

Never:

- invent undocumented business logic
- infer legal workflows
- assume payment behavior
- create speculative product rules

---

# 20. Prohibited AI Behaviors

The following are prohibited:

- speculative implementation
- future-unit implementation
- duplicate logic generation
- architectural drift
- bypassing queues
- bypassing repositories
- bypassing validation
- introducing inconsistent patterns
- modifying unrelated systems

---

# 21. Definition of Completion

A roadmap unit is ONLY complete when:

- implementation matches scope exactly
- tests pass
- architecture remains consistent
- progress tracker updated
- exports are wired correctly
- no unrelated systems modified

---

# 22. Final Workflow Definition

InvoiceGuard development follows a strict AI-assisted engineering workflow where all implementation is:

- roadmap-driven
- scope-restricted
- layer-ordered
- event-aware
- queue-oriented
- fully validated
- consistently tracked

to ensure reliable, scalable, production-grade system evolution.
