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

### Landing Company Search

- Path: `apps/web/components/root-searchbar.tsx`.
- Last updated: 2026-07-09.
- Purpose: submit a company-name/number query to `/search?q=...` without autocomplete or browser-side provider calls.
- Input: shared `Input` with `h-12 bg-surface text-content` and visible semantic focus treatment.
- States: idle, invalid, and submitting.
- Navigation contract: `/search?q=<query>`.
- Responsive: form stacks below `sm`; dropdown remains constrained to the search control width.
- Accessibility: explicit accessible name, native form submit, icon-hidden decoration, and no suggestion listbox.

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
- Last updated: 2026-07-02 (AUTH-C).
- States: loading, Companies House factual result, non-active company status, and Companies House failure.
- Facts: `rounded-md border border-line bg-surface p-3` in a one-to-three-column grid.
- Free preview and company tabs display exactly one free provider family: Companies House. Overview,
  filing history, charges, officers, and insolvency are Companies House-backed; CCJs, Fair Payment
  Code, and AI Summary remain paid placeholders.
- Paid-only sources use a separate `Not yet checked` Card with `border-line`, `bg-surface`,
  `text-content-muted`, and outline Badges. It never renders clean/adverse conclusions.

### CourtRecordsCard

- Uses shared `Card tone="navy"` and is always visible after a preview.
- Label uses brand teal; content uses inverse semantic text tokens.
- Never implies court records have already been checked.

### CuriosityCard

- Uses the default shared Card for factual locked questions only.
- Positive/full-clearance variants are prohibited because Companies House-only preview cannot support
  a clearance conclusion.

### TierCard

- Path: `apps/web/components/company-search/CompanySearchExperience.tsx`.
- Last updated: 2026-07-09.
- Server-authoritative credit-pack products: Single Report, Starter Pack, Business Pack, and Agency Pack; fixtures mirror persisted defaults.
- Report rail: `flex min-w-0 flex-col gap-4 lg:sticky lg:top-6 lg:self-start`.
- CTA uses the authoritative navy action pattern, remains disabled until a company preview exists,
  then navigates with canonical company number, product code, and display-only company name.
- Shows exact price and full-report entitlement summary; never introduces subscriptions or report-depth tiers.

### Company Route Source State

- Path: `apps/web/components/company-workspace/CompanyWorkspace.tsx`,
  `apps/web/components/company-workspace/MobileTabSelect.tsx`,
  `apps/web/components/company-workspace/fixtures.ts`, and
  `apps/web/app/(landing)/company/[houseNumber]/**/page.tsx`.
- Last updated: 2026-07-10 (12D design refinement).
- Purpose: keep public company navigation available while making free Companies House tabs and paid-only source boundaries explicit.
- Pattern: reusable company workspace shell with `bg-page`, `bg-surface`, `border-line`,
  semantic Badge/Alert/Card primitives, shared masthead, route-based desktop tabs, and a native
  mobile selector.
- States: Companies House overview, charges, insolvency, officers, and filing history render live
  Companies House data in production with deterministic populated, empty/no-records, loading, and
  source-failed fixtures only in development/test. Tab order is Overview, AI Summary, Charges,
  Insolvency, Officers, Filing History, CCJs, Fair Payment Code. Filing history, charges, and
  officers use compact server-pagination links with the existing
  `rounded-md border border-line bg-surface px-3 py-2` navigation pattern and
  `focus-visible:ring-2 focus-visible:ring-focus`. CCJ and Fair Payment Code render
  paid/not-yet-checked placeholders. AI Summary renders a paid blurred/skeleton placeholder for free
  users and states that it summarizes Companies House overview data only.
- Record cards: Charges, insolvency, and officers use `overflow-hidden rounded-lg border bg-surface
  shadow-sm`, `p-4` content, and `gap-4` stacks. Outstanding charges and insolvency cases use
  `border-critical bg-critical-surface text-critical-content`; active officers use
  `border-positive bg-positive-surface`; resigned officers fall back to
  `border-line bg-surface-subtle`. Detail rows use the shared fact-grid cells and compact practitioner
  rows use `rounded-md border border-line bg-surface-subtle px-3 py-2`.
- Paid interpretation placeholders inside free tabs use `rounded-lg border border-line
  bg-surface-subtle p-4`; only the teaser lines receive `blur-sm select-none`. Official Companies
  House facts must remain readable, unblurred, and source-attributed.
- Accessibility: desktop links use `aria-current="page"` for the active tab; the mobile selector has
  an explicit label and native keyboard behavior. Factual Companies House data is never blurred, and
  no inferred clean/adverse conclusion is rendered from paid sources that were not checked.
- Fixture guard: `fixture` query states are development/test-only. Production free-tab requests go
  through the same-origin proxy/DAL and must show a failure state if Companies House fails; no ACME
  identity or fixture facts may replace a real request.

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
- 2026-06-22: historical keyboard order verified as search input, search button, then report actions; current credit-pack actions use the same ordering pattern.
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
- Last updated: 2026-07-02 (AUTH-C).
- Signed-out users are redirected to sign-up with a validated checkout return path before this form renders.
- Verified ownership uses `rounded-lg border border-line bg-page p-4`, `text-content`, and
  `text-content-muted`; the browser never submits or edits an email address.
- Unverified users see the canonical caution Alert and a disabled payment action while selection remains visible.
- Redirecting disables the primary action and uses visible text plus a spinner.
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
- Selection parsing, tier rejection, verified-owner/verification-required states, production fixture guards, and
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

- 2026-07-02 15B completion changed worker, provider, persistence, and entitlement contracts only.
  Existing paid-report source, interpretation, recovery, and refund-required UI patterns remain
  canonical and required no visual changes.
- 2026-07-02 15B Claude sub-slice changed worker/data contracts only. The registered Paid AI
  Interpretation Block remains the canonical presentation and required no visual or token changes.
- 2026-07-10 Companies House account payload normalization changed data contracts only. Company
  overview and search UI patterns remain unchanged.

- No known token, dark-mode, raw-colour, gradient, fixed-content-width, or page-level Client Component drift in the landing/search experience.
- Checkout and payment-status UI are `UI/Mock Verified` through automated state and contract coverage;
  user manual QA is non-blocking.
- Physical landing/search browser verification remains pending because the browser execution bridge was unavailable on 2026-06-27.

---

## Complete-System Figma Patterns

Phase A candidates from node `58:176`:

- `NAV`: wordmark and restrained navigation/action hierarchy.
- `HERO`: company-search hierarchy, trust hints, and snapshot panel.
- `TRUST BAR`: source names, adapted to distinguish free from paid checks.
- One-off report note from GBP 20.
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
Last updated: 2026-07-02 (AUTH-C)

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
Owner, signed-out, verification-required, and non-owner outcomes are the only report-access patterns.
Authorization is server-side before report or checkout-status data is returned.

### Paid Source Status and Fact Sections

File: `apps/web/components/paid-report/PaidReportSections.tsx`
Last updated: 2026-07-02 (15A)

| Property           | Class/pattern                                                              |
| ------------------ | -------------------------------------------------------------------------- |
| Background         | shared Card `bg-surface`; fact cells `bg-surface-subtle`                   |
| Border             | shared `border-line`; semantic Alert and Badge variants for source state   |
| Border radius      | shared Card/Alert `rounded-lg`; fact cells `rounded-md`                    |
| Text — primary     | `text-brand-navy`, `text-content`                                          |
| Text — secondary   | `text-content-muted`                                                       |
| Spacing            | page `gap-6`; cards and grids `gap-3`/`gap-4`; fact cells `p-3`            |
| Interactive states | fixture links and recovery actions use shared semantic focus-ring patterns |
| Shadow             | shared Card subtle elevation                                               |
| Accent usage       | positive/caution/critical communicate factual source or operation state    |

**Pattern notes:** Source success, failed, unavailable, stale, pending, and not-entitled states
always combine an icon, Badge text, detail, and timestamp where available. Tier-entitled factual
sections are omitted when unavailable or not included; paid reports never use blurred teaser data.
Companies House failure suppresses every factual section and enters the refund-required presentation.

### Paid AI Interpretation Block

File: `apps/web/components/paid-report/PaidReportSections.tsx`
Last updated: 2026-07-02 (15A)

| Property           | Class/pattern                                                        |
| ------------------ | -------------------------------------------------------------------- |
| Background         | shared Card `bg-surface`                                              |
| Border             | `border-brand-teal` on the containing Card                            |
| Border radius      | shared Card/Alert `rounded-lg`                                        |
| Text — primary     | `text-brand-navy`, `text-content`                                     |
| Text — secondary   | `text-content-muted`                                                  |
| Spacing            | Card composition with `gap-3`/`gap-4`; interpretation copy `leading-6` |
| Interactive states | none; interpretation is read-only                                     |
| Shadow             | shared Card subtle elevation                                          |
| Accent usage       | teal border/label; caution Alert for partial, unavailable, or withheld |

**Pattern notes:** Loading, ready, partial-source, unavailable/failed, and safety-fallback states
share one stable block. The screenshot reference contributes the labelled inset hierarchy only;
canonical InvoiceGuard tokens replace its blue treatment. Facts remain independently readable and
visually primary. Unavailable sources are named, and unsafe generated wording is withheld rather
than displayed.

### Registry Trust Recovery Action

File: `apps/web/components/paid-report/RecoveryAction.tsx`
Last updated: 2026-07-02 (15A)

| Property           | Class/pattern                                           |
| ------------------ | ------------------------------------------------------- |
| Background         | shared outline Button `bg-surface`                      |
| Border             | `border-line` through the shared Button                 |
| Border radius      | shared Button `rounded-md`                              |
| Text — primary     | shared Button `text-content`                            |
| Text — secondary   | helper copy `text-xs text-content-muted`                |
| Spacing            | `gap-2` between action and durable result copy          |
| Interactive states | shared hover/focus patterns; result announced politely  |
| Shadow             | shared outline Button subtle shadow                     |
| Accent usage       | caution parent Alert owns the operational-state colour |

**Pattern notes:** Current credit-pack products offer the same free-recheck recovery action.
The 15A fixture action is explicitly non-destructive and reports that no request was sent; 15B may
replace the handler without changing this presentation contract.

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

---

## Browser Reports

### Paid Browser Report Shell

File: `apps/web/components/browser-report/BrowserReport.tsx`
Last updated: 2026-07-03 (18B)

| Property           | Class/pattern                                                                 |
| ------------------ | ----------------------------------------------------------------------------- |
| Background         | page `bg-page`; masthead/panels `bg-surface`; metadata `bg-surface-subtle/40` |
| Border             | structural `border-line`; active navigation `border-brand-teal`              |
| Border radius      | shared Card `rounded-lg`; facts and controls `rounded-md`                     |
| Text — primary     | headings `text-brand-navy`; facts `text-content`                              |
| Text — secondary   | `text-content-muted`; metadata `text-content-subtle`                          |
| Spacing            | shell `px-4 sm:px-6 lg:px-8`; masthead `py-8`; panels `gap-4`                 |
| Interactive states | semantic hover plus `focus-visible:ring-2 focus-visible:ring-focus`           |
| Shadow             | shared Card subtle elevation                                                  |
| Accent usage       | teal active section; semantic badges/alerts for explicit source state         |

**Pattern notes:** Paid browser reports use a compact company masthead followed by one desktop tab
row and a labelled native section selector below `md`. Tabs support arrow, Home, and End navigation.
Screen presentation shows one section; print hides controls and expands every entitled section with
page-break protection. Status always repeats in text/icon form, unavailable sources never imply a
clean result, and PDF visibility is artifact-driven. The dark report footer contains
the provisional disclaimer, immutable identifiers, and issue link; print returns it to a light,
ink-friendly surface.

**16B real-data contract:** The same Card/Badge/Alert pattern now represents owner denial,
pending generation, terminal failure/refund states, and delivery-validation failure. Critical
states use the existing semantic critical variants and explicitly state that no incomplete report
data was delivered. Real report sections are projected from the frozen artifact and reuse the 16A
navigation, source-status, AI interpretation, responsive, and print patterns without new colours,
spacing, radii, or elevation.

**18B PDF action contract:** PDF generation is artifact-driven and owner-authorized. `available` is a disabled queued
fallback, `generating` remains disabled with live text, `ready` uses the existing primary Button to a
same-origin owner-authorized download route, and `failed` uses the same Button pattern for an
idempotent Server Action retry. Signed provider URLs and storage keys never enter the report payload. The helper
caption remains `text-xs text-content-subtle`; no new colour, radius, shadow, or spacing pattern was
introduced.

## Paid Report Unlock Checkout

### Shared Field and RadioGroup Primitives

Files: `packages/ui/src/components/field.tsx`, `packages/ui/src/components/radio-group.tsx`
Last updated: 2026-07-11

| Property           | Class/pattern                                                            |
| ------------------ | ------------------------------------------------------------------------ |
| Background         | radio item `bg-surface`; consuming tier cards retain `bg-surface`        |
| Border             | radio `border-line`; checked state `border-brand-teal`                   |
| Border radius      | radio `rounded-full`; consuming fields retain registered card radii      |
| Text — primary     | FieldLabel `text-content`; FieldLegend `text-brand-navy`                 |
| Text — secondary   | FieldDescription `text-content-muted`                                   |
| Spacing            | FieldSet/Field/RadioGroup use canonical `gap-3`/`gap-2`                  |
| Interactive states | `focus-visible:ring-3 focus-visible:ring-focus/50`; disabled opacity      |
| Shadow             | radio `shadow-xs`; field containers own contextual elevation             |
| Accent usage       | checked indicator and border use semantic brand teal                     |

**Pattern notes:** Option sets use FieldSet + FieldLegend + RadioGroup. Visual cards wrap a
RadioGroupItem and synchronize the whole-card click with the same controlled value. Native keyboard
arrow navigation and focus visibility come from the Radix-backed shared primitive.

### Retained-Credit Redemption Review

File: `apps/web/components/checkout/CreditRedemptionForm.tsx`
Last updated: 2026-07-11

| Property           | Class/pattern                                                        |
| ------------------ | -------------------------------------------------------------------- |
| Background         | page `bg-page`; Card `bg-surface`; company inset `bg-surface-subtle` |
| Border             | shared `border-line`                                                  |
| Border radius      | shared Card `rounded-lg`; inset `rounded-md`                         |
| Text — primary     | headings `text-brand-navy`; balances `text-content`                  |
| Text — secondary   | descriptions and labels `text-content-muted`                        |
| Spacing            | wrapper `px-4 py-10`; Card content `gap-5`; inset `p-4`              |
| Interactive states | authoritative confirmation and outline secondary Button patterns     |
| Shadow             | shared Card subtle elevation                                         |
| Accent usage       | positive Badge communicates an available owned credit                |

**Pattern notes:** Credit redemption is always an explicit review step. Company identity, current
balance, one-credit cost, and resulting balance are visible before mutation. The primary action is
single-use while pending; purchasing another pack remains secondary.

### Credit-Pack Tier Selector and Order Summary

File: `apps/web/components/checkout/CheckoutForm.tsx`
Last updated: 2026-07-11

| Property           | Class/pattern                                                                  |
| ------------------ | ------------------------------------------------------------------------------ |
| Background         | page `bg-page`; tier and summary Cards `bg-surface`; company inset `bg-surface-subtle` |
| Border             | default `border-line`; selected/hover tier `border-brand-teal`                 |
| Border radius      | tier cards `rounded-lg`; summary insets `rounded-md`                           |
| Text — primary     | headings `text-brand-navy`; prices and values `text-content`                   |
| Text — secondary   | descriptions and helper copy `text-content-muted`                             |
| Spacing            | page `px-4 py-8`; sections `gap-6`; tier cards `p-4`; summary content `gap-5`  |
| Interactive states | native radio labels use `focus-within:ring-2 focus-within:ring-focus`          |
| Shadow             | tier cards and shared Cards use subtle `shadow-sm`                             |
| Accent usage       | teal selection border; positive Badge marks the recommended business pack     |

**Pattern notes:** Every credit pack unlocks the same report depth. Selection always repeats tier
name, credit quantity, total price, and per-report price, while the sticky summary states one credit
is used immediately and how many remain. Payment identity is read-only and Stripe confirmation is
described as the authority. Source failures are described as explicit states rather than clean results.

## Authenticated Report Notifications

### Report Notification Status

File: `apps/web/components/report-notification/ReportNotificationStatus.tsx`
Last updated: 2026-07-03 (17A)

| Property           | Class/pattern                                                           |
| ------------------ | ----------------------------------------------------------------------- |
| Background         | shared Card `bg-surface`; semantic Alert surfaces                       |
| Border             | shared `border-line`; semantic Alert borders                            |
| Border radius      | shared Card/Alert `rounded-lg`                                          |
| Text — primary     | shared Card title and semantic Alert content                            |
| Text — secondary   | `text-content-muted` through CardDescription and AlertDescription       |
| Spacing            | Card composition; wrapped header `gap-3`; page separation `mb-6`        |
| Interactive states | none; fixture navigation uses the registered focus-ring link pattern    |
| Shadow             | shared Card subtle elevation                                            |
| Accent usage       | positive sent, caution sending/delayed, critical terminal delivery fail |

**Pattern notes:** Sending, sent, delayed, and failed outcomes share one stable, owner-visible
status block with Badge, icon, heading, durable copy, destination label, and update time. The block
is hidden from print, uses a polite live region, and always states that email delivery is independent
from access to the completed report. Delayed and failed delivery never suggest repurchase or report
regeneration.

### Report-Ready Email Preview

File: `apps/web/components/report-notification/ReportReadyEmail.tsx`
Last updated: 2026-07-03 (17A)

| Property           | Class/pattern                                                               |
| ------------------ | --------------------------------------------------------------------------- |
| Background         | page `bg-page`; email Card `bg-surface`; header `bg-brand-navy`             |
| Border             | shared `border-line`; metadata and security panels use structural borders   |
| Border radius      | shared Card/panels `rounded-lg`                                              |
| Text — primary     | `text-brand-navy`, `text-content`, header `text-content-inverse`             |
| Text — secondary   | `text-content-muted`, metadata `text-content-subtle`                         |
| Spacing            | shell `px-4 py-8`; email content `gap-6 p-5 sm:p-8`; compact panels `p-4`    |
| Interactive states | authoritative Button and underlined support link with semantic focus ring   |
| Shadow             | shared Card subtle elevation                                                |
| Accent usage       | navy transactional header/action; positive ready Badge                      |

**Pattern notes:** The compact email contains only company name, tier, reference, generation time,
authenticated report CTA, and support guidance. It contains no report findings, interpretation,
personal data, bearer token, or ownership bypass. The preview route is development/test-only and
the content stacks naturally on mobile before using a two-column metadata grid at `sm`.

### 17B Live Notification Contract

- Last updated: 2026-07-03.
- The registered Report Notification Status now consumes owner-authorized durable delivery state from
  the secure report payload; no new visual pattern, colour, spacing, radius, or elevation was added.
- `queued` and active submission render as sending, a retried queued record renders as delayed,
  Postmark acceptance renders as sent, and terminal or ambiguous submission renders as failed.
- The destination remains the generic `your verified account email`; recipient addresses and provider
  errors never enter the browser payload.

## Premium PDF and Compliance

### Premium PDF Page Sheet

File: `apps/web/components/premium-pdf/PremiumPdfDocument.tsx`
Last updated: 2026-07-03 (18B)

| Property           | Class/pattern                                                                    |
| ------------------ | -------------------------------------------------------------------------------- |
| Background         | preview `bg-page`; document sheets and factual panels `bg-surface`               |
| Border             | sheets, sections, and compliance blocks use `border-line`                        |
| Border radius      | screen sheets/sections `rounded-lg`; compact evidence rows `rounded-md`           |
| Text — primary     | headings `text-brand-navy`; facts `text-content`                                 |
| Text — secondary   | detail `text-content-muted`; metadata and pagination `text-content-subtle`         |
| Spacing            | preview `px-4 py-8`; sheets `p-8`; section grids `gap-4`; compact panels `p-3/4`  |
| Interactive states | fixture links use semantic hover and `focus-visible:ring-2 focus-visible:ring-focus` |
| Shadow             | screen sheets `shadow-sm`; removed in print                                      |
| Accent usage       | teal brand label; positive/caution source icons always paired with status text    |

**Pattern notes:** Premium PDF mocks use three deterministic screen page sheets and dedicated print
breaks. Preview chrome, sheet radius, borders, shadows, and page background disappear in print.
Page one always carries immutable identity, source status, the provisional disclaimer, and the
printed fixture issue URL. Long content and factual cards avoid internal print breaks where safe.
Current credit-pack products do not use the old Basic/Standard/Premium PDF entitlement split.

**18B renderer contract:** The preview and worker invoke the shared
`@workspace/report-document` static HTML/CSS renderer. Production output uses worker-hosted Chromium,
tagged A4 pages, CSS page sizing, print backgrounds, immutable identity, textual source status, and
versioned compliance content. System colour keywords keep the standalone renderer free of hardcoded
hex values and raw Tailwind colours.

### Report Compliance Block

File: `apps/web/components/report-compliance/ReportCompliance.tsx`
Last updated: 2026-07-03 (18A)

| Property           | Class/pattern                                                          |
| ------------------ | ---------------------------------------------------------------------- |
| Background         | browser `bg-brand-navy`; document `bg-surface-subtle/40`                |
| Border             | browser/document separation uses `border-line`                         |
| Border radius      | document block `rounded-lg`; browser footer is structural              |
| Text — primary     | document heading `text-brand-navy`; body `text-content-muted`           |
| Text — secondary   | browser uses `text-content-inverse`; print returns to `text-content`    |
| Spacing            | browser `px-4 py-6 gap-4`; document `p-4` with compact `gap-3`          |
| Interactive states | browser issue link uses underline and the canonical semantic focus ring |
| Shadow             | none                                                                   |
| Accent usage       | navy browser footer; document shield icon uses brand navy              |

**Pattern notes:** Browser and document reports share one compliance content contract while keeping
surface-specific presentation. The document variant is non-interactive and prints the issue URL as
text. The enabled flag-summary sample is explicitly non-production; the canonical state remains
disabled until approved exact copy is supplied in 18B.

## Provider Factual Records

### Companies House Search and Overview

File: `apps/web/components/company-search/CompanySearchExperience.tsx` and
`apps/web/components/company-workspace/CompanyWorkspace.tsx`
Last updated: 2026-07-12

| Property | Class/pattern |
| --- | --- |
| Background | `bg-surface` through shared Card |
| Border | `border-line` through shared Card and record containers |
| Border radius | shared Card radius; `rounded-lg` for timelines |
| Text — primary | `text-content`, `font-semibold` for returned values |
| Text — secondary | `text-content-muted`, `text-sm` for factual labels |
| Spacing | `gap-6` between provider sections; `gap-4` within fact groups |
| Hover state | none for factual, non-interactive records |
| Shadow | shared Card; `shadow-sm` for nested record cards |
| Accent usage | `text-brand-teal` only for the primary company link |

**Pattern notes:** Provider facts use a label-above-value hierarchy rather than unexplained compact
codes. Overview facts are grouped into Company information, Accounts, Confirmation statement, and
Nature of business. Search identity leads with the registered name, then company number/date, then
the complete address. InvoiceGuard interpretation remains a separate bordered panel and never
replaces source facts. Filing descriptions compose Companies House template identifiers with their
returned `description_values`; every value is also listed below the primary description using
`text-xs text-content-muted` labels and `font-medium text-content` values.

### Provider Metadata Disclosure

File: `apps/web/components/provider-metadata/ProviderMetadata.tsx`
Last updated: 2026-07-13

| Property | Class/pattern |
| --- | --- |
| Background | `bg-surface` |
| Border | `border-line` |
| Border radius | `rounded-lg` |
| Text — primary | `text-content`, `font-semibold` |
| Text — secondary | `text-content-muted`, `text-xs` |
| Spacing | `p-4`, nested `gap-3`, disclosure body `mt-4 pt-4` |
| Interactive state | native `details`/`summary` with `focus-visible:ring-focus` |
| Shadow | none |
| Accent usage | validated Companies House links use `text-brand-teal` |

**Pattern notes:** The disclosure is collapsed by default. It recursively hides null, blank, and
empty collection values while preserving `false` and `0`. Nested arrays use restrained left borders;
long values wrap and never force horizontal overflow.
