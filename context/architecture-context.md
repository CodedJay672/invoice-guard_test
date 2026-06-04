# InvoiceGuard Architecture Context

## Confirmed Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Frontend | Next.js + React + TypeScript | Marketing pages, company search, free preview, checkout initiation, report delivery, admin UI. |
| UI | Tailwind CSS + shadcn/ui | Component system and styling. |
| Backend | Node.js + Express | API server, provider orchestration, Stripe webhooks, admin endpoints. |
| Database | PostgreSQL | Source of truth for company metadata, report products, purchased reports, snapshots, logs, Stripe events, admin audit records. |
| ORM | Prisma or equivalent typed ORM | Schema migrations and database access. |
| Cache / Rate Limiting | Redis / Upstash | Anonymous search rate limiting, idempotency helpers, queue backing where needed. |
| Background Jobs | BullMQ | Paid report generation, provider fetches, PDF generation, expiry jobs, anonymisation jobs, admin alert jobs. |
| Authentication | Clerk | Optional user auth, admin access protection, future account dashboard. |
| Payments | Stripe | One-off paid reports in Phase A; subscriptions in later phases. |
| Email | Resend, SendGrid, Postmark, or equivalent | Guest access links, report-ready notices, admin alerts. |
| PDF Generation | HTML-to-PDF service/library | Branded PDF generation for Premium reports and allowed tiers. |
| Deployment | Vercel for web; Render or equivalent for API/worker | Production deployment. |
| Version Control | GitHub | Full codebase access at milestones. |

## Runtime Applications

```txt
apps/
  web/       # Next.js frontend
  api/       # Express API server
  worker/    # BullMQ workers and scheduled jobs

packages/
  database/
  validation/
  config/
  logger/
  integrations/
  companies/
  reports/
  payments/
  notifications/
  queues/
  documents/
```

## System Boundaries

### `apps/web`

Responsible for:

- Company search UI.
- Free preview UI.
- Report tier selection.
- Checkout initiation.
- Report delivery page.
- Guest report token page.
- Admin dashboard UI.

Not responsible for:

- Calling external provider APIs directly.
- Creating paid reports.
- Running payment confirmation logic.
- Generating legal/report copy from raw data.

### `apps/api`

Responsible for:

- Request validation.
- Auth and admin checks.
- Search and free preview API routes.
- Stripe checkout creation.
- Stripe webhook processing.
- Report access validation.
- Admin refund endpoints.
- Thin orchestration into service modules.

Not responsible for:

- Long-running report generation.
- PDF rendering jobs.
- Scheduled expiry/anonymisation work.

### `apps/worker`

Responsible for:

- Paid report generation jobs.
- Provider fetch orchestration after payment.
- PDF generation jobs.
- Guest report link expiry.
- Search log IP anonymisation.
- Stuck report detection.
- Admin alert dispatch.
- Future watchlist monitoring jobs.

## Core Modules

### Company Module

Handles:

- Companies House identity resolution.
- Company profile normalization.
- Company metadata persistence.
- Free preview assembly.
- Paid report provider inputs.

### Provider Integrations Module

Handles:

- Companies House client.
- Registry Trust client.
- London Gazette client.
- Insolvency/disqualified officers integration.
- Fair Payment Code scraper for Premium reports.
- Provider result normalization.
- Provider usage logging.
- Provider failure status.

Every provider returns a standard result shape:

```ts
interface ProviderResult<TData> {
  provider: string;
  status: "success" | "failed";
  checkedAt: string;
  data?: TData;
  errorCode?: string;
  errorMessage?: string;
}
```

### Reports Module

Handles:

- Report product tiers.
- Entitlement checks.
- Report generation orchestration.
- Frozen report JSON assembly.
- Report reference generation.
- Report display payload creation.
- Recheck support later.

### Payments Module

Handles:

- Stripe checkout sessions.
- Stripe webhook signature verification.
- Stripe event idempotency.
- Purchased report creation.
- Refund processing.
- Payment/audit logging.

### Notifications Module

Handles:

- Guest report access email.
- Report-ready email.
- Admin provider failure alerts.
- Stuck report alerts.
- Failed webhook alerts.

### Documents Module

Handles:

- HTML report rendering.
- PDF generation.
- Mandatory disclaimer insertion.
- Plain English Flag Summary template assembly.

## Data Ownership Model

Phase A supports both guest and optional authenticated access.

- Guest reports are associated with `guest_email` and secure access tokens.
- Authenticated users are associated with `clerk_user_id`.
- Guest reports can later be claimed by a verified Clerk account using the same email address.
- Never link a guest report to an account until the email is verified.

## Storage Model

### PostgreSQL Stores

- Company identity and metadata.
- Provider snapshots.
- Search logs.
- Report products and prices.
- Purchased reports and report JSON.
- Stripe event records.
- Provider usage logs.
- Guest access token hashes.
- Admin audit logs.
- Refund records.
- Future account/watchlist/payment signal records.

### File/Object Storage Stores

- Generated PDF files.
- Any static report export files if needed.

Store file URL/reference in PostgreSQL. Do not store PDF binary data directly in PostgreSQL.

## Core Database Tables — Phase A

### `companies`

Canonical company identity table.

Key fields:

- `id`
- `companies_house_number` unique
- `company_name`
- `company_status`
- `company_type`
- `incorporation_date`
- `registered_office_locality`
- `registered_office_region`
- `registered_office_country`
- `sic_codes`
- `industry_label`
- `active_director_count`
- `last_fetched_at`
- `created_at`
- `updated_at`

### `company_data_snapshots`

Stores raw/normalized provider data per fetch.

Key fields:

- `id`
- `companies_house_number`
- `provider`
- `source_context` (`free_preview`, `paid_report`, `watchlist`, etc.)
- `report_tier`
- `snapshot_data` JSONB
- `snapshot_hash`
- `status`
- `error_code`
- `error_message`
- `fetched_at`

### `search_logs`

Tracks search usage and conversion analytics.

Key fields:

- `id`
- `clerk_user_id` nullable
- `ip_hash`
- `query`
- `matched_companies_count`
- `selected_companies_house_number`
- `created_at`
- `ip_anonymised_at`

### `report_products`

Stores report tier config.

Key fields:

- `id`
- `tier`
- `name`
- `price_pence`
- `currency`
- `includes_pdf`
- `is_active`
- `entitlements` JSONB
- `created_at`
- `updated_at`

### `purchased_reports`

One row per purchased report. Append-only for delivered reports.

Key fields:

- `id`
- `report_reference`
- `clerk_user_id` nullable
- `guest_email` nullable
- `companies_house_number`
- `company_name`
- `report_tier`
- `stripe_payment_id`
- `stripe_checkout_session_id`
- `status` (`pending`, `generating`, `ready`, `failed`, `refund_required`, `refunded`)
- `report_data` JSONB
- `provider_statuses` JSONB
- `pdf_storage_url`
- `guest_access_token_hash`
- `guest_access_expires_at`
- `claimed_at`
- `created_at`
- `updated_at`

### `stripe_events`

Prevents duplicate webhook processing.

Key fields:

- `id` Stripe event ID, primary key
- `event_type`
- `processed_at`
- `payload` JSONB
- `created_at`

### `provider_usage_logs`

Tracks paid provider calls and cost modelling.

Key fields:

- `id`
- `provider`
- `operation`
- `companies_house_number`
- `report_id`
- `subscription_tier` nullable
- `estimated_cost_pence`
- `status`
- `created_at`

### `admin_audit_logs`

Tracks sensitive admin actions.

Key fields:

- `id`
- `admin_clerk_user_id`
- `action`
- `target_type`
- `target_id`
- `metadata` JSONB
- `created_at`

## Background Job Design

### Queue Names

```txt
report-generation-queue
pdf-generation-queue
email-queue
provider-alert-queue
maintenance-queue
```

### Phase A Jobs

| Job | Queue | Purpose |
| --- | --- | --- |
| `generate_paid_report` | `report-generation-queue` | Fetch tier providers, assemble report JSON, save frozen report. |
| `generate_report_pdf` | `pdf-generation-queue` | Generate PDF for Premium and allowed tiers. |
| `send_guest_report_link` | `email-queue` | Send secure report access link to guest buyer. |
| `send_admin_alert` | `provider-alert-queue` | Notify Lucky of provider failure, stuck report, or failed webhook. |
| `detect_stuck_reports` | `maintenance-queue` | Find reports stuck in pending/generating beyond threshold. |
| `expire_guest_report_links` | `maintenance-queue` | Expire guest report links after 30 days. |
| `anonymise_old_search_logs` | `maintenance-queue` | Remove/anonymise identifiable IP data after 90 days. |
| `scrape_fair_payment_code` | `maintenance-queue` | Refresh Fair Payment Code register every 7 days. |

## Critical Flows

### Free Preview Flow

```txt
User searches company
→ API resolves Companies House entity
→ API applies anonymous rate limit if not logged in
→ API calls Companies House, Insolvency/disqualified officers, London Gazette
→ API assembles free preview response
→ UI renders adverse path or clean path
→ Court Records card always appears
→ Registry Trust is never called
```

### Paid Report Flow

```txt
User selects report tier
→ API creates Stripe checkout session
→ User pays on Stripe
→ Stripe sends webhook
→ API verifies signature
→ API checks stripe_events idempotency
→ API creates purchased_report status=pending
→ API enqueues generate_paid_report
→ Worker fetches tier-specific providers
→ Worker stores provider snapshots and statuses
→ Worker assembles frozen report_data
→ Worker marks report ready or refund_required
→ Email sends guest access link/report ready notice
→ PDF job runs if tier includes PDF
```

### Provider Failure Flow

```txt
Provider fails during paid report generation
→ Worker records provider status=failed
→ If Companies House failed: mark report refund_required and trigger automatic refund
→ If other provider failed: generate partial report with data source status notice
→ Send admin alert to ADMIN_ALERT_EMAIL
```

## Admin Model

- Admin routes live under `/admin`.
- A user must be authenticated with Clerk.
- The verified Clerk email must exactly match `ADMIN_EMAIL`.
- Lucky is the only admin in Phase A.
- Admin actions that affect money or reports are written to `admin_audit_logs`.

Admin features in Phase A:

- View reports.
- View report statuses.
- View provider failures.
- View Stripe payment references.
- Trigger full or partial refunds.
- View Phase A transaction count.
- View search and conversion metrics.

## Security Invariants

1. Registry Trust is never called before confirmed Stripe payment.
2. Stripe webhook signature is verified before processing.
3. Stripe event IDs are idempotent.
4. Paid reports are created only from Stripe webhook success, never from frontend redirect.
5. Guest report tokens are random, time-limited, and stored hashed.
6. Admin routes require Clerk authentication and `ADMIN_EMAIL` allowlist.
7. Report data is immutable after `status=ready` except admin-controlled refund/status metadata.
8. Provider failures must be visible in report status and admin alerts.
9. No raw IP address is retained beyond 90 days.
10. Mandatory report disclaimer is never omitted.

## Future-Phase Architecture Reserved Tables

These may be added later, but not implemented in Phase A unless explicitly planned:

- `saved_companies`
- `user_subscriptions`
- `watchlist_companies`
- `company_snapshots`
- `company_alerts`
- `payment_signals`
- invoice recovery tables
