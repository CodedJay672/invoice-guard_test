# InvoiceGuard Code Standards

## General Standards

- Keep modules small and single-purpose.
- Do not mix unrelated concerns in one component, route, service, or worker.
- Prefer explicit, readable code over clever abstraction.
- Fix root causes instead of layering workarounds.
- Respect the architecture boundaries defined in `architecture-context.md`.
- Implement only the active unit from `sprint-roadmap.md` and `progress-tracker.md`.

## TypeScript Standards

- Strict TypeScript is required.
- Avoid `any`.
- Use explicit `interface` contracts for object shapes.
- Validate all unknown external input with Zod or equivalent schemas.
- Treat all provider responses as untrusted until validated or normalized.
- Prefer discriminated unions for statuses and provider result states.

Example:

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

## API Route Standards

- Validate input before logic runs.
- Keep route handlers thin.
- Push business logic into services.
- Push external API logic into provider clients.
- Push long-running logic into BullMQ workers.
- Return consistent response shapes.
- Never expose internal stack traces to clients.

Route handler order:

1. Parse and validate input.
2. Resolve auth/admin context if needed.
3. Enforce authorization.
4. Call service.
5. Return typed response.

## Auth and Authorization

- Clerk is the source of authenticated identity.
- Use `clerk_user_id` for user-owned records.
- Admin routes require authenticated Clerk user whose verified email matches `ADMIN_EMAIL`.
- Do not rely on frontend-only checks for admin access.
- Guest report access must use secure random tokens stored as hashes.

## Payment Rules

- Stripe webhook confirmation creates paid report records.
- Frontend redirect must never create a paid report.
- Verify Stripe webhook signature before processing.
- Store every Stripe event ID in `stripe_events` before/while processing to enforce idempotency.
- Duplicate webhook events must not create duplicate reports.
- Refund actions must be logged to `admin_audit_logs`.

## Registry Trust Boundary

Registry Trust is a paid provider and must never be called before payment.

Rules:

- `FreePreviewService` must not import or instantiate `RegistryTrustClient`.
- `RegistryTrustClient` may only be used by paid report generation services/workers after Stripe confirmation.
- Every Registry Trust call must write to `provider_usage_logs`.
- Use £0.80 as estimated query cost for cost modelling unless updated by Lucky.
- Add tests proving free preview never calls Registry Trust.

## Provider Integration Standards

Every provider client must:

- Have a single responsibility.
- Return `ProviderResult<T>`.
- Include `checkedAt` timestamp.
- Apply reasonable timeout.
- Normalize raw response data before handing it to the app.
- Log usage where applicable.
- Avoid throwing raw provider errors into route handlers.

Provider failure handling:

- Companies House failure during paid report generation blocks report and triggers refund path.
- Non-critical provider failures generate partial reports with source status notice.
- Every paid-report provider failure sends an admin alert.

## Report Generation Standards

- Paid reports are frozen historical artifacts.
- Do not update `report_data` after report status becomes `ready`.
- Rechecks create new rows.
- Report JSON should include provider statuses and timestamps.
- Every report must have a timestamped report reference.
- Every report must show mandatory disclaimer.
- Plain English Flag Summary is controlled by `ENABLE_FLAG_SUMMARY`.

## Template and Legal Copy Standards

- Do not write free-form legal/report analysis.
- Implement Master Copy Templates exactly as written.
- Do not paraphrase, simplify, or expand approved wording.
- Any wording change requires Lucky's written approval.
- `ENABLE_FLAG_SUMMARY` defaults to `false` everywhere.
- Mandatory report disclaimer is never controlled by `ENABLE_FLAG_SUMMARY` and must appear from launch.

## Background Job Standards

Use BullMQ for:

- Paid report generation.
- PDF generation.
- Email sending where useful.
- Guest report link expiry.
- Search log IP anonymisation.
- Fair Payment Code scraping.
- Stuck report detection.
- Admin alerting.

Job standards:

- Use typed payloads.
- Use retries for transient provider failures.
- Do not retry invalid payloads indefinitely.
- Record failures visibly.
- Make jobs idempotent where possible.
- Keep job processors small and delegate logic to services.

## Database Standards

- PostgreSQL is the only approved core database.
- Use migrations for schema changes.
- Use constraints for uniqueness and integrity.
- Use indexes for query patterns.
- Do not store PDF binary data in PostgreSQL.
- Do not store raw access tokens or sensitive secrets in plaintext.
- Guest report tokens must be stored hashed.

## Privacy and Retention Standards

- Search log IP data must be deleted or anonymised after 90 days.
- Guest report access links expire after 30 days.
- Underlying guest report data is retained for 12 months.
- Purchased reports for registered users are retained indefinitely unless deletion is requested.
- Stripe payment records are not deleted by app-level account deletion.
- Support GDPR erasure flow when account functionality is implemented.

## UI Code Standards

- Use shadcn/ui components for primitives.
- Do not modify generated shadcn components unless explicitly instructed.
- Keep business logic out of UI components.
- Use feature-level components for product-specific UI.
- Use design tokens from `ui-context.md`.
- Do not use sensational or unsupported risk language.

## Testing Standards

At minimum, test:

- Free preview does not call Registry Trust.
- Stripe webhook idempotency.
- Companies House failure triggers refund-required path.
- Non-critical provider failure creates partial report.
- Guest report token expiry.
- Admin access protection.
- Mandatory disclaimer appears on report payloads.
- `ENABLE_FLAG_SUMMARY=false` shows placeholder.
- Template handlers produce exact approved copy when enabled.

## File Organization

Recommended:

```txt
apps/api/src/routes/
apps/api/src/controllers/
apps/api/src/services/
apps/worker/src/jobs/
apps/web/src/app/
apps/web/src/components/
packages/database/
packages/config/
packages/validation/
packages/integrations/
packages/reports/
packages/companies/
packages/payments/
packages/notifications/
packages/queues/
packages/documents/
```

Name files after responsibility, not technology.
