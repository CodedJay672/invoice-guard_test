# UI Context

## 1. Theme

InvoiceGuard uses a **light-first fintech intelligence theme with full dark mode support**.

The visual language combines:

- fintech professionalism
- legal-tech clarity
- intelligence-dashboard structure
- premium SaaS polish

The platform must feel:

- trustworthy
- data-driven
- operationally serious
- modern
- highly readable

The UI should resemble a blend of:

- Stripe
- Ramp
- Mercury
- modern intelligence dashboards

rather than:

- social products
- consumer apps
- playful startup interfaces

---

## 1.1 Design Philosophy

InvoiceGuard is NOT:

- a flashy startup dashboard
- crypto-style neon UI
- dense enterprise ERP
- overly playful SaaS

The product should feel like:

> a premium financial intelligence and workflow operations platform.

Key visual characteristics:

- structured layouts
- generous whitespace
- strong typography hierarchy
- high information clarity
- restrained accent usage
- subtle data emphasis
- premium dashboard feel

---

## 1.2 Color System

The system uses:

- neutral grayscale foundations
- dark navy/slate surfaces
- restrained fintech blue accents
- semantic status colors

All colors MUST be defined as:

- CSS custom properties
- mapped to Tailwind tokens

No hardcoded hex values.
No raw Tailwind colors.

---

### Light Mode (Default)

| Role             | CSS Variable       | Value                     |
| ---------------- | ------------------ | ------------------------- |
| Page background  | `--bg-base`        | `#ffffff`                 |
| Surface          | `--bg-surface`     | `#f8fafc`                 |
| Elevated surface | `--bg-elevated`    | `#ffffff`                 |
| Subtle surface   | `--bg-subtle`      | `#f1f5f9`                 |
| Border default   | `--border-default` | `#e2e8f0`                 |
| Border subtle    | `--border-subtle`  | `#f1f5f9`                 |
| Primary text     | `--text-primary`   | `#0f172a`                 |
| Secondary text   | `--text-secondary` | `#334155`                 |
| Muted text       | `--text-muted`     | `#64748b`                 |
| Faint text       | `--text-faint`     | `#94a3b8`                 |
| Accent primary   | `--accent-primary` | `#2563eb`                 |
| Accent dim       | `--accent-dim`     | `rgba(37, 99, 235, 0.12)` |
| Success          | `--state-success`  | `#16a34a`                 |
| Error            | `--state-error`    | `#dc2626`                 |
| Warning          | `--state-warning`  | `#d97706`                 |
| Info             | `--state-info`     | `#2563eb`                 |

---

### Dark Mode

| Role             | CSS Variable       | Value                      |
| ---------------- | ------------------ | -------------------------- |
| Page background  | `--bg-base`        | `#0b1120`                  |
| Surface          | `--bg-surface`     | `#111827`                  |
| Elevated surface | `--bg-elevated`    | `#172033`                  |
| Subtle surface   | `--bg-subtle`      | `#1e293b`                  |
| Border default   | `--border-default` | `#334155`                  |
| Border subtle    | `--border-subtle`  | `#1e293b`                  |
| Primary text     | `--text-primary`   | `#f8fafc`                  |
| Secondary text   | `--text-secondary` | `#cbd5e1`                  |
| Muted text       | `--text-muted`     | `#94a3b8`                  |
| Faint text       | `--text-faint`     | `#64748b`                  |
| Accent primary   | `--accent-primary` | `#3b82f6`                  |
| Accent dim       | `--accent-dim`     | `rgba(59, 130, 246, 0.15)` |
| Success          | `--state-success`  | `#22c55e`                  |
| Error            | `--state-error`    | `#ef4444`                  |
| Warning          | `--state-warning`  | `#f59e0b`                  |
| Info             | `--state-info`     | `#60a5fa`                  |

---

## 1.3 Tailwind Mapping Rules

Use semantic utility names only:

- `bg-base`
- `bg-surface`
- `bg-elevated`
- `bg-subtle`
- `text-primary`
- `text-secondary`
- `text-muted`
- `border-default`
- `border-subtle`
- `bg-accent`
- `text-accent`
- `bg-success`
- `bg-error`

Never use raw Tailwind color classes directly.

---

## 1.4 Accent Usage Rules

Accent color usage must remain restrained.

Use accent for:

- primary CTAs
- active states
- important metrics
- selected filters
- pricing emphasis
- chart highlights

Do NOT use accent for:

- page backgrounds
- large sections
- dashboard surfaces
- entire cards

The product should feel:

- professional
- controlled
- trustworthy

not visually noisy.

---

# 2. Typography

| Role    | Font       | Usage                           |
| ------- | ---------- | ------------------------------- |
| UI Text | Inter      | Entire UI                       |
| Mono    | Geist Mono | Financial figures / IDs / codes |

---

## Typography Rules

### Headings

- bold
- compact spacing
- strong hierarchy

### Body Text

- medium weight
- highly readable
- generous line spacing

### Labels

- smaller
- muted
- low visual weight

### Financial Metrics

- large
- bold
- high contrast
- tightly aligned

---

# 3. Layout Architecture

InvoiceGuard is structured as a unified SaaS platform.

Primary application sections:

- Public marketing site
- Company search experience
- Intelligence report experience
- Authenticated dashboard
- Future enforcement workflows
- Admin operations panel

---

# 4. Public Marketing Experience

## Tone

The marketing site should feel:

- premium
- trustworthy
- data-driven
- professional

Avoid:

- excessive gradients
- startup clichés
- oversized illustrations

---

## Hero Section Priorities

Primary emphasis:

1. Company search
2. Intelligence reports
3. Payment insights
4. Enforcement workflows

---

## Search CTA Priority

The company search bar is the primary conversion surface.

It must feel:

- immediate
- trustworthy
- highly prominent

---

# 5. Company Search Experience

## 5.1 Search UX

Search is the core Phase A product experience.

Requirements:

- instant search feedback
- intelligent loading states
- strong search clarity
- premium data presentation

---

## 5.2 Search Layout

Desktop:

- centered search bar
- spacious report layout
- split intelligence sections

Mobile:

- stacked sections
- collapsible report panels

---

## 5.3 Search Result Design

Search results should resemble:

- professional intelligence briefings
- credit risk dashboards
- business intelligence reports

NOT:

- ecommerce search
- social feeds

---

## 5.4 Search Priorities

1. Company identity clarity
2. Risk indicators
3. Payment intelligence
4. Premium report upsell
5. Supporting metadata

---

# 6. Intelligence Report UI

## Design Direction

Reports should feel like:

> a premium business intelligence dossier.

Visual style:

- clean grids
- structured sections
- restrained highlights
- strong metric typography

---

## Report Sections

Examples:

- company profile
- insolvency indicators
- court judgments
- payment behavior
- fair payment status
- risk analysis

---

## Locked Panel Design

Locked sections must:

- preview teaser content
- visibly communicate premium value
- encourage upgrade without feeling spammy

Use:

- blur overlays
- locked cards
- teaser metrics
- upgrade prompts

Avoid:

- aggressive popups
- obstructive gating

---

# 7. Dashboard Experience

## Tone

The dashboard should feel:

- operational
- calm
- professional
- analytical

---

## Layout

Desktop:

- sidebar navigation
- content workspace
- top utility header

Mobile:

- bottom navigation OR collapsible menu
- stacked cards

---

## Dashboard Priorities

Phase A:

- report purchases
- search history
- saved companies
- account management

Phase B:

- invoices
- overdue tracking
- enforcement workflows
- disputes

---

# 8. Admin Panel

## Tone

More operational and dense.

Reduced accent usage.

Focus:

- clarity
- monitoring
- moderation
- operational tooling

---

## Admin UI Priorities

- payment oversight
- report generation monitoring
- webhook visibility
- queue health
- integration health

---

# 9. Cards

Cards are primary layout primitives.

---

## Card Rules

Use:

- subtle elevation
- soft borders
- consistent spacing
- structured internal layout

Avoid:

- heavy shadows
- excessive visual noise

---

## Card Radius

Preferred:

- `rounded-2xl`

---

# 10. Tables & Data Display

InvoiceGuard is data-heavy.

Desktop:

- table-first layouts

Mobile:

- card transformations

---

## Table Rules

- sticky headers where useful
- sortable columns
- strong alignment for financial data
- muted secondary metadata

---

# 11. Forms

## Style

Forms should feel:

- structured
- minimal
- trustworthy

---

## Rules

- clear labels
- inline validation
- generous spacing
- minimal friction

Avoid:

- crowded layouts
- multi-column forms on mobile

---

# 12. Buttons

## Primary Buttons

- solid accent background
- high contrast text

---

## Secondary Buttons

- outline
- subtle surface background

---

## Danger Actions

Reserved for:

- destructive workflows
- enforcement cancellation
- deletion

---

# 13. Icons

Library:

- Lucide

Style:

- outline only

---

## Sizes

Inline:

- `h-4 w-4`

Actions:

- `h-5 w-5`

Hero/dashboard:

- `h-6 w-6`

---

# 14. Empty States

All empty states must include:

- icon
- explanation
- optional CTA

Tone:

- calm
- informative
- non-alarming

---

# 15. Charts & Data Visualization

Charts should feel:

- analytical
- minimal
- professional

Preferred:

- line charts
- bar charts
- compact metric charts

Avoid:

- excessive gradients
- decorative charts
- flashy animations

---

## Chart Rules

- muted gridlines
- restrained colors
- strong numeric readability
- accessible contrast

---

# 16. Motion & Interaction

## Motion Level

Moderate and restrained.

---

## Allowed Motion

- hover elevation
- subtle transitions
- skeleton loading
- button feedback
- panel expansion

---

## Avoid

- excessive animation
- floating motion
- distracting transitions

---

## Duration

Standard:

- 150ms–250ms

---

# 17. Feedback System

## Inline Feedback

Use for:

- form validation
- payment status
- workflow state

---

## Toast Notifications

Use for:

- purchases
- report generation
- email delivery
- workflow confirmations

---

# 18. PDF Report Design

PDFs are premium deliverables.

They must NOT feel like exported webpages.

---

## PDF Tone

- formal
- structured
- business-grade
- print-friendly

---

## PDF Rules

- strong section hierarchy
- page-safe layouts
- consistent spacing
- branded header/footer
- professional typography

---

## PDF Structure

- cover page
- company summary
- intelligence sections
- findings
- risk indicators

---

# 19. Responsiveness

## Mobile First

All UI must begin mobile-first.

---

## Breakpoints

- mobile → default
- tablet → medium screens
- desktop → wide workspace layouts

---

## Responsive Rules

- avoid horizontal scrolling
- maintain readable data density
- collapse complex tables responsibly

---

# 20. Accessibility

Required:

- keyboard accessibility
- sufficient color contrast
- semantic HTML
- screen-reader compatibility

Avoid:

- color-only indicators
- inaccessible hover-only interactions

---

# 21. Frontend Architecture Rules

Use:

- shadcn/ui components
- token-based styling
- reusable design primitives

---

## Never:

- hardcode colors
- introduce inconsistent spacing
- mix design systems
- create isolated UI patterns

---

# 22. Component Consistency Rules

All components must:

- use shared tokens
- follow spacing system
- follow typography hierarchy
- maintain consistent interaction states

---

# 23. Future Phase B UI Direction

Phase B expands UI into:

- invoice operations
- enforcement workflows
- dispute tracking
- legal workflow management

The design system must already support:

- operational dashboards
- workflow states
- timeline views
- audit-style interfaces

---

# 24. Final UI Definition

A premium fintech intelligence and financial workflow platform with a structured, data-driven, light-first design system that balances professional business reporting, operational dashboard clarity, and scalable SaaS interface consistency across company search, intelligence reporting, and invoice enforcement workflows.
