# Memory — AUTH-C Registration Before Payment

Last updated: 2026-07-02

## What was built

- Completed AUTH-C across web, API, Stripe webhook processing, database schema, queues, fixtures,
  and tests.
- Signed-out buyers now enter Clerk sign-up with a validated checkout return path; unverified users
  see a blocking verification state; only verified Clerk owners can create checkout sessions.
- Checkout status and paid reports are bound to the verified Clerk owner. Webhook processing rejects
  missing or malformed owner metadata.
- Added guarded forward migration `packages/db/drizzle/0003_wandering_punisher.sql`. It aborts when
  ownerless reports exist, then makes `clerk_user_id` non-null and removes guest columns/indexes.
- Free preview now calls Companies House only and returns explicit `notYetCheckedSources` for Gazette,
  insolvency/disqualification, Registry Trust, and AI interpretation.
- Removed guest validation, queue naming/tasks, fixtures, access states, and unsupported clean/adverse
  free-preview conclusions.
- Updated `context/ui-registry.md`, `context/build-plan.md`, and `context/progress-tracker.md`.

## Decisions made

- No guest purchase, bearer-token report access, or fabricated ownership is permitted.
- Existing ownerless rows are never silently deleted or assigned; the AUTH-C migration fails safely.
- Browser checkout payloads contain company, tier, and attempt ID only. Verified owner identity and
  email travel through the signed server-to-server principal.
- Free preview exposes Companies House facts only; every other source is presented as not yet checked.

## Problems solved

- API route tests leaked HTTP listeners when assertions failed. Per-test cleanup now closes every
  tracked server, so focused and aggregate suites terminate normally.
- Restored the anonymous search limit to the documented five searches per hashed IP per 24 hours.
- Replaced session-ID-only payment polling with authenticated owner-scoped status checks.

## Current state

- AUTH-C is complete and recorded in the tracker.
- Typecheck passed 12 tasks; lint passed 14 tasks; aggregate tests passed 12 tasks.
- Focused tests passed: API 25, web 16, worker 11.
- Production build passed 12 tasks and all current Next.js routes compiled.
- The AUTH-C migration is generated and reviewed but has not been applied to a database.
- Paid-provider and Anthropic report generation remain future work in 15A/15B.

## Next session starts with

1. Run `/remember restore` and confirm this state.
2. Use `/architect` for `15A — UI/Mock: Paid Source, Tier, and AI Interpretation Sections`.
3. Build the complete paid-report state matrix before starting 15B logic/data work.

## Open questions

- Final mandatory disclaimer wording and issue-report address remain production blockers.
- Registry Trust production credentials/operations and PDF/object-storage selection remain unresolved.
- Anthropic integration must use `claude-haiku-4-5-20251001` with `max_tokens: 1500` in Phase A.
