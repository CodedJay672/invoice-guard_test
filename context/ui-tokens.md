# UI Tokens

InvoiceGuard is trustworthy, analytical, and commercially serious. The canonical brand reference is
`context/designs/brand_asset.png`. Production logo files are `apps/web/public/light mode logo.png`
for light surfaces and `apps/web/public/dark mode logo.png` for dark/navy surfaces. Use semantic project tokens everywhere; never hardcode colours or
use Tailwind's built-in colour scales.

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
  --ig-page: #f8fafc;
  --ig-surface: #ffffff;
  --ig-surface-subtle: #e2e8f0;
  --ig-surface-strong: #334155;
  --ig-brand-navy: #001b4d;
  --ig-brand-navy-hover: #002867;
  --ig-brand-teal: #12d6a0;
  --ig-brand-teal-hover: #0fb88a;
  --ig-content: #001b4d;
  --ig-content-muted: #334155;
  --ig-content-subtle: #64748b;
  --ig-content-inverse: #ffffff;
  --ig-line: #e2e8f0;
  --ig-positive: #10b981;
  --ig-positive-surface: #ecfdf5;
  --ig-positive-content: #047857;
  --ig-caution: #f59e0b;
  --ig-caution-surface: #fffbeb;
  --ig-caution-content: #b45309;
  --ig-critical: #ef4444;
  --ig-critical-surface: #fef2f2;
  --ig-critical-content: #b91c1c;
  --ig-focus: #12d6a0;
  --ig-dark-background: #020817;
  --ig-monitoring: #8b5cf6;
}
```

Hex values belong only in the central definition.

---

## Typography

- Inter through `next/font/google` is the only brand UI/report font.
- Geist Mono is reserved for company numbers, report references, and technical IDs.

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
- Supplying light-surface and dark-surface logo variants does not authorize a full application dark mode. Use the correct logo asset for its surface and do not create incomplete parallel theme tokens.
- Corporate disqualification tabs, cards, pagination, and details reuse existing semantic tokens; no feature-specific colour token is introduced.
- The nested Corporate and People selector and natural detail page introduce no new tokens.
