You are working in the InvoiceGuard monorepo.

Read these files first:

1. `context/project-overview.md`
2. `context/architecture-context.md`
3. `context/code-standards.md`
4. `context/ai-workflow-rules.md`
5. `context/execution-roadmap.md`
6. `context/progress-tracker.md`

Current unit:

`packages — types — base shared contracts setup`

The implementation is complete, but validation is blocked because:

`npm run format` fails due to formatting differences in:

`specs/04-base-contracts.md`

This file was outside the original allowed scope for the shared contracts unit, so it was not modified during implementation. The progress tracker records this as the only current blocker.

Task:

Safely resolve ONLY this formatting blocker.

Allowed change:

- Format `specs/04-base-contracts.md` with the existing repository Prettier configuration.

Forbidden:

- Do not modify `packages/types/**`
- Do not modify application source files
- Do not modify business logic
- Do not modify TypeScript contracts
- Do not modify configs unless absolutely necessary
- Do not introduce dependencies
- Do not change roadmap scope

After formatting the file, run:

```bash
npm run format
npm run typecheck
npm run lint
```

Expected result:

- `npm run format` passes
- `npm run typecheck` still passes
- `npm run lint` still passes

Then update `context/progress-tracker.md`:

1. Clear the blocker.
2. Mark `packages — types — base shared contracts setup` as completed.
3. Move it into Completed Units.
4. Set the next current unit to:

`packages — validation — zod validation infrastructure`

5. Update Next Units queue to keep only the next 3 units.
6. Add a session note explaining that `specs/04-base-contracts.md` was formatted only to clear the validation blocker.

Do not make any other changes.

The blocker is specifically the root format failure from `specs/04-base-contracts.md`, while typecheck and lint already pass. :contentReference[oaicite:0]{index=0}
