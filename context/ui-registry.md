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

### Brand Asset System

- Path: `context/designs/brand_asset.png` and `packages/ui/src/styles/globals.css`.
- Last updated: 2026-07-01.
- Logo: ascending emerald/slate bars, shield-check mark, and `InvoiceGuard` wordmark; preserve the
  documented clear space and use the standalone shield/bar icon for compact surfaces.
- Primary: `bg-brand-navy` (`#001B4D`) and `bg-brand-teal` (`#12D6A0`).
- Neutrals: dark background `#020817`, slate 700 `#334155`, slate 200 `#E2E8F0`, slate 100
  `#F8FAFC`, and white.
- Typography: Inter only; 64/800 display, 48/700 heading, 32/600 subheading, 24/600 section title,
  18/400 large body, 16/400 body, 14/400 caption, and 12/400 meta.
- Buttons: 12px radius, 12px/20px padding, Inter 600, 18px outline icon. Primary uses emerald with
  navy text; secondary uses white, navy text, and slate-200 border.
- Icons: rounded two-pixel outline, normally navy.
- Gradient: navy-to-emerald at 90 degrees and used sparingly.
- Product constraint: risk/signal swatches and score visuals shown in the brand guide are not active
  product patterns. No risk score, risk band, or company-quality verdict may be added.
- Production logos: `apps/web/public/light mode logo.png` on light surfaces and
  `apps/web/public/dark mode logo.png` on dark/navy surfaces. These variants do not establish full
  application dark mode.

### Local Design Reference Set

- Paths: `context/designs/landing_page.html`, `landing_page.png`,
  `free-preview-suggestions.png`, `paid-search-result.png`, and `payment-page.png`.
- Last updated: 2026-07-02.
- `landing_page.html` is the implementation template and `landing_page.png` is the screenshot target
  for the Phase A landing page. The remaining images are flow-specific visual references.
- Local Phase A references take precedence over the complete-system Figma when they conflict on
  layout details; product scope, factual-language, semantic-token, accessibility, and no-risk-score
  rules still take precedence over every design artifact.

### Phase A Landing Shell

- Path: `apps/web/app/(landing)/page.tsx`, `apps/web/components/topbar.tsx`, and `apps/web/components/footer.tsx`.
- Last updated: 2026-07-01.
- Purpose: introduce the report product, establish free-source boundaries, and lead directly into canonical company selection.
- Background: hero may use `bg-brand-navy text-content-inverse`; informational sections alternate
  `bg-surface` and `bg-page`. The brand gradient is reserved for sparse emphasis.
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
- CTA uses the authoritative navy action pattern, remains disabled until a company preview exists,
  then navigates with canonical company number, tier, and display-only company name.
- Shows exact price, entitlements, and PDF availability; never introduces subscriptions.

### StatusBadge and Source Banner

- Active/success uses positive tokens; registered/source-failure states use caution tokens.
- Adverse banners use critical tokens; clean reassurance uses positive tokens.
- Colours communicate factual state, not risk judgement.

### Verified State Matrix

| State                                         | Owner                     | Verified presentation                                         |
| --------------------------------------------- | ------------------------- | ------------------------------------------------------------- |
| Search idle/typing/loading/results/empty      | `CompanySearchExperience` | stable form, deterministic fixture, clear result count/status |
| Invalid/rate-limited/provider error           | `SearchFeedback`          | user-safe alert copy with retry/correction guidance           |
| Preview loading/error                         | `CompanySearchExperience` | preserved search context and durable status                   |
| Preview clean/adverse/standard/source failure | `FreePreview`             | explicit text and icons; never inferred from colour           |
| Paid CTA unavailable/ready mock               | `TierCard`                | disabled reason or keyboard-operable mock action              |
| Provider failure                              | `SourceStatusList`        | failed source shown; no clean conclusion                      |

### Feature 12 Verification

- 2026-06-22: desktop clean, adverse, and source-failure states inspected in Edge.
- 2026-06-22: exact 390px viewport measured with no horizontal overflow; rate-limit state inspected.
- 2026-06-22: keyboard order verified as search input, search button, then Basic/Standard/Premium actions.
- 2026-06-22: Figma node `58:176` compared at pattern level: navy hero, trust strip, one-off pricing, CTA hierarchy, and footer rhythm retained; risk-score/subscription/recovery concepts excluded.
- Fixture query support is development/test-only; production ignores `fixture`.

---

## Checkout and Payment Status

Feature 13A establishes the Phase A one-off checkout and browser-return presentation. Pages remain
Server Components; form validation and bounded status checks live in small client leaves.

### Checkout Summary

- Path: `apps/web/components/checkout/CheckoutShell.tsx`.
- Layout: `mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6
lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8`.
- Summary rail moves below the form in DOM/mobile order and becomes sticky at `lg`.
- Company name wraps without becoming identity; the monospace Companies House number remains the
  canonical identifier.
- Product presentation uses shared Card and Badge primitives with exact one-off price, entitlement
  list, and explicit PDF/browser-report status.
- No subscription, risk score, or unverified payment language appears.

### Checkout Form

- Path: `apps/web/components/checkout/CheckoutForm.tsx`.
- Historical implementation note: guest was originally the default state. The 2026-07-02 client
  decision supersedes it; AUTH-C must replace this with a registration/sign-in gate and a verified,
  read-only owner email. No new feature may extend the guest pattern.
- Email errors use `aria-invalid`, a linked description, and an alert role while preserving input.
- Redirecting disables the field and primary action and uses visible text plus a spinner.
- The caution Alert states that a browser return never confirms payment.
- No email or other personal data is placed in checkout/status URLs.

### Payment Status Panel

- Path: `apps/web/components/checkout/PaymentStatusPanel.tsx`.
- Canonical states: confirming, paid/report-pending, delayed confirmation, cancelled, failed, and
  duplicate refresh.
- State is always communicated through heading, badge text, icon, and Alert copy rather than colour
  alone.
- Confirmation is bounded to three two-second mock checks; delayed confirmation exposes a safe,
  idempotent `Check again` action.
- Cancelled and failed states preserve the company/tier return link. Paid and duplicate-refresh
  states never expose a second purchase action.
- Fixture query support is development/test-only; production ignores `fixture`.

### Feature 13A Verification

- Repository formatting, typecheck, lint, unit tests, and production build pass.
- Selection parsing, tier rejection, guest email normalization, production fixture guards, and
  privacy-safe checkout URLs have executable tests.
- Physical desktop/mobile/focus/navigation verification remains pending because the in-app browser
  bridge rejected initialization before opening localhost on 2026-06-28.
- A fresh 2026-06-28 retry successfully started the development fixture server, but the browser
  bridge again rejected initialization before a tab opened. No checkout or payment-status state was
  counted as physically verified, and no screenshots were captured.
- 2026-06-28: 13A accepted as `UI/Mock Verified` under the project-wide automated gate policy. User
  manual QA remains available but does not block paired Logic/Data work.

### Feature 13B Live Checkout Wiring

- Path: `apps/web/components/checkout/CheckoutForm.tsx` and `PaymentStatusPanel.tsx`.
- Last updated: 2026-06-28.
- Existing Card, Alert, Input, Badge, and authoritative/outline Button patterns remain unchanged.
- Live checkout preserves the same spacing, semantic colour tokens, focus behavior, and responsive
  shell as 13A; only the data/navigation behavior changes.
- A cancellation return uses the canonical caution Alert. Payment initiation disables the form and
  status polling retains visible text plus `aria-live` updates.
- Development/test fixtures remain deterministic; production ignores fixture query values.

---

## Known Drift

- No known token, dark-mode, raw-colour, gradient, fixed-content-width, or page-level Client Component drift in the landing/search experience.
- Checkout and payment-status UI are `UI/Mock Verified` through automated state and contract coverage;
  user manual QA is non-blocking.
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

---

## Authentication and Buyer Identity

Feature AUTH-A establishes development/test-only authentication presentation before Clerk wiring.
Production renders the mock auth routes as not found and omits mock account navigation.

### Authentication Card

File: `apps/web/components/auth/AuthPanel.tsx`
Last updated: 2026-06-29

| Property           | Class/pattern                                                                      |
| ------------------ | ---------------------------------------------------------------------------------- |
| Background         | shared `Card` / `bg-surface`                                                       |
| Border             | shared `Card` / `border-line`                                                      |
| Border radius      | shared `Card` / `rounded-lg`                                                       |
| Text — primary     | `text-brand-navy`, `text-content`                                                  |
| Text — secondary   | `text-content-muted`                                                               |
| Spacing            | card sections with `gap-4` or `gap-5`; public wrapper `px-4 py-10 sm:px-6 lg:px-8` |
| Interactive states | shared Button/Input focus rings using `focus` token                                |
| Shadow             | shared Card subtle elevation                                                       |
| Accent usage       | semantic Badge and Alert variants; authoritative navy action                       |

**Pattern notes:** Sign-in, sign-up, callback/loading, error, signed-in, signing-out, and
unverified-email states share one stable card structure. Loading and state changes include visible
text and `aria-live`. Authentication is now mandatory before payment; the guest-checkout presentation
is historical and must be removed by AUTH-C.

### Public Account Control

File: `apps/web/components/auth/AccountControl.tsx`
Last updated: 2026-06-29

| Property         | Class/pattern                                           |
| ---------------- | ------------------------------------------------------- |
| Background       | `bg-surface` through outline Button and menu panel      |
| Border           | `border-line`                                           |
| Border radius    | `rounded-md` trigger; `rounded-lg` menu                 |
| Text — primary   | `text-content`                                          |
| Text — secondary | `text-content-muted`                                    |
| Spacing          | `p-2` menu, `px-2 py-2` metadata, minimum 44px controls |
| Hover state      | shared outline/ghost Button variants                    |
| Shadow           | `shadow-sm` on menu panel                               |
| Accent usage     | none; account navigation remains restrained             |

**Pattern notes:** Signed-out navigation shows one quiet Sign in action. Signed-in navigation shows
the verified email and a sign-out-only menu—no dashboard links. Escape restores trigger focus and
outside pointer interaction closes the menu.

### Report Access State

File: `apps/web/components/auth/ReportAccessState.tsx`
Last updated: 2026-06-29

| Property         | Class/pattern                                                           |
| ---------------- | ----------------------------------------------------------------------- |
| Background       | shared Card plus semantic Alert surface                                 |
| Border           | shared Card and semantic Alert border                                   |
| Border radius    | shared `rounded-lg` Card/Alert                                          |
| Text — primary   | shared Card/Alert semantic content                                      |
| Text — secondary | `text-content-muted`                                                    |
| Spacing          | shared Card sections; header `gap-4`                                    |
| Hover state      | none                                                                    |
| Shadow           | shared Card subtle elevation                                            |
| Accent usage     | positive owner, caution authentication/verification, critical non-owner |

**Pattern notes:** Status is always repeated through badge, heading, icon, and explanatory text.
Guest fixtures are obsolete under the 2026-07-02 no-guest-purchase decision. AUTH-C/16B must retain
owner, signed-out, verification-required, and non-owner outcomes and authorize server-side before
returning report data.

### Paid AI Interpretation Block (Planned in 15A)

- Required states: loading, ready, partial-source, unavailable/failed, and safety fallback.
- Required metadata: clear `AI interpretation` label and factual source-status context; model/internal
  prompt details need not be exposed in the primary UI.
- Facts remain visually primary and independently readable. Interpretation cannot hide provider
  failures, imply unchecked sources were checked, or render legal/financial advice, credit decisions,
  risk scores, or safe/unsafe verdicts.
- Applies to Basic, Standard, and Premium in Phase A.

### Live Clerk Authentication Surface

File: `apps/web/components/auth/ClerkAuthScreen.tsx`
Last updated: 2026-06-29

| Property           | Class/pattern                                                     |
| ------------------ | ----------------------------------------------------------------- |
| Background         | Clerk shadcn theme bound to `surface`/`page` semantic variables   |
| Border             | Clerk shadcn theme bound to `line`                                |
| Border radius      | `0.625rem`, matching the canonical medium radius                  |
| Text — primary     | Clerk foreground bound to `content`                               |
| Text — secondary   | Clerk muted foreground bound to `content-muted`                   |
| Spacing            | public wrapper `max-w-lg px-4 py-10 sm:px-6 lg:px-8`              |
| Interactive states | Clerk ring bound to `focus`; primary action bound to `brand-navy` |
| Shadow             | Clerk shadcn default subtle elevation                             |
| Accent usage       | semantic InvoiceGuard variables only; no raw Tailwind colours     |

**Pattern notes:** Production `/sign-in` and `/sign-up` use Clerk's embedded, path-routed components.
AUTH-A fixtures remain development/test-only and reuse `AuthPanel`. Safe Phase A return paths remain
the only caller-controlled fallback destinations. The public account control now uses the same
registered outline/menu pattern with Clerk-backed sign-out and a distinct unverified-email label.

### AUTH-B Verification

- 2026-06-30: repository typecheck, lint, tests, formatting, and production build verified.
- Clerk doctor verified host authentication, project linkage, development instance, and application
  reachability. Production instance setup remains a deployment concern.
- Signed principal rejection, verified-email checkout ownership, guest regression, and safe return
  paths have executable coverage.

---

## Report Generation Lifecycle

### Report Lifecycle Panel

File: `apps/web/components/report-lifecycle/ReportLifecyclePanel.tsx`
Last updated: 2026-06-30

| Property           | Class/pattern                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| Background         | shared Card `bg-surface`; progress panel `bg-surface-subtle`                                             |
| Border             | shared `border-line`; semantic Alert borders for factual state                                           |
| Border radius      | shared Card/Alert `rounded-lg`; progress panel `rounded-lg`                                              |
| Text — primary     | `text-brand-navy`, `text-content`                                                                        |
| Text — secondary   | `text-content-muted`                                                                                     |
| Spacing            | public wrapper `px-4 py-10 sm:px-6 lg:px-8`; content `gap-5`; actions `gap-3`                            |
| Interactive states | existing authoritative and outline Button focus/hover patterns                                           |
| Shadow             | shared Card subtle elevation                                                                             |
| Accent usage       | positive for ready/refunded, caution for generating/partial/delayed, critical for failed/refund-required |

**Pattern notes:** Pending, generating, slow/stuck, ready, partial, failed, refund-required,
refund-processing, and refunded states share one stable status card. Every state repeats meaning through
badge, heading, icon, Alert copy, and live progress text. Actions stack on mobile and become a row from
`sm`; checking status is explicitly idempotent and never suggests starting another purchase. Fixture
query values and automated transitions are development/test-only.
