# InvoiceGuard

InvoiceGuard is a UK company-intelligence platform for SMEs, freelancers, agencies, and
contractors. The active commercial build is Phase A: search for a UK company, review a free
preview, purchase a one-off report, and receive a frozen, timestamped result assembled from
approved public and paid sources.

Invoice chasing, accounting integrations, subscriptions, watchlists, risk scores, and recovery
automation are outside the active phase.

## Canonical project context

Read these files in order before implementation:

1. `context/project-overview.md`
2. `context/architecture.md`
3. `context/ui-tokens.md`
4. `context/ui-rules.md`
5. `context/ui-registry.md`
6. `context/code-standards.md`
7. `context/library-docs.md`
8. `context/build-plan.md`
9. `context/progress-tracker.md`

The context directory is authoritative. `AGENTS.md` contains the non-negotiable workflow rules.

## Repository

- `apps/web`: Next.js App Router UI and thin same-origin API proxies.
- `apps/api`: Express routes, services, repositories, validation, and orchestration.
- `apps/worker`: BullMQ processors and scheduled work.
- `packages/*`: shared configuration, database, integrations, queues, types, UI, and utilities.

## Local verification

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
npm.cmd run format
```

Use the root `pg:generate`, `pg:migrate`, `pg:push`, and `pg:studio` scripts for Drizzle work.

Added a new control repo for test deployments
