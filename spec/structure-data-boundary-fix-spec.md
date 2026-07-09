# Structure and Data Boundary Fix Spec

Date: 2026-07-09
Status: Draft for review
Owner decision required before implementation: Yes

## Purpose

This spec describes how to fix the issues found during the codebase review after the recent application-structure changes. It intentionally does not implement code. It is meant to be reviewed and approved before any edits are made.

## Updated Assumptions

- The current client-approved pricing has changed from the older context values.
- The price section component is the source of truth for the authorized public pricing presentation.
- The hardcoded GBP 4.99 "Unlock Full Report" CTA in the search result card is not authorized and should be removed.
- Data fetching for page data should happen from Server Components through server-only DAL functions.
- Mutating requests should happen through Server Actions in `apps/web/actions`.
- Route handlers should remain available only where they are a better fit, such as browser-addressable resources, redirects, downloads, webhooks, or compatibility endpoints.
- Duplicate company/search/preview types should be consolidated so the API, validation layer, web app, and shared packages do not drift.

## Current Findings To Address

### 1. Project Context Is Stale

The active context files still describe old report prices and an older route model.

Files to update after approval:

- `context/project-overview.md`
- `context/architecture.md`
- `context/code-standards.md`
- `context/library-docs.md`
- `context/build-plan.md`
- `context/progress-tracker.md`
- `context/ui-registry.md`, if UI patterns materially change

Planned changes:

- Replace old Basic, Standard, and Premium pricing with the client-approved pricing currently represented by the price section component.
- Document that the price section owns public pricing display.
- Clarify that Server Components call server-only DAL functions for GET/read data.
- Clarify that Server Actions own mutation requests from the web app.
- Clarify allowed route-handler use cases:
  - same-origin browser endpoints needed by browser APIs
  - redirects to short-lived download URLs
  - file/PDF download entrypoints
  - webhook endpoints
  - interoperability endpoints where Server Actions are not suitable
- Update active route documentation for `/search?q=` and `/company/[houseNumber]/**`.
- Preserve the product invariant that free-tier data is Companies House-only unless the client explicitly changes that product rule.

Acceptance criteria:

- Context files no longer contradict current pricing.
- Context files state one web data-access model.
- Context files do not imply the old GBP 7.99, GBP 14.99, GBP 27.00 prices if those are no longer authorized.

## 2. Remove Unauthorized GBP 4.99 CTA

Problem:

- `apps/web/components/company-search/CompanySearchExperience.tsx` renders a hardcoded GBP 4.99 unlock rail and CTA.
- It bypasses the authorized pricing section and introduces a stale purchase path.

Planned fix:

- Remove the entire hardcoded unlock rail from `SearchResultCard`.
- Keep each search result focused on company identity and navigation to the canonical company overview.
- If a CTA remains on search results, it must be neutral and route to the authorized price/report selection surface rather than naming an unauthorized price.

Acceptance criteria:

- No `GBP 4.99`, `£4.99`, or equivalent hardcoded CTA remains.
- Search result cards do not contain stale purchase pricing.
- Public pricing appears only through the authorized pricing component or server-authoritative report product data.

## 3. Data Fetching Boundary

Problem:

- `apps/web/lib/data/search-companies.ts` and `apps/web/lib/data/free-company-prev.ts` hardcode `http://localhost:4000`.
- Some client components still fetch directly:
  - `components/root-searchbar.tsx`
  - `components/checkout/PaymentStatusPanel.tsx`
  - `components/browser-report/BrowserReport.tsx` for PDF retry
- This conflicts with the desired Server Component plus Server Action model.

Planned fix:

### 3.1 Server-Only DAL

Create or normalize DAL functions under `apps/web/lib/data`:

- `searchCompanies(query)`
- `loadFreeCompanyPreview(companyNumber)`
- `loadCheckoutSessionStatus(sessionId, identity)`
- `loadOwnedReport(reportReference, identity)`, already mostly correct
- `loadCompanyOverview(companyNumber)`, if overview becomes separate from free preview
- Later company detail DAL methods as their API endpoints become real:
  - officers
  - filing history
  - charges
  - insolvency
  - CCJ
  - Fair Payment Code
  - AI summary

Rules:

- Every DAL file imports `server-only`.
- Every DAL request uses `loadWebProxyConfig()` and `assertWebProxyProductionConfig()`.
- No DAL request hardcodes hostnames or ports.
- Every outbound API request has:
  - `cache: "no-store"` unless explicitly cached
  - timeout via `AbortController`
  - safe response parsing through shared schemas
  - user-safe failure result
- DAL must not mutate server state.

### 3.2 Server Actions For Mutations

Move mutation requests to `apps/web/actions`:

- Keep `startCheckout` as a Server Action.
- Add a Server Action for PDF retry, for example `retryReportPdf(reportReference)`.
- If checkout status refresh is modeled as a read, keep it in DAL and have the Server Component render updated state. If user-triggered polling must remain client-side, use a route handler only if approved as an exception.

Server Action rules:

- File begins with `"use server"`.
- Try/catch wraps every action.
- Authentication/authorization is verified inside the action.
- Mutations call Express/API through configured server-only proxy settings.
- Mutations revalidate affected paths where UI data changes.
- Server Actions return typed success/error objects and do not expose raw provider/API errors.

### 3.3 Route Handler Exceptions

Keep route handlers only where they are the better fit:

- `/api/reports/[reportReference]/pdf` GET can remain because a browser download/redirect endpoint is useful.
- `/api/reports/[reportReference]/pdf` POST retry should be moved to a Server Action unless a browser API constraint requires the route.
- Same-origin autocomplete route can remain only if the UX requires client-side suggestions before navigation. If kept, document it as an explicit exception. Otherwise, convert the landing search flow to submit/navigate to a Server Component route.
- Stripe webhooks remain route/API endpoints in the API runtime.

Acceptance criteria:

- No hardcoded API origin remains in `apps/web`.
- No unauthorized client-side mutation fetch remains.
- Any remaining client-side GET fetch has a documented reason and no duplicated domain logic.
- `apps/web/lib/data` owns read models used by Server Components.
- `apps/web/actions` owns web-triggered mutations.

## 4. Search and Company Route Flow

Problem:

- `/search?q=` works as a search route, but the landing autocomplete currently builds a query object and then ignores it.
- Company detail routes exist but most are placeholders.
- Overview tab links to `filling-history`, while the actual folder is `filing-history`.
- `SearchPanel` uses `defaultValue` from `q`, but local state starts empty, so submitting without editing fails validation.

Planned fix:

### 4.1 Search Route

- Decide whether landing selection should navigate to:
  - `/search?q=<name>` for search-results-first flow, or
  - `/company/[houseNumber]/overview` for direct selected-company flow.
- If direct company navigation is the chosen flow, remove unused `URLSearchParams` code in `RootSearchBar` and update context.
- If `/search` must remain the canonical query flow, navigate to `/search?q=<selected name>` or `/search?q=<typed query>` as intended.

### 4.2 SearchPanel State

- Initialize `searchInput` from the current `q` value.
- Keep the input controlled rather than mixing `defaultValue` and separate state.
- Preserve the current query after recoverable errors.

### 4.3 Company Route Group

- Fix `filling-history` link to `filing-history`.
- Replace placeholder tab pages with production-shaped states before wiring real data:
  - loading
  - data available
  - source not yet checked
  - source unavailable
  - not entitled or locked, if paid-only
- Do not call paid-only providers in free routes.
- Use `houseNumber` only as canonical Companies House identity.

Acceptance criteria:

- No tab link 404s because of misspelling.
- `/search?q=` supports direct page load and resubmission.
- Company route group either has real read models or explicit source/status presentations, not raw placeholder text.

## 5. Type Consolidation

Problem:

- `@workspace/types` exists, but web does not depend on it.
- Company payload types are duplicated in:
  - `apps/api/src/companies/types.ts`
  - `packages/validation/src/companies.ts`
  - `packages/types/src/companies-house.ts`
- Address fields drift between `addressLine_1` and `addressLine1`.
- Zod parsing can silently drop unknown address fields, causing missing address details in the UI.

Planned fix:

### 5.1 Define Shared Domain DTOs

Create shared DTO types in `packages/types`, likely in a new file:

- `company-address.ts` or `company.ts`
- `CompanyAddressPayload`
- `CompanyPayload`
- `CompanySearchMatchPayload`
- `CompanySearchResponsePayload`
- `FreePreviewPayload`
- free-preview supporting DTOs

Naming decision:

- Use camelCase DTO fields for application/API payloads:
  - `addressLine1`
  - `addressLine2`
  - `postalCode`
  - `poBox`
- Keep provider-normalized Companies House fields separate if needed:
  - `addressLine_1`
  - `addressLine_2`
- Convert provider shape to application DTO shape at the API service/repository boundary.

### 5.2 Align Validation With Shared DTOs

- Keep Zod schemas in `packages/validation`; schemas remain runtime validators.
- Export inferred types only if useful, but do not let inferred types become a competing contract.
- Add type-level checks where practical so Zod inferred payloads satisfy the shared DTO types.

### 5.3 Refactor API and Web Imports

- API service/repository uses shared DTOs from `@workspace/types`.
- Web uses shared DTOs from `@workspace/types` for props/state where runtime parsing is not needed.
- Web still uses `@workspace/validation` schemas at API boundaries.
- Remove or narrow local feature `types.ts` files to service dependency contracts only.

### 5.4 Add Regression Coverage

Tests should prove:

- `registeredOfficeAddress.addressLine1` survives API response parsing.
- Search result address payload does not drop line 1 or line 2.
- API DTO and validation DTO stay type-compatible.

Acceptance criteria:

- No duplicated company payload interfaces remain in app-level `types.ts`.
- Address naming is consistent for public DTOs.
- Provider-specific naming is isolated to integration/provider types.
- Web and API compile against the same shared DTO package.

## 6. Database Schema and Migration Repair

Observed state:

- Current schema has `companies.industryLabel` as `text`.
- `packages/db/drizzle/0007_worthless_loa.sql` contains:
  - `ALTER TABLE "companies" ALTER COLUMN "industry_label" SET DATA TYPE boolean;`
  - new company columns such as cessation date and registered office address fields
- `packages/db/drizzle/0008_chunky_zaladane.sql` changes `industry_label` back to text.
- `npm.cmd run pg:migrate` exits with code 1 after attempting migrations.
- `npx.cmd drizzle-kit check` reports metadata is structurally fine.

Likely cause:

- `0007_worthless_loa.sql` is a bad generated migration. Converting existing `industry_label` text values to boolean is unsafe and likely fails when rows contain non-boolean industry labels.
- Even if `0008` would return the type to text, Drizzle cannot reach `0008` if `0007` fails.

Repair plan:

### 6.1 Verify Applied Migration State

Before editing migration files, inspect the target database:

- Which migration tags are recorded in `drizzle.__drizzle_migrations`.
- Whether `0007_worthless_loa` partially applied.
- Current column list and type for `public.companies.industry_label`.
- Whether the added columns from `0007` exist already:
  - `cessation_date`
  - `registered_office_address_1`
  - `registered_office_address_2`
  - `registered_office_postal_code`
  - `registered_office_po_box`

Important:

- If this is a shared database, do not rewrite already-applied migration history without a deliberate recovery plan.
- If this is a local-only development database and `0007` never recorded as applied, it is acceptable to replace bad generated SQL before retrying.

### 6.2 Fix Pending Migration Path

Preferred local-development fix if `0007` is not recorded as applied:

- Edit `0007_worthless_loa.sql` to remove the `industry_label` text-to-boolean alteration.
- Keep only the intended additive columns.
- Remove `0008_chunky_zaladane.sql` if it exists only to undo the bad boolean change.
- Regenerate Drizzle metadata or regenerate a clean migration so snapshots match schema.

Safer shared-database fix if `0007` is already recorded or partially applied:

- Do not edit migration history.
- Create a new corrective migration that:
  - checks/sets `industry_label` to text
  - adds any missing columns idempotently only if Drizzle/manual SQL strategy allows it
- Manually reconcile the Drizzle migration table only if the database is stuck after a failed transactional migration and the actual schema state is known.

### 6.3 Add Migration Review Guard

Add a lightweight review/test note or script expectation:

- Generated migrations must be inspected for destructive type changes.
- Any `ALTER COLUMN ... SET DATA TYPE` on populated tables must include an explicit rationale and safe `USING` clause where applicable.
- Accidental type flips should be rejected before migrate.

Acceptance criteria:

- `npm.cmd run pg:migrate` exits 0 on the intended local database.
- The `companies.industry_label` column remains text.
- New company columns exist.
- Drizzle check still passes after cleanup.
- No data is lost from existing `companies.industry_label` values.

## 7. Product Copy and Free/Paid Boundary

Problem:

- Landing page copy implies free search checks CCJ records and Fair Payment Code.
- Some text uses credit-decision language or old pricing.
- Free tier should remain Companies House-only unless explicitly changed.

Planned fix:

- Update landing copy to distinguish:
  - free search/preview: Companies House only
  - paid reports: Companies House plus paid/entitled sources
- Remove stale old-pricing references.
- Replace credit-decision style testimonials/copy with factual small-business due-diligence wording.
- Avoid "No CCJs", "No charges", or "Gold FPC" in free-search visual contexts unless explicitly labeled as paid report examples.
- Keep factual language from `context/ui-rules.md`.

Acceptance criteria:

- Free search copy does not imply Registry Trust, Fair Payment Code, Gazette, insolvency/disqualification, or AI has been checked.
- Paid-report copy can mention paid sources, tied to paid report context.
- No stale unauthorized pricing remains.

## 8. Lint and Code Quality Cleanup

Observed failed command:

- `npm.cmd run lint --workspace apps/web`

Current errors include:

- Unused `PublicSearchShell` import in `/search/page.tsx`.
- Async Promise executor and unused `initialState` in `CompanySearchExperience`.
- Unused imports in `search-panel.tsx`, `PublicSearchShell.tsx`, `price-card.tsx`, and `root-searchbar.tsx`.
- Unsafe `target="_blank"` links in `footer.tsx`.
- Unescaped quotes in JSX.

Planned fix:

- Remove unused imports and variables.
- Replace the async Promise executor with direct conditional async flow.
- Add `rel="noreferrer"` to external `_blank` links.
- Escape JSX quotes or restructure text.
- Remove app-level `console.error` logging or replace with approved server logging where needed.

Acceptance criteria:

- `npm.cmd run lint --workspace apps/web` exits 0.
- `npm.cmd run typecheck --workspace apps/web` remains passing.

## 9. Verification Plan

After implementation approval, run:

- `npm.cmd run typecheck --workspace apps/web`
- `npm.cmd run lint --workspace apps/web`
- `npm.cmd run typecheck --workspace apps/api`
- `npm.cmd run test --workspace apps/web`
- `npm.cmd run test --workspace apps/api`
- `npm.cmd run test --workspace packages/validation`
- `npm.cmd run test --workspace packages/types`, if tests are added there
- `npx.cmd drizzle-kit check`
- `npm.cmd run pg:migrate` against the intended development database after migration repair

If changes touch shared packages broadly, run repository-level:

- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run test`

Manual/browser verification after implementation:

- `/` search entry.
- `/search?q=<company>` direct load.
- Search resubmit with prefilled query.
- Company overview navigation tabs.
- Company route placeholders or real states on mobile and desktop.
- Pricing section contains the only authorized pricing display.
- PDF retry/download behavior if changed.

## Implementation Order

1. Confirm client-approved pricing values from the existing price section and update context records.
2. Repair migration history/path based on actual applied database state.
3. Consolidate shared DTO types and align validation schemas.
4. Normalize DAL and Server Action boundaries.
5. Fix search/company route flow and remove unauthorized CTA.
6. Clean product copy around free vs paid source checks.
7. Fix lint errors and app logging.
8. Run verification commands and update `progress-tracker.md` plus `ui-registry.md` where required.

## Open Questions For Approval

1. Should landing autocomplete select a company and go directly to `/company/[houseNumber]/overview`, or should it always navigate through `/search?q=` first? remove the autocomplete and go throught `/search?q=` to list all search results for the user to click a particular company to see details of.
2. Is the client-approved pricing exactly whatever is currently rendered in `apps/web/components/price-card.tsx`, or should those values also be checked against database-seeded report products? the `apps/web/components/price-card.tsx` has the client approved pricing. the database should be updated to reflect this too.
3. Is the current development database disposable, or should migration repair preserve and reconcile existing migration history? the database is disposable
4. Should client-side autocomplete remain as a documented route-handler exception, or should the search UX become form-submit/server-rendered only? No need for the autocomplete anymore the form should take the user to `/search?q=` server page.
