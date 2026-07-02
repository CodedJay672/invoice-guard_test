# UI Rules

## Product Feel

- Trustworthy, calm, evidence-led, and commercially serious.
- Clear to small-business users without specialist legal or credit knowledge.
- No gamified risk visuals or exaggerated report language.

---

## Brand and Phase Scope

Primary brand reference: `context/designs/brand_asset.png` (Brand Asset Guide v1.0). It is the
source of truth for the InvoiceGuard logo, navy/emerald palette, Inter typography, button geometry,
outline iconography, and restrained gradient usage. The complete-system Figma remains a secondary
layout reference where it does not conflict with Phase A scope.

Use `apps/web/public/light mode logo.png` on light surfaces and `apps/web/public/dark mode logo.png`
on dark/navy surfaces. The Phase A landing implementation must use `context/designs/landing_page.html`
as its template and `context/designs/landing_page.png` as its screenshot reference. Supporting design
references in the folder are `free-preview-suggestions.png`, `paid-search-result.png`, and
`payment-page.png`.

The brand guide's risk meters, score rings, and risk labels are illustrative brand applications,
not approved InvoiceGuard product behavior. They must not appear while the no-risk-scoring product
decision remains active.

Phase A may use logo, navigation, search hero, trust strip, section rhythm, factual company snapshot, one-off report pricing, CTA, report, and footer patterns.

Do not use the design's risk score, overdue-invoice metrics, Xero/QuickBooks, statutory-interest, demand-letter, escalation, subscription, or recovery-dashboard flows in Phase A. When design and phase scope conflict, phase scope wins.

---

## Layout and Components

- Inter is loaded centrally for all brand and interface typography. Mono is used only for identifiers.
- Public pages use a top navigation and no Phase A user-dashboard sidebar.
- Use registered cards and semantic status surfaces; Court Records is the intentional dark conversion card.
- One dominant action per section.
- Use shadcn primitives from `packages/ui` before creating a primitive.
- Product components live at feature level and contain no business logic.
- Loading, empty, error, partial, and success states are designed explicitly.
- Every interactive control has visible focus and an accessible label.

### Public Marketing Experience

- Lead with company search rather than recovery automation.
- Trust claims identify real sources while stating that free-tier search/preview queries Companies House only.
- Primary CTA is search/select/report purchase; secondary links remain quiet.
- Figma recovery-focused sections are omitted or rewritten for the active report product.

### Cards, Tables, and Forms

- Cards group one coherent decision or information block.
- Tables use explicit headers, row boundaries, status text, timestamps, and responsive alternatives.
- Inputs keep visible labels, helpful examples, persistent user values after recoverable errors, and nearby validation.
- Destructive/admin financial actions require confirmation and cannot rely on toast-only feedback.

### Buttons and Icons

- Emerald is the primary conversion action; navy is the authoritative/report action.
- Secondary buttons use surface/border tokens; danger actions use critical tokens only when destructive.
- Buttons use a 12px radius, 12px vertical/20px horizontal padding, and Inter Semi Bold.
- Lucide icons use rounded, two-pixel outline styling at 18px in controls and are hidden from
  assistive technology when decorative.

---

## Search and Preview

Search results show registered name, Companies House number, status, and partial area.

Every preview shows:

- Registered company name and monospace number.
- Status, incorporation date/age, registered town/county, and active director count.
- Court Records prompt.
- Basic, Standard, and Premium tiers.

Adverse previews stack every applicable factual banner. Clean previews use the approved reassurance and curiosity cards. Neither path may imply Registry Trust was checked.

---

## Reports and Admin

Every browser report includes reference, timestamp, company identity, tier, source status, entitled sections, paid AI interpretation, disclaimer, issue link, and entitled PDF action.

Every paid-tier report also includes a clearly labelled AI interpretation. It distinguishes facts from interpretation, identifies unavailable sources, and never presents legal/financial advice, a credit decision, or a risk score.

Partial reports identify both successful and failed sources.

Admin UI optimizes for operational scanning. Money-moving actions require confirmation and a reason. Server authorization—not visible navigation—protects admin behavior.

PDFs mirror browser-report identity and source hierarchy, include the disclaimer on page one, print the issue URL, and never require colour to understand status.

---

## Empty, Loading, and Feedback States

- Empty states explain what is absent and offer the next valid action.
- Loading states preserve layout where possible and state what is happening.
- Partial states identify available and unavailable sources separately.
- Inline feedback is preferred for form/section outcomes; toasts supplement but never replace durable state.
- Retry controls appear only when retry is safe and meaningful.

---

## Responsiveness and Accessibility

- Mobile-first; tier rails stack below report content before `lg`.
- Navigation, tables, dialogs, and long identifiers must remain usable at narrow widths.
- Semantic landmarks/headings and logical keyboard order are required.
- Meet WCAG AA contrast; colour is never the sole signal.
- Live asynchronous status changes use appropriate accessible announcements.
- Touch targets are at least 44px where practical.

---

## Factual Language

Use:

- `Records found`
- `No records found in checked sources`
- `Source not yet checked`
- `Data could not be retrieved`
- `Public record position at time of generation`

Never conclude `safe`, `unsafe`, `high risk`, `low risk`, `approved`, `rejected`, `bad payer`, or `creditworthy`.

---

## Do Nots

- No raw Tailwind colours or hardcoded colours. The documented brand gradient may be used sparingly;
  status surfaces remain flat and factual.
- No hidden provider failures.
- No colour-only status communication.
- No raw provider/payment errors shown to users.
- No invented legal, credit, or report wording.
- Read and update `ui-registry.md` for every UI feature.
- No fixed primary content, inaccessible horizontal-only tables, or modal actions without focus management.
