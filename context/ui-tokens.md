# UI Tokens

InvoiceGuard is trustworthy, premium, and commercially serious. The design template in
`apps/web/design-template/` is the canonical visual source. Use semantic project tokens everywhere;
never hardcode colours or use Tailwind's built-in colour scales.

The complete-system Figma file is the visual reference, filtered by active phase scope.

---

## Usage

Tailwind CSS 4 tokens live in `packages/ui/src/styles/globals.css`. Define values under `:root`, then map semantic utilities through `@theme inline`.

```tsx
// Correct
className = "bg-surface text-content border-line";

// Never
className = "bg-[#061B33] text-slate-700";
```

The current preview page still mixes direct variables and raw Tailwind colours. That is cleanup, not a pattern to copy.

---

## Canonical Tokens

```css
@theme inline {
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --color-page: var(--ig-page);
  --color-surface: var(--ig-surface);
  --color-surface-subtle: var(--ig-surface-subtle);
  --color-brand-navy: var(--ig-brand-navy);
  --color-brand-navy-hover: var(--ig-brand-navy-hover);
  --color-brand-teal: var(--ig-brand-teal);
  --color-brand-teal-hover: var(--ig-brand-teal-hover);
  --color-content: var(--ig-content);
  --color-content-muted: var(--ig-content-muted);
  --color-content-inverse: var(--ig-content-inverse);
  --color-line: var(--ig-line);
  --color-positive: var(--ig-positive);
  --color-positive-surface: var(--ig-positive-surface);
  --color-positive-content: var(--ig-positive-content);
  --color-caution: var(--ig-caution);
  --color-caution-surface: var(--ig-caution-surface);
  --color-caution-content: var(--ig-caution-content);
  --color-critical: var(--ig-critical);
  --color-critical-surface: var(--ig-critical-surface);
  --color-critical-content: var(--ig-critical-content);
  --color-focus: var(--ig-focus);
}

:root {
  --ig-page: #f6f8fb;
  --ig-surface: #ffffff;
  --ig-surface-subtle: #eef2f8;
  --ig-surface-strong: #122441;
  --ig-brand-navy: #07101f;
  --ig-brand-navy-hover: #1b3357;
  --ig-brand-teal: #0ab5a8;
  --ig-brand-teal-hover: #078c82;
  --ig-content: #07101f;
  --ig-content-muted: #5a6b82;
  --ig-content-subtle: #8595ab;
  --ig-content-inverse: #ffffff;
  --ig-line: #e2e8f1;
  --ig-positive: #0b9e6a;
  --ig-positive-surface: #e3f7ee;
  --ig-positive-content: #087a52;
  --ig-caution: #c77705;
  --ig-caution-surface: #fff4dc;
  --ig-caution-content: #9e5e03;
  --ig-critical: #d92d20;
  --ig-critical-surface: #fdecec;
  --ig-critical-content: #b22117;
  --ig-focus: #0ab5a8;
}
```

Hex values belong only in the central definition.

---

## Typography

- DM Sans through `next/font/google` is the UI/report font.
- Bricolage Grotesque is reserved for public-page display headings.
- DM Mono is reserved for company numbers, report references, and technical IDs.

| Element         | Size/weight    | Token                               |
| --------------- | -------------- | ----------------------------------- |
| Page title      | 30px / 600     | `text-content` or `text-brand-navy` |
| Section heading | 20px / 600     | `text-content`                      |
| Card heading    | 16px / 600     | `text-content`                      |
| Body            | 14px / 400     | `text-content`                      |
| Label/metadata  | 12px / 400-600 | `text-content-muted`                |
| Price           | 24px / 600     | `text-content`                      |

### Type Rules

- Page headings use tight, confident line height; report body copy uses generous line height.
- Labels may be uppercase only when short and scannable.
- Financial values use tabular numerals where available.
- Never use decorative display fonts or oversized marketing type inside reports/admin.

---

## Spacing, Radius, and Elevation

| Pattern          |   Value | Use                         |
| ---------------- | ------: | --------------------------- |
| Compact gap      |     8px | icon/label, badge groups    |
| Control gap      |    12px | forms and compact cards     |
| Component gap    |    16px | card internals and grids    |
| Section gap      |    24px | primary page sections       |
| Major gap        |    32px | page-level separation       |
| Compact padding  |    16px | rows and compact cards      |
| Standard padding | 20-24px | product/report cards        |
| Small radius     |     6px | badges and compact controls |
| Medium radius    |    10px | inputs/buttons              |
| Large radius     |    14px | cards/panels                |

Use subtle elevation only to separate interactive cards or sticky rails. Borders provide most structure; do not stack heavy shadows.

---

## Component Patterns

```text
Standard card: rounded-lg border border-line bg-surface p-5 shadow-sm
Compact card:  rounded-lg border border-line bg-surface p-4 shadow-sm
Teal action:   rounded-md bg-brand-teal text-brand-navy hover:bg-brand-teal-hover
Navy action:   rounded-md bg-brand-navy text-content-inverse hover:bg-brand-navy-hover
Input:         rounded-md border border-line bg-surface text-content focus-visible:ring-2 focus-visible:ring-focus
Adverse:       rounded-lg border border-critical bg-critical-surface p-4 text-critical-content
Clean:         rounded-lg border border-positive bg-positive-surface p-4 text-positive-content
```

Public layouts use `max-w-7xl`, `px-4 sm:px-6 lg:px-8`, and `py-8`. Preview/tier content becomes `minmax(0,1fr) 360px` at `lg`.

### State Tokens

| State               | Surface               | Content                 | Border            |
| ------------------- | --------------------- | ----------------------- | ----------------- |
| Clean/success       | `bg-positive-surface` | `text-positive-content` | `border-positive` |
| Partial/attention   | `bg-caution-surface`  | `text-caution-content`  | `border-caution`  |
| Adverse/destructive | `bg-critical-surface` | `text-critical-content` | `border-critical` |
| Unchecked/locked    | `bg-surface-subtle`   | `text-content-muted`    | `border-line`     |

### Motion

- Default transitions: 150-200ms for colour, border, opacity, and small shadow changes.
- No bouncing, parallax, or decorative motion.
- Respect `prefers-reduced-motion`.
- Loading indicators never replace accessible status text.

---

## Invariants

- No hardcoded colour values in components.
- No built-in Tailwind colour classes.
- Navy and teal are the only brand colours.
- Green, amber, and red describe factual source/operation state, never credit risk.
- New components follow `ui-rules.md` and are recorded in `ui-registry.md`.
- Dark mode is not part of Phase A unless explicitly scheduled; do not create incomplete parallel tokens.
