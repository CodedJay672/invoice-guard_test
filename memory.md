# Memory — Landing/Search Refinement and Phase 13A Handoff

Last updated: 2026-06-28 13:50 +01:00

## What was built

- Reworked `/` into a Phase A landing page with a debounced Companies House autocomplete in `apps/web/components/root-searchbar.tsx`.
- Company selection now navigates to `/search` with the canonical company number and registered name; the search page automatically loads the selected free preview.
- Removed future-phase recovery, subscription, risk-score, accounting-sync, watchlist, testimonial, and unsupported marketing claims from the public landing experience.
- Simplified the public top bar and footer and removed fixed-width/gradient presentation drift.
- Extended the Companies House adapter with alphabetical search, registered-office-address, and insolvency endpoints, including mock implementations and normalization coverage.
- Updated `context/project-overview.md`, `architecture.md`, `build-plan.md`, `ui-registry.md`, and `progress-tracker.md` to reflect the landing/search split and verification state.

## Decisions made

- Companies House number remains canonical identity; the `q` value passed to `/search` is display context only.
- `/` owns first-entry discovery, while `/search` owns the full search, free-preview, and report-tier experience.
- Landing-page content is strictly Phase A company intelligence and one-off reports.
- Interactive landing behavior remains isolated in the smallest client component; the landing page stays server-rendered.

## Problems solved

- Fixed the previous search hook, which only changed the landing URL instead of selecting a company and navigating.
- Fixed `/search` ignoring landing-page selection parameters.
- Removed lint errors, stale hook dependencies, malformed utilities, fixed-width overflow risks, and generated placeholder actions.
- Updated API test doubles after the Companies House client contract gained address and insolvency methods.

## Current state

- Repository formatting, typecheck, lint, and tests pass. The test suite reports 34 executable assertions.
- The web production build passes; `/` is static and `/search` is dynamic.
- The UI patterns are imprinted in `context/ui-registry.md`.
- Physical landing/autocomplete browser QA is still pending because the in-app browser execution bridge rejected initialization. This limitation is recorded in the tracker and registry.
- The working tree contains the landing/search refinement plus the developer's Companies House documentation additions; nothing has been committed.

## Next session starts with

1. Run `/remember restore` and confirm this state.
2. Complete the `/architect` language-alignment step for Phase 13A — Checkout and Payment Status.
3. Confirm or correct the five proposed terms: checkout summary, guest buyer, paid/pending, delayed confirmation, and duplicate refresh.
4. After vocabulary alignment, work through the architecture decisions one at a time and produce the Phase 13A blueprint. Do not implement until the developer explicitly confirms it.

## Open questions

- Does the proposed Phase 13A vocabulary match the developer's intended checkout flow?
- Should physical landing/autocomplete browser QA be completed before Phase 13A UI work begins, once browser tooling is available?
- Final mandatory disclaimer wording and issue-report address remain unresolved production blockers.
- Registry Trust operational details and PDF/object-storage choices remain unresolved for their later scheduled phases.
