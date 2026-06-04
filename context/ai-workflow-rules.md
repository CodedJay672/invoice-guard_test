# InvoiceGuard Development Workflow

## Approach

Build InvoiceGuard incrementally using a spec-driven workflow.

Context files define what to build, how to build it, what is excluded, and what the current implementation state is. Always implement against the context files. Do not infer product behavior from memory or general SaaS patterns.

## Unit-Based Execution

Work on one implementation unit at a time.

Every unit should have:

- Objective.
- Scope.
- Explicit exclusions.
- Dependencies.
- Database changes, if any.
- API contracts, if any.
- Background jobs, if any.
- UI impact, if any.
- Acceptance criteria.
- Tests/verification steps.

Do not combine unrelated units.

## Current Build Priority

The active product phase is Phase A: company search and paid reports.

Do not implement:

- Phase B accounts/dashboard beyond minimal guest/admin auth needs.
- Phase C watchlists.
- Phase D Pro/Business/Enterprise monitoring.
- Phase E payment signal collection.
- Phase F invoice recovery.

Later phases may appear in architecture for future compatibility, but they are not implementation scope until the proper gate is met.

## Phase Gate Rule

Before building Phase B, C, D, or E, verify:

- Phase A has at least 30 real paid transactions.
- Transactions are real user purchases.
- Refunded/test payments are excluded.
- Lucky confirms Phase A conversion is acceptable.

If conversion is poor, improve Phase A instead of building new phases.

## How To Start a Unit

Before implementing a unit:

1. Read `context/project-overview.md`.
2. Read `context/architecture-context.md`.
3. Read `context/ui-context.md` if there is UI impact.
4. Read `context/code-standards.md`.
5. Read `context/sprint-roadmap.md`.
6. Read `context/progress-tracker.md`.
7. Confirm the current unit is the next unit listed in progress tracker.

## When To Split Work

Split a unit if it combines:

- UI and long-running background jobs.
- Payment processing and report rendering.
- Free preview and paid report generation.
- Admin access and refund processing.
- Multiple unrelated provider integrations.
- Database foundation and feature UI.
- A change that cannot be verified end to end quickly.

## Handling Missing Requirements

Do not guess.

If a requirement is unclear:

1. Add it under Open Questions in `context/progress-tracker.md`.
2. Stop implementation for that ambiguous behavior.
3. Continue only with clearly defined parts of the unit, if safe.

## Protected Rules

The following rules must never be violated:

- Registry Trust is never called before Stripe payment confirmation.
- Companies House number is the canonical company identity.
- Stripe webhooks create paid reports; frontend redirects do not.
- Paid reports are frozen artifacts and are not overwritten.
- Mandatory disclaimer appears on every paid report from day one.
- `ENABLE_FLAG_SUMMARY` defaults to false.
- No AI-generated legal/report copy.
- Admin access requires `ADMIN_EMAIL` allowlist.

## Progress Updates

Update `context/progress-tracker.md` after every meaningful implementation change.

Progress tracker must reflect actual state, not planned state.

Include:

- Completed units.
- Current unit.
- Current status.
- Blockers.
- Open questions.
- Architecture decisions made.
- Tests run.
- Next unit.

## Definition of Done for a Unit

A unit is done only when:

- Its acceptance criteria pass.
- It does not violate any architecture invariant.
- Relevant tests/checks pass.
- Documentation is updated where needed.
- `progress-tracker.md` is updated.
- Any new open questions are recorded.

## Spec Generation Instructions

When asked to generate an implementation spec:

- Use the next unit from `progress-tracker.md`.
- Keep the spec narrow.
- Include explicit non-goals.
- Include file/module suggestions.
- Include acceptance criteria.
- Include tests.
- Include exact status update instructions for progress tracker.

## Review Instructions

When reviewing implementation:

- Check the active unit only.
- Verify no excluded phase work was introduced.
- Verify Registry Trust boundary if relevant.
- Verify payment idempotency if relevant.
- Verify provider failure handling if relevant.
- Verify report immutability if relevant.
- Verify docs/tracker were updated.
