# Memory — 18A Premium PDF and Compliance Blocks

Last updated: 2026-07-03 11:36 +01:00

## What was built

- Completed 18A with a development/test-only `/reports/preview/pdf` route that is closed with
  `notFound()` in production.
- Added deterministic Premium complete, long-content, partial-source, and explicit flag-summary
  fixtures under `apps/web/components/premium-pdf/`.
- Added a three-page document preview with immutable identity, source status, entitled report facts,
  AI interpretation, page-one disclaimer, printed issue URL, and print page-break behavior.
- Added `apps/web/components/report-compliance/ReportCompliance.tsx` and reused it for the browser
  report footer and document compliance block.
- Linked the development Premium `ready` PDF state to the preview without adding generation, storage,
  queue, database, or delivery logic.
- Imprinted the page-sheet and compliance patterns into `context/ui-registry.md`; updated
  `context/build-plan.md` and `context/progress-tracker.md` to mark 18A `UI/Mock Verified`.

## Decisions made

- The 18A mock uses deterministic HTML page sheets plus dedicated print CSS; it does not choose or
  emulate the eventual PDF renderer.
- Browser and document compliance presentation share one content contract while retaining
  surface-specific rendering.
- `ENABLE_FLAG_SUMMARY=false` remains canonical. Only the named development fixture enables clearly
  labelled non-production sample copy.
- The document prints a separate provisional fixture issue URL. Approved copy and the real issue
  destination remain deferred to 18B.
- Premium is the only tier with a PDF document surface; Basic and Standard remain excluded.

## Problems solved

- Extended the existing 16A Premium PDF action states into an inspectable document contract without
  coupling UI work to an unselected renderer or object store.
- Preserved real secure report delivery while adding fixture-only preview metadata and navigation.
- Ensured source outcomes are conveyed with text and icons, not colour alone, and protected document
  sections from unsafe print breaks where possible.

## Current state

- 18A is `UI/Mock Verified`. Repository typecheck passed 12 tasks, lint passed 14 tasks, tests passed
  12 tasks, and the production build passed 12 tasks.
- The web suite passes all 38 assertions, including the four new 18A document-contract tests. The
  Next.js build emits `/reports/preview/pdf`, which remains unavailable in production.
- Formatting checks pass for all 18A code and context files.
- No PDF renderer, object storage, generation job, persisted PDF state, or approved production copy
  has been implemented.
- Migration `packages/db/drizzle/0005_glorious_old_lace.sql` remains reviewed but unapplied.

## Next session starts with

1. Run `/remember restore` and confirm this state.
2. Use `/architect` for `18B — Logic/Data: PDF, Storage, Disclaimer, and Templates`.
3. Select the PDF renderer and object-storage provider only after evaluating runtime compatibility,
   deterministic pagination, font handling, secure delivery, lifecycle, and retry semantics.
4. Replace provisional compliance/template fixtures only when exact approved copy and the issue
   destination are available.

## Open questions

- Which PDF renderer and object-storage provider should 18B adopt?
- What is the final mandatory disclaimer wording and approved issue-report destination?
- Registry Trust production contract/credentials and production deployment configuration remain open.
- Production still requires the outstanding real provider credentials and sender/configuration work;
  no secret values are stored here.
