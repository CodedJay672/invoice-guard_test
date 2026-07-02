# Architecture

## Stack

| Layer | Tool | State |
| --- | --- | --- |
| Monorepo | npm workspaces + Turborepo | Implemented |
| Web | Next.js 16.2.6 App Router + React 19 | Implemented |
| API | Node.js + Express 5 | Partially implemented |
| Worker | Node.js + BullMQ | Queue contracts implemented |
| Language | TypeScript 5.9 strict | Implemented |
| Database | PostgreSQL + Drizzle ORM | Schema implemented |
| Redis | ioredis | Rate-limit and queue foundation implemented |
| Auth | Clerk | Planned |
| Payments | Stripe | Planned |
| Email | Postmark | Planned |
| UI | Tailwind CSS 4 + shadcn/ui/Radix | Foundation implemented |
| Logging/validation | Pino + Zod | Implemented |
| PDF/storage | To be selected | Planned |
| AI report interpreter | Anthropic `claude-haiku-4-5-20251001`, `max_tokens: 1500` | Phase A planned |

---

## Repository Structure

```text
apps/
  web/          # Next pages, UI, thin same-origin API proxies
    (landing)
      /           # landing page with search bar in hero section
      /search     # selected-company preview and report-tier selection (`companyNumber` query)
      /pricing    # Pricing page
  api/          # Express routes, services, repositories, composition
  worker/       # BullMQ processors and schedulers
packages/
  config/       # typed environment config
  db/           # Drizzle schema, client, migrations
  integrations/ # provider adapters and normalization
  logger/       # Pino setup
  queues/       # queue names, payloads, defaults
  types/        # shared primitives
  ui/           # shared shadcn primitives and global CSS
  utils/        # general utilities
  validation/   # shared Zod schemas
```

Read relevant installed Next.js documentation under `node_modules/next/dist/docs/` before Next work.

---

## Boundaries

| Area | Owns | Must not own |
| --- | --- | --- |
| `apps/web` | Presentation, interaction state, thin Express proxies | Providers, payment confirmation, report creation, durable business rules |
| `apps/api` | HTTP validation, auth/admin checks, Stripe webhooks, service orchestration | Long-running jobs or UI |
| `apps/web/lib/action` | Next js server actions for database mutation methods |
| `apps/web/lib/data` | Next js DAL. All GET requests happen here |
| `apps/worker` | Report/PDF/email/alert/maintenance jobs | Public HTTP or UI |
| `packages/integrations` | External transport, normalization, provider results | Product entitlement or UI |
| `packages/db` | Schema, migrations, typed persistence | HTTP/presentation logic |
| `packages/ui` | Shared primitives and tokens | InvoiceGuard business logic |

Routes and processors stay thin. Services own business rules; repositories own persistence.

### Modular Monolith Style

InvoiceGuard is a modular monolith split into deployable web, API, and worker runtimes. Domain boundaries are expressed through modules/packages rather than premature microservices. External systems are isolated behind adapters so live providers can replace mocks without changing services or UI contracts.

### Layer Responsibilities

- **Route/controller:** HTTP parsing, validation, identity, authorization, response mapping.
- **Service:** business rules, entitlements, orchestration, lifecycle transitions.
- **Repository:** Drizzle queries and persistence transactions.
- **Integration adapter:** upstream transport, timeout/retry, validation, normalization.
- **Worker processor:** job validation, service invocation, retry/terminal status.
- **UI:** presentation and interaction only.

---

## Data Flows

```text
Browser -> Next proxy -> Express route -> validation/rate limit
        -> CompanyService -> provider adapters -> repository -> typed response
```

```text
Landing autocomplete -> Next search proxy -> Companies House matches
                     -> select canonical company number
                     -> /search?companyNumber=... -> free-preview proxy
```

```text
Tier selection -> Clerk registration/sign-in gate -> Stripe Checkout -> signed webhook -> stripe_events
               -> purchased_reports(pending) -> report-generation-queue
```

```text
Report job -> generating -> entitled fresh providers
           -> provider_usage_logs + company_data_snapshots
           -> frozen factual report data -> Claude interpretation (max 1500 tokens)
           -> frozen report_data -> ready | partial | refund_required
           -> PDF/email/alert jobs
```

### Free Preview Isolation

The free-preview dependency graph receives only Companies House. Gazette, insolvency/disqualified-officer client and Registry Trust isolation is architectural, not a conditional inside one provider function.

### Paid AI Interpretation

- AI interpretation is Phase A report-generation work, not a later enhancement.
- Only authenticated, webhook-confirmed paid reports may invoke it.
- The server/worker uses the exact model `claude-haiku-4-5-20251001` with `max_tokens: 1500`; neither value is client-controlled.
- Input is limited to the frozen, tier-entitled factual report payload and explicit source statuses. Prompting must prohibit invented facts, legal/financial advice, credit decisions, risk scores, and conclusions from unavailable sources.
- Store the interpretation with model, generation timestamp, prompt/template version, and status as part of the frozen report artifact. Retries are idempotent and failures are visible.

### Webhook Flow

```text
raw request body -> Stripe signature verification -> parse supported event
                 -> insert stripe_events ID -> process once
                 -> create pending report + enqueue job -> mark processed
```

Unknown events are acknowledged safely. Processing failures remain retryable/observable; an event is never silently marked processed before its required effects succeed.

---

## Provider Contract

```ts
type ProviderResult<T> =
  | { provider: ProviderName; status: "success"; checkedAt: string; data: T }
  | {
      provider: ProviderName;
      status: "failed";
      checkedAt: string;
      errorCode: IntegrationErrorCode;
      errorMessage: string;
      retryable: boolean;
      statusCode?: number;
    };
```

Current adapters: Companies House, London Gazette, and insolvency/disqualified officers. Registry Trust and Fair Payment Code are reserved but not implemented.

---

## Phase A Tables

- `companies`: canonical Companies House identity.
- `company_data_snapshots`: timestamped provider data/status by source context and tier.
- `search_logs`: search/conversion metadata and anonymisation state.
- `report_products`: tier, price in pence, PDF flag, and entitlements.
- `purchased_reports`: authenticated owner, payment/report lifecycle, frozen JSON including AI interpretation metadata/status, provider statuses, and PDF URL.
- `stripe_events`: durable webhook idempotency.
- `provider_usage_logs`: paid-provider calls and cost modelling.
- `admin_audit_logs`: sensitive admin actions.

Do not add future-phase tables before their gate opens.

### Data Design Principles

- Database constraints enforce canonical identity, event idempotency, and unique report references.
- Money is integer pence with explicit currency.
- Provider/report JSONB uses typed application contracts.
- Report state changes are explicit; ready payloads are append-only artifacts.
- Transactions group effects that must succeed together, especially event/report/job creation boundaries.

---

## Queues

| Queue | Payload/Purpose |
| --- | --- |
| `report-generation-queue` | `{ reportId }` paid generation |
| `pdf-generation-queue` | `{ reportId }` PDF generation |
| `email-queue` | `{ reportId }` authenticated-owner report-ready notification |
| `provider-alert-queue` | operational alerts |
| `maintenance-queue` | expiry, anonymisation, stuck reports, Fair Payment Code |

Defaults are three attempts with exponential backoff. Side effects still require domain-level idempotency.

### Caching

- Redis may cache ephemeral search/provider results when a slice explicitly defines keys and TTLs.
- Cache is never canonical and never bypasses paid-report freshness.
- Free-preview caching must preserve source timestamps and failure meaning.
- Invalidation/TTL behavior is documented with the feature using it.

---

## Deployment and Operations

- Web may deploy to Vercel or an equivalent Next-compatible host.
- API and worker deploy as separate Node processes to Render or equivalent infrastructure.
- PostgreSQL, Redis, and object storage are managed services.
- API and worker share validated configuration but scale independently.
- Health checks cover runtime readiness; job/provider health is monitored separately.

Required observability includes structured logs, provider latency/failure, queue depth/failures, webhook failures, stuck reports, email failures, AI interpretation failures, refunds, and conversion metrics. Logs carry correlation/report/provider IDs without secrets, report contents, or personal data.

---

## Testing Strategy

- Unit tests cover normalization, entitlements, lifecycle rules, and template output.
- Route tests inject mock services/infrastructure.
- Integration tests cover repositories, migrations, Redis, queues, and webhook idempotency.
- Worker tests cover retry, partial report, refund-required, and idempotent reprocessing.
- Browser tests cover search, checkout, report access, responsive states, and admin protection.
- Launch QA uses live/test provider credentials in a controlled environment.

---

## Security and Product Invariants

- Companies House number is canonical identity.
- Registry Trust is never called before confirmed Stripe payment.
- Stripe signature and event idempotency are verified before report creation.
- Frontend redirects never create purchased reports.
- Ready report data is immutable; rechecks create new rows.
- Paid fetches attempt fresh entitled data and reject cache older than 24 hours.
- Checkout and report delivery require an authenticated Clerk owner with a verified primary email; no guest purchase/access path exists.
- Admin authorization is enforced server-side with Clerk and `ADMIN_EMAIL`.
- Provider failures remain visible.
- Search IP information is anonymised/deleted after 90 days.
- Mandatory disclaimer is present on every paid report and PDF.
- Paid AI interpretation uses only `claude-haiku-4-5-20251001` with `max_tokens: 1500` and is completed in Phase A.
- AI output is interpretive assistance, never legal/financial advice, a credit decision, a risk score, or a substitute for source facts. `ENABLE_FLAG_SUMMARY` remains a separate disabled-by-default template flag.
- The complete-system Figma design never overrides phase gates.
- Secrets are server-only validated environment values and never logged or exposed through `NEXT_PUBLIC_*`.
- Rate limiting, input validation, webhook verification, authorization, token hashing, secure headers, and least-privilege provider credentials are mandatory controls.
