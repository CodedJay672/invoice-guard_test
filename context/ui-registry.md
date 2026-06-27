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

Feature 12 is the canonical public-search implementation. The page remains a Server Component;
interactive state belongs to the smallest practical client leaf.

### Phase A Landing Shell

- Path: `apps/web/app/(landing)/page.tsx`, `apps/web/components/topbar.tsx`, and `apps/web/components/footer.tsx`.
- Last updated: 2026-06-27.
- Purpose: introduce the report product, establish free-source boundaries, and lead directly into canonical company selection.
- Background: hero uses `bg-brand-navy text-content-inverse`; informational sections alternate `bg-surface` and `bg-page` without gradients.
- Structure: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`; content uses responsive grids without fixed content widths.
- Cards: shared `Card` composition with `rounded-lg border border-line bg-surface shadow-sm`.
- Text: headings use `text-brand-navy` or inherited inverse content; supporting copy uses `text-content-muted` or `text-content-inverse/70`.
- Scope: no recovery, subscription, accounting-sync, watchlist, testimonial, or risk-score claims.
- Accessibility: one `main` landmark, labelled primary navigation, semantic section headings, and 44px navigation targets.

### Landing Company Autocomplete

- Path: `apps/web/components/root-searchbar.tsx`.
- Last updated: 2026-06-27.
- Purpose: debounce company-name/number input, render Companies House suggestions, and navigate only after an exact entity is selected.
- Input: shared `Input` with `h-12 bg-surface text-content`, visible semantic focus treatment, and combobox/listbox relationships.
- Results: `rounded-lg border border-line bg-surface shadow-sm`; rows use `min-h-11`, `border-line`, `hover:bg-surface-subtle`, and `focus-visible:ring-focus`.
- States: idle, loading skeleton/status, results, empty, and durable caution error.
- Selection contract: `/search?companyNumber=<canonical-number>&q=<registered-name>`.
- Responsive: form stacks below `sm`; dropdown remains constrained to the search control width.
- Accessibility: explicit accessible name, `aria-autocomplete`, `aria-controls`, `aria-expanded`, labelled listbox, and keyboard-focusable native result buttons.

### Search Page Shell

- Path: `apps/web/components/company-search/PublicSearchShell.tsx`.
- Purpose: public header, Figma-derived navy hero, approved-source trust strip, and factual footer.
- Layout: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`; hero uses `bg-brand-navy text-content-inverse`.
- Responsive: trust items stack below `sm`; header copy may wrap while the wordmark remains intact.
- Accessibility: source strip is a labelled region; decorative icons are hidden.

### Search Control and Result Card

- Path: `apps/web/components/company-search/CompanySearchExperience.tsx`.
- Uses shared `Card`, `Input`, `Button`, `Alert`, `Badge`, and `Skeleton` primitives.
- States: idle, typing, loading, results, empty, invalid, rate-limited, and provider failure.
- Result: `min-h-11 rounded-lg border border-line bg-surface p-4 text-left shadow-sm transition hover:border-brand-teal focus-visible:ring-2 focus-visible:ring-focus`.
- Responsive: input/button stack below `sm`; all cards use `min-w-0` to prevent intrinsic-width overflow.
- Accessibility: explicit label, native form submit, `aria-invalid`, polite loading status, alert semantics, and DOM-order keyboard navigation.

### FreePreview and Fact

- Path: `apps/web/components/company-search/CompanySearchExperience.tsx`.
- States: loading, error, clean, adverse, standard, and source failure.
- Facts: `rounded-md border border-line bg-surface p-3` in a one-to-three-column grid.
- Source failures remain visible with a caution status and never render clean reassurance.
- Adverse findings remain visible when another source fails.

### CourtRecordsCard

- Uses shared `Card tone="navy"` and is always visible after a preview.
- Label uses brand teal; content uses inverse semantic text tokens.
- Never implies court records have already been checked.

### CuriosityCard

- Implemented for clean preview only with `Card` default/positive tones.
- Full-clearance spans the preview column at `md` and uses positive semantic tokens.

### TierCard

- Path: `apps/web/components/company-search/CompanySearchExperience.tsx`.
- Server-authoritative Basic, Standard, and Premium products; fixtures mirror persisted defaults.
- Report rail: `flex min-w-0 flex-col gap-4 lg:sticky lg:top-6 lg:self-start`.
- CTA uses the authoritative navy action pattern and clearly communicates its disabled phase.
- Shows exact price, entitlements, and PDF availability; never introduces subscriptions.

### StatusBadge and Source Banner

- Active/success uses positive tokens; registered/source-failure states use caution tokens.
- Adverse banners use critical tokens; clean reassurance uses positive tokens.
- Colours communicate factual state, not risk judgement.

### Verified State Matrix

| State | Owner | Verified presentation |
| --- | --- | --- |
| Search idle/typing/loading/results/empty | `CompanySearchExperience` | stable form, deterministic fixture, clear result count/status |
| Invalid/rate-limited/provider error | `SearchFeedback` | user-safe alert copy with retry/correction guidance |
| Preview loading/error | `CompanySearchExperience` | preserved search context and durable status |
| Preview clean/adverse/standard/source failure | `FreePreview` | explicit text and icons; never inferred from colour |
| Paid CTA unavailable/ready mock | `TierCard` | disabled reason or keyboard-operable mock action |
| Provider failure | `SourceStatusList` | failed source shown; no clean conclusion |

### Feature 12 Verification

- 2026-06-22: desktop clean, adverse, and source-failure states inspected in Edge.
- 2026-06-22: exact 390px viewport measured with no horizontal overflow; rate-limit state inspected.
- 2026-06-22: keyboard order verified as search input, search button, then Basic/Standard/Premium actions.
- 2026-06-22: Figma node `58:176` compared at pattern level: navy hero, trust strip, one-off pricing, CTA hierarchy, and footer rhythm retained; risk-score/subscription/recovery concepts excluded.
- Fixture query support is development/test-only; production ignores `fixture`.

---

## Known Drift

- No known token, dark-mode, raw-colour, gradient, fixed-content-width, or page-level Client Component drift in the landing/search experience.
- Checkout actions intentionally remain unavailable until Feature 13.
- Physical landing/autocomplete browser verification remains pending because the browser execution bridge was unavailable on 2026-06-27.

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
