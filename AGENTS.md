<!-- BEGIN:invoiceguard-agent-rules -->

# InvoiceGuard Agent Instructions

InvoiceGuard is a UK-focused company intelligence and paid report platform. The immediate build is Phase A: company search and paid reports only. Do not implement later-phase features unless the current unit explicitly says to do so.

## Read Before Implementing

Read the following files in order before writing code, changing architecture, or generating implementation specs:

1. `context/project-overview.md` — product definition, commercial goal, phase boundaries, report tiers, and exclusions.
2. `context/architecture-context.md` — system structure, runtime boundaries, storage model, background jobs, and invariants.
3. `context/ui-context.md` — visual language, UI rules, free preview paths, report page conventions, and component usage.
4. `context/code-standards.md` — coding rules, TypeScript standards, API conventions, provider integration rules, and security requirements.
5. `context/ai-workflow-rules.md` — spec-driven development workflow, unit boundaries, planning rules, and completion requirements.
6. `context/sprint-roadmap.md` — sprint-by-sprint implementation plan and unit breakdown.
7. `context/progress-tracker.md` — current implementation state, completed work, blockers, and next unit.

## Non-Negotiable Product Rules

- Phase A is company search and paid reports only.
- Do not build Phase B, C, D, or E until Phase A reaches at least 30 real paid transactions from real users.
- Do not build invoice chasing, invoice upload, Xero, QuickBooks, demand letters, or late payment recovery in Phase A.
- Companies House number is the canonical company identity. Never use company name as identity.
- Registry Trust must never be called before Stripe payment confirmation. There must be no free-preview code path that calls Registry Trust.
- Paid reports are frozen historical artifacts. Never overwrite a delivered report.
- Stripe webhooks, not frontend redirects, create paid reports.
- Every paid report must include mandatory legal disclaimer text from day one.
- `ENABLE_FLAG_SUMMARY` must default to `false`. The Plain English Flag Summary remains hidden until Lucky enables the flag after solicitor sign-off.
- No AI-generated legal wording or free-form report copy. Use approved templates only.
- Admin routes under `/admin` are accessible only to the verified Clerk user whose email matches `ADMIN_EMAIL`.

## Engineering Conduct

- Work on one unit at a time.
- Keep changes small, verifiable, and aligned with the active unit.
- Update `context/progress-tracker.md` after every meaningful implementation change.
- If implementation changes architecture, scope, code standards, or UI rules, update the relevant context file before continuing.
- If a requirement is unclear, add it to Open Questions in `context/progress-tracker.md` instead of guessing.

<!-- END:invoiceguard-agent-rules -->
