# Product Overview — InvoiceGuard MVP Context

## 1. System Summary

InvoiceGuard is a UK-focused SaaS platform designed to help SMEs, freelancers, agencies, consultants, and creative professionals recover overdue B2B invoice payments while also providing company payment intelligence reports.

The platform combines:

- company intelligence search
- payment behavior aggregation
- overdue invoice enforcement workflows
- statutory interest calculation
- demand letter generation
- accounting platform integrations

The system is built in two implementation phases but remains one unified product platform.

---

# 2. Product Strategy

InvoiceGuard is intentionally divided into two implementation phases:

---

## 2.1 Phase A — Company Search & Intelligence Platform

Phase A is the first production release and revenue-generating layer of the platform.

This phase focuses on:

- company search
- intelligence aggregation
- premium report monetization
- Stripe payments
- PDF report generation
- email delivery

This phase allows the platform to:

- generate revenue immediately
- validate market demand
- establish intelligence infrastructure
- build foundational platform systems

without requiring invoice enforcement infrastructure first.

---

## 2.2 Phase B — Invoice Enforcement Platform

Phase B expands the platform into a full late-payment recovery workflow system.

This phase introduces:

- Xero integration
- QuickBooks integration
- invoice ingestion
- interest calculation
- dispute tracking
- demand letter generation
- company response portal
- payment confirmation workflows
- intelligence feed generation

Phase B reuses the infrastructure established in Phase A.

---

# 3. System Goals

## 3.1 Primary Goals

- Help UK businesses recover overdue invoice payments
- Provide trustworthy company payment intelligence
- Monetize company intelligence reports
- Centralize late payment workflows
- Create a scalable payment intelligence database

---

## 3.2 Secondary Goals

- Validate recurring demand for payment intelligence
- Build reusable infrastructure for enforcement workflows
- Aggregate verified payment behavior data
- Establish a long-term defensible intelligence moat

---

# 4. Core System Model

InvoiceGuard is fundamentally:

> an event-driven financial workflow and intelligence platform.

The system combines:

- public company data
- internal payment intelligence
- asynchronous workflow orchestration
- report monetization
- invoice enforcement operations

---

# 5. Primary System Actors

## 5.1 Admin

Responsibilities:

- manage platform operations
- monitor intelligence reports
- manage integrations
- oversee payment intelligence systems
- manage legal templates
- monitor enforcement workflows

---

## 5.2 Business User

Represents:

- SMEs
- freelancers
- agencies
- consultants
- creative professionals

Capabilities:

- search companies
- purchase intelligence reports
- connect accounting platforms
- upload invoices
- send demand letters
- monitor overdue payments

---

## 5.3 Client Company (External Party)

Represents:

- companies receiving demand letters

Capabilities:

- confirm payment
- raise disputes
- upload payment proof
- respond through portal

---

# 6. Phase A — Company Search & Intelligence Platform

## 6.1 Overview

Phase A establishes InvoiceGuard as a monetized intelligence platform.

Users can:

- search UK companies
- view intelligence previews
- unlock premium reports
- receive downloadable PDF reports

---

## 6.2 Core Workflow

```text
Search Company
    ↓
Resolve Company Identity
    ↓
Aggregate Public Data
    ↓
Merge Internal Intelligence
    ↓
Render Report Preview
    ↓
Stripe Checkout
    ↓
Unlock Report
    ↓
Generate PDF
    ↓
Deliver via Email
```

---

# 7. Company Search System

## 7.1 Search Model

Users search using:

- company name
- Companies House number

The system resolves all companies into:

- a normalized internal company identity

---

## 7.2 External Intelligence Sources

Phase A integrates with:

- Companies House API
- Registry Trust API
- Insolvency Service API
- London Gazette API
- Fair Payment Code register
- Internal payment intelligence database

---

## 7.3 Search Result Architecture

The search experience includes:

- teaser report sections
- locked premium sections
- paywall prompts
- tiered report visibility

Search responses must support:

- caching
- stale refresh logic
- rate limiting
- graceful degradation

---

# 8. Intelligence Report System

## 8.1 Report Tiers

### Basic Report

- lower-cost entry report
- limited intelligence visibility

### Standard Report

- expanded company insights
- additional payment behavior data

### Premium Report

- full intelligence report
- downloadable PDF
- email delivery

---

## 8.2 Report Generation Model

Reports are generated dynamically from:

- aggregated public data
- internal intelligence data
- payment behavior analytics

PDF generation is asynchronous and queue-driven.

---

## 8.3 PDF Delivery

Premium reports support:

- branded PDF rendering
- downloadable access
- email delivery
- persistent purchase access

---

# 9. Stripe Payment Infrastructure

## 9.1 Payment Flow

```text
Select Report Tier
      ↓
Stripe Checkout Session
      ↓
Payment Confirmation
      ↓
Webhook Verification
      ↓
Entitlement Creation
      ↓
Report Unlock
```

---

## 9.2 Payment Rules

- Stripe is the authoritative payment source.
- Report access must always be entitlement-driven.
- Frontend payment states are never trusted directly.
- Webhook verification is mandatory.

---

# 10. Email Delivery System

Phase A email responsibilities include:

- report delivery
- purchase confirmation
- PDF attachment delivery

Providers:

- Postmark
- Resend
- SendGrid

Email delivery events are tracked via webhooks.

---

# 11. Internal Intelligence System

## 11.1 Purpose

The payment intelligence system aggregates:

- payment behavior
- lateness trends
- escalation frequency
- dispute patterns

This becomes the long-term proprietary dataset of InvoiceGuard.

---

## 11.2 Privacy Model

Public reports never expose:

- exact invoice amounts
- identifiable business user information
- raw internal records

Threshold rules must protect anonymity.

---

# 12. Phase B — Invoice Enforcement Platform

Phase B expands the platform into a complete payment recovery workflow engine.

---

# 13. Invoice Ingestion System

## Supported Sources

- Xero
- QuickBooks Online
- PDF uploads
- CSV uploads
- XLSX uploads
- JPG/PNG uploads
- Manual forms

All ingestion paths normalize into a unified invoice schema.

---

# 14. Accounting Platform Integrations

## Phase B Integrations

### Included

- Xero
- QuickBooks Online

### Deferred

- Sage
- FreeAgent
- FreshBooks

All integrations use:

- OAuth 2.0
- token refresh
- queue-based synchronization

---

# 15. Interest Calculation Engine

The system calculates:

- statutory interest
- compensation fees
- overdue duration

using:

- Bank of England base rates
- UK late payment legislation

Calculations are:

- deterministic
- auditable
- queue-driven

---

# 16. Demand Letter System

The platform generates:

- Letter 1
- Letter 2
- Letter 3

using:

- template-based rendering
- PDF generation
- email delivery workflows

AI-generated legal letters are NOT part of the MVP.

---

# 17. Company Response Portal

Client companies can:

- confirm payment
- raise disputes
- upload payment proof

through secure tokenized response links.

---

# 18. Payment Confirmation System

Payments may be confirmed through:

- Xero synchronization
- QuickBooks synchronization
- manual user confirmation
- company response portal

All confirmations generate:

- payment intelligence records

---

# 19. Event-Driven Architecture

InvoiceGuard is internally event-driven.

Examples:

- invoice_uploaded
- report_purchased
- report_generated
- payment_confirmed
- demand_letter_sent
- dispute_raised

Architecture pattern:

```text
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

# 20. Queue & Workflow System

The platform relies heavily on asynchronous processing.

Core queues include:

- report-generation-queue
- email-delivery-queue
- company-search-queue
- webhook-processing-queue
- invoice-sync-queue
- OCR-processing-queue
- interest-calculation-queue

All workers must:

- support retries
- be idempotent
- log failures
- emit structured events

---

# 21. Webhook Infrastructure

Webhooks are used for:

- Stripe payment confirmation
- email delivery tracking
- OAuth lifecycle events
- future payment integrations

Webhook architecture:

- signature verification
- queue-first processing
- retry-safe execution
- observability support

---

# 22. Core Technology Stack

## Frontend

- Next.js
- React
- TailwindCSS
- Shadcn UI

## Backend

- Node.js
- Express.js
- TypeScript

## Infrastructure

- PostgreSQL
- Redis
- BullMQ
- Cloudflare R2
- Vercel
- Render/Railway

---

# 23. Data Storage Model

## PostgreSQL

Primary transactional database.

## Redis

Queue and caching infrastructure.

## Object Storage

PDFs and uploaded files.

## BigQuery

Future analytics infrastructure.

---

# 24. Features In Scope

## Phase A

- company search
- intelligence reports
- Stripe integration
- report paywalls
- PDF generation
- email delivery

## Phase B

- invoice ingestion
- accounting integrations
- interest calculations
- demand letters
- response portal
- payment confirmation

---

# 25. Out of Scope (MVP)

## AI Features

- AI-generated legal letters
- predictive scoring
- machine learning risk models

## Platform Expansion

- mobile apps
- multi-language support
- multi-region deployments

## Financial Infrastructure

- escrow systems
- fund holding
- FCA-regulated payment handling

---

# 26. Success Criteria

## Phase A Success Signals

- successful report purchases
- repeat search activity
- report conversion rates
- stable payment workflows

## Phase B Success Signals

- successful invoice recovery workflows
- stable accounting integrations
- reliable demand letter delivery
- active payment intelligence growth

---

# 27. Strategic Notes

- The intelligence dataset is the long-term strategic moat.
- Search monetization validates demand before enforcement expansion.
- Event-driven architecture is required due to async workflow complexity.
- Queue reliability is mission-critical.
- Workflow integrity is more important than rapid feature expansion.

---

# 28. Final System Definition

InvoiceGuard is a UK-focused SaaS platform combining company payment intelligence, monetized business reporting, and overdue invoice enforcement workflows into a unified event-driven financial operations platform.
