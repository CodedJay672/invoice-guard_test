# Code Standards

## Engineering Mindset

The AI agent on this project operates as a senior engineer. This means:

- **Think before implementing** — understand what is being built and why before writing a single line
- **Read context files first** — never assume, always verify against architecture.md and project-overview.md
- **Scope is sacred** — only build what the current feature requires. Never go beyond scope even if it seems helpful
- **Every feature must be testable** — if it cannot be verified immediately after implementation, it is incomplete
- **Clean over clever** — simple readable code that a junior developer can understand is always preferred over clever abstractions
- **One thing at a time** — complete one feature fully before touching the next
- **Failures are expected** — wrap agent operations in try/catch, log failures, never let one failure crash everything

---

## TypeScript

- Strict mode; never use `any`.
- Narrow `unknown` external input with Zod or explicit guards.
- Exported functions have explicit parameters and return types.
- Use discriminated unions for provider, report, job, and UI state.
- Use interfaces for service/dependency contracts and type aliases for unions.
- Treat requests, webhooks, provider responses, and environment data as untrusted.
- No floating promises or unjustified assertions.

---

## Next.js 16.2.6 and React 19

- Read the relevant guide in `node_modules/next/dist/docs/` before Next work.
- App Router only.
- Pages/layouts are Server Components by default.
- Put `"use client"` on the smallest interactive leaf, not whole pages where extraction is possible.
- Web route handlers are thin same-origin Express proxies and contain no duplicated domain logic.
- Route handlers are uncached unless explicitly configured.
- Route handlers live in `app/api/` — never put business logic directly in route handlers
- Server Actions live in `actions/` — never define Server Actions inline in components
- DAL helpers live in `lib/data/` and are server-only; Server Components read through them instead of fetching inline
- Server Actions perform mutations/retry commands and may call the Express backend with trusted owner context; Client Components must not POST to app route handlers for those commands
- Thin route handlers remain acceptable for bounded client polling/status reads and owner-authorized download redirects
- Follow installed docs for async params/context and other version-specific APIs.
- Load Inter and mono fonts through `next/font` in the root layout.
- Components contain no provider calls, database work, or durable business rules.

---


## Component Structure

Every component follows this exact order:

```typescript
"use client"; // only if needed

// 1. External imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Internal imports
import { StatsCard } from "@/components/dashboard/StatsCard";

// 3. Type definitions
type Props = {
  jobId: string;
  matchScore: number;
};

// 4. Component
export function ComponentName({ jobId, matchScore }: Props) {
  // state
  // derived values
  // handlers
  // return JSX
}
```

- Never use default exports for components. Next.js special files that require a default export
  (`page.tsx`, `layout.tsx`, `loading.tsx`, and `error.tsx`) are the only exception.
- Props type defined directly above the component — not in a separate types file unless shared
- No inline styles — all styling via Tailwind classes using CSS variables from ui-tokens.md

```typescript
// actions/profile.ts

"use server";

import { revalidatePath } from "next/cache";

export async function saveProfile(formData: ProfileFormData) {
  try {
    // make POST, DELETE, PUT, PATCH request to express backend
    // handle errors
    // parse response
    revalidatePath("/profile"); // if this request should mutate UI
    // return data to user
  } catch (error) {
    //error handling
  }
}
```

- Every Server Action has a try/catch
- Always call `revalidatePath` after mutations that affect page data
- Never throw from Server Actions — always return the error

---

## Styling and UI

- Follow `ui-tokens.md`, `ui-rules.md`, and `ui-registry.md`.
- Never hardcode colours or use built-in Tailwind colour classes.
- Use shared shadcn primitives before creating new primitives.
- Do not modify generated primitives unless explicitly required.
- Use `cn` for conditional classes.
- Register every new or materially changed product component.

---

## Express, Services, and Persistence

Route order:

1. Parse/validate input.
2. Resolve identity.
3. Enforce rate limit/auth/authorization.
4. Call a domain service.
5. Return `{ data }` or `{ error: { code, message }, meta? }`.

- Routes do not call providers or Drizzle directly.
- Services own business rules; repositories own persistence; providers own transport/normalization.
- Unexpected async errors reach Express error middleware.
- Never expose raw errors or stack traces.
- Use dependency injection for infrastructure-free route tests.

### API and Error Contracts

- Resource routes use nouns and stable version-compatible shapes.
- Validation failures are 400-class errors with stable machine codes and human messages.
- Authentication and authorization failures are distinguished correctly.
- Provider unavailability does not masquerade as not-found.
- Domain errors are mapped once at the route boundary; raw upstream/database errors remain internal.
- Pagination/filter inputs are bounded and validated.

---

## Provider Rules

Every provider:

- Has one responsibility, timeout, mock/live contract where applicable, and normalization boundary.
- Returns `ProviderResult<T>` with provider, status, and `checkedAt`.
- Represents failures as structured data with retryability.
- Never leaks credentials or raw internals to clients.

Registry Trust:

- Is paid-only and unreachable from free-preview/tab dependency graphs.
- Runs only after webhook-confirmed payment.
- Writes every call to `provider_usage_logs`.
- Uses GBP 0.80 as planning cost until Lucky changes it.
- Requires tests proving free preview and free tab routes cannot call it.

Integration modules separate client/factory, live adapter, mock adapter, types, normalization, and tests. Timeouts/retries are explicit; retry behavior respects idempotency and never multiplies paid calls invisibly.

Companies House:

- Is the only free-tier provider and powers overview, filing history, charges, officers, and insolvency tabs.
- Free-tier Companies House tab routes may fetch only Companies House endpoints and must expose source timestamps/failure states.
- Companies House tab failures are shown as `Data could not be retrieved`, never as paid-source absence or a clean conclusion.
- Do not call Registry Trust/CCJs, Fair Payment Code, AI, London Gazette, or other paid/non-Companies-House providers from free-tier tab composition.

---

## Payments and Reports

- Stripe webhook—not redirect—creates pending reports.
- Verify signature and persist event ID for durable idempotency.
- Duplicate events cannot duplicate reports or jobs.
- Store money as integer pence and never trust browser tier/price data.
- Ready `report_data` is immutable; rechecks create new rows.
- Paid reports attempt fresh entitled data and include source timestamps/status.
- Companies House failure enters refund-required/automatic-refund flow.
- Non-critical failures create visible partial reports.
- Refunds require reason and admin audit record.
- Mandatory disclaimer is independent of `ENABLE_FLAG_SUMMARY`.

### Webhooks

- Preserve the raw body needed for signature verification.
- Support only documented event types and acknowledge unknown types safely.
- Persist event identity before/with effects in a transactionally safe design.
- Do not mark processing complete before required report/job effects succeed.
- Reprocessing must converge on the same state.

---

## AI Interpretation, Legal, and Product Copy

- Paid-report interpretation is required in Phase A and runs only after authenticated payment and frozen factual assembly.
- The public `/company/[houseNumber]/ai-summary` tab is paid-only and summarizes Companies House overview data. Free users receive only a blurred/skeleton placeholder and upgrade prompt; no model request is made.
- Paid AI interpretation may interpret all fetched tab data available in the frozen artifact, including Companies House filing history, charges, officers, insolvency, paid CCJs, and Fair Payment Code.
- Use exactly `claude-haiku-4-5-20251001` with `max_tokens: 1500`; model and output limit are server-controlled validated configuration/constants.
- Send only product-entitled frozen facts and explicit source statuses. Store model, prompt/template version, generation time, and outcome with the immutable report artifact.
- AI output must not invent facts, infer from unchecked sources, provide legal/financial advice, make credit decisions, or create risk scores/labels. Provider facts and failures remain independently visible.
- AI calls require timeouts, bounded retries, structured failures, idempotent generation, and tests for malformed/unsafe output and unavailable sources.
- Approved templates are implemented exactly and never paraphrased.
- `ENABLE_FLAG_SUMMARY` remains the separate legacy template-summary flag and defaults to `false` everywhere.
- Never conclude safe/unsafe, high/low risk, approved/rejected, bad payer, or creditworthy.
- Future recovery and risk-score concepts in Figma are not Phase A authorization.

---

## Jobs, Database, and Privacy

- BullMQ payloads are typed and contain identifiers rather than full report data.
- Processors are small, service-driven, idempotent, and retry transient failures only.
- PostgreSQL/Drizzle are the only core database/ORM.
- Schema changes require reviewed migrations and database constraints.
- Do not store PDFs or secrets in PostgreSQL. Guest access tokens must not exist because guest purchase/access is unsupported.
- Search IP data is anonymised/deleted after 90 days.
- Purchased reports require a Clerk owner and verified primary email; report authorization is owner/admin only.

### Database and Financial Rules

- Use migrations for every schema change and review generated SQL.
- Use transactions for coupled event/report/job state where loss or duplication would matter.
- Store timestamps with timezone and compare in UTC.
- Store currency code with integer amounts; never use floating point.
- Add indexes only for documented query patterns and uniqueness/integrity constraints.
- Application deletion never silently removes required payment/audit history.

---

## Logging and Files

- Use the shared Pino logger; never log secrets, tokens, or unnecessary personal data.
- No empty catches or application `console.log` logging.
- Folders/modules are kebab-case; React component files are PascalCase.
- Name files after responsibility.
- Respect workspace exports and avoid private deep imports.

### Environment and Security

- Every environment variable is declared and validated in `packages/config`.
- Secrets never use `NEXT_PUBLIC_*`, appear in client bundles, or receive unsafe defaults.
- Production-required values fail fast when their feature/runtime starts.
- Validate IDs, lengths, enums, URLs, emails, and file inputs at boundaries.
- Apply least privilege, token hashing, secure cookies/headers, rate limits, and server-side authorization.
- Never commit credentials, real provider payloads containing personal data, or production exports.

### Frontend State and Forms

- Server data remains server-owned; client state represents interaction only.
- Do not add global state until multiple independent features genuinely share it.
- Forms share Zod-derived contracts where practical and preserve values after recoverable failure.
- Pages remain Server Components while interactive leaves own browser state.
- Effects synchronize external systems; they do not replace derived render values.

---

## Verification

Preserve tests for Companies House-only free-tier isolation, anonymous limits, authenticated checkout enforcement, server-authoritative credit-pack pricing, webhook idempotency, refund/partial-report paths, owner authorization, AI model/token/prompt boundaries, report immutability, disclaimer presence, and flag-summary behavior.

Run narrow checks during development and repository typecheck, lint, tests, and formatting before completion.

Before a third-party library:

1. Load its installed skill if available.
2. Read `library-docs.md`.
3. Read current installed/official docs.
4. Confirm an existing dependency/platform feature cannot solve the need.

Definition of done includes approved scope, verified UI states, passing acceptance/checks, preserved invariants, handled failures, and updated `ui-registry.md` plus `progress-tracker.md`.

Test naming describes behavior, not implementation. Mock external boundaries, not the domain rule under test. Critical payment/provider/queue tests must include duplicate, timeout, retry, partial, and terminal paths. Do not weaken tests to make a change pass.

### Prohibited Practices

- Business logic in routes/components or database queries in UI.
- Any non-Companies-House provider, Fair Payment Code lookup, CCJ lookup, or AI client in free-tier search/preview/tab composition.
- Fire-and-forget financial/report effects.
- Swallowed errors, unbounded retries, arbitrary sleeps, or hidden partial data.
- Premature microservices, speculative packages/tables, or future-phase implementation.
- Rewording approved legal copy or presenting Figma content as current scope without phase filtering.
