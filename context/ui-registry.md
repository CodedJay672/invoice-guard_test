# UI Registry

Living record of InvoiceGuard patterns. Match an existing pattern before inventing one, and update this file after every UI feature.

---

## Shared Primitive

### Button

- Path: `packages/ui/src/components/button.tsx`
- shadcn/CVA shared primitive.
- Product colour intent is composed with semantic InvoiceGuard tokens.
- Do not add domain behavior to the primitive.

---

## Current Search and Preview

All product components currently live in `apps/web/app/page.tsx`. Extract them when the page is next revised; do not add more inline product components.

### Search Page Shell

- Implemented.
- Layout: `mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8`.
- Tier rail: `space-y-4 lg:sticky lg:top-6 lg:self-start`.

### Search Control and Result Card

- Implemented; token cleanup required.
- Card: `rounded-lg border border-line bg-surface p-5 shadow-sm`.
- Input: semantic Input pattern from `ui-tokens.md`.
- Result: `rounded-lg border border-line bg-surface p-4 text-left shadow-sm transition hover:border-brand-teal`.

### FreePreview and Fact

- Implemented with clean, adverse, and standard API-driven variants.
- Header: `rounded-lg border border-line bg-surface p-5 shadow-sm`.
- Facts: `rounded-md border border-line p-3`.

### CourtRecordsCard

- Implemented and always visible.
- `rounded-lg bg-brand-navy p-5 text-content-inverse shadow-sm`.
- Label/CTA use brand teal.
- Never implies court records have already been checked.

### CuriosityCard

- Implemented for clean preview only; token cleanup required.
- Standard: `rounded-lg border border-line bg-surface p-4 shadow-sm`.
- Full-clearance: `rounded-lg border border-positive border-l-4 bg-positive-surface p-4 text-positive-content`.

### TierCard

- Implemented for Basic, Standard, Premium.
- `rounded-lg border border-line bg-surface p-4 shadow-sm`.
- CTA uses the Navy action pattern.
- Shows exact price, entitlements, and PDF availability.

### StatusBadge and Source Banner

- Implemented; token cleanup required.
- Active uses positive tokens; other registered states use caution tokens.
- Adverse banner uses critical tokens; clean banner uses positive tokens.
- Colours communicate factual state, not risk judgement.

---

## Known Drift

`apps/web/app/page.tsx` is a page-level Client Component with inline product components and raw slate/red/green/amber/white utilities. Feature 12 must extract components and replace raw colours with canonical tokens without changing behavior.

### Current State Matrix

| State | Current owner | Required presentation |
| --- | --- | --- |
| Search idle/loading/error/rate-limited | Search page | stable input, clear status, retry guidance |
| Preview loading/error | Search page | preserved company context where possible |
| Preview clean/adverse/standard | `FreePreview` | API-driven, never inferred from colour |
| Paid CTA unavailable | tier/Court cards | disabled reason until checkout exists |
| Provider failure | source banner/status | failure shown, never converted to clean |

---

## Complete-System Figma Patterns

Phase A candidates from node `58:176`:

- `NAV`: wordmark and restrained navigation/action hierarchy.
- `HERO`: company-search hierarchy, trust hints, and snapshot panel.
- `TRUST BAR`: source names, adapted to distinguish free from paid checks.
- One-off report note from GBP 7.99.
- CTA and footer rhythm.

Replace the hero risk score/overdue metrics with factual company identity and source status. Exclude recovery sections, subscriptions, and recovery testimonials.

---

## Planned Registrations

- Report selector and checkout summary.
- Payment/generation status panel.
- Provider source-status list.
- Browser report and guest-access states.
- PDF report primitives.
- Admin table, refund dialog, and audit timeline.

Each future registry entry must include path, purpose, variants/states, exact canonical classes, accessibility behavior, responsive behavior, and known exceptions. A new pattern is not canonical merely because it appears once.
