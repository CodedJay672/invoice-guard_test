# InvoiceGuard UI Context

## Brand Direction

InvoiceGuard should feel trustworthy, professional, and commercially serious. It is not a playful fintech app. It is a business due-diligence and company intelligence product.

The UI should help users answer one question:

> Should I work with this company, and what information should I check before deciding?

## Visual Language

Recommended visual direction:

- Clean B2B SaaS interface.
- Strong use of white space.
- Dark navy for trust and authority.
- Teal/cyan accent for primary actions.
- Muted greys for secondary information.
- Clear status badges for company state and provider results.
- Avoid sensational risk-score styling.

## Colour Roles

Define colours as CSS custom properties in `globals.css` and map them to Tailwind tokens. Avoid raw hex usage in components.

| Role | Suggested Value | Usage |
| --- | --- | --- |
| `--color-navy` | `#061B33` | Primary dark brand panels and Court Records card. |
| `--color-navy-soft` | `#0B2A4A` | Hover/elevated dark surfaces. |
| `--color-teal` | `#00B8C8` | Primary CTA, key accents. |
| `--color-teal-dark` | `#0098A6` | CTA hover. |
| `--color-bg` | `#F8FAFC` | Page background. |
| `--color-surface` | `#FFFFFF` | Cards and panels. |
| `--color-border` | `#E2E8F0` | Default borders. |
| `--color-text` | `#0F172A` | Main text. |
| `--color-muted` | `#64748B` | Secondary text. |
| `--color-success` | `#16A34A` | Clean confirmations. |
| `--color-warning` | `#D97706` | Attention, stale reports, partial data. |
| `--color-danger` | `#DC2626` | Critical adverse flags. |

## Typography

- Use a modern sans-serif font for UI text.
- Use a monospace font only for Companies House numbers, report references, and technical identifiers.
- Keep report copy readable and formal.
- Avoid marketing exaggeration inside paid reports.

## Component Library

Use shadcn/ui as the component foundation.

Rules:

- Do not modify base `components/ui/*` unless explicitly required.
- Compose product-specific components at app/feature level.
- Use consistent card, badge, button, alert, table, and dialog components.

## Layout Patterns

### Public Marketing/Search Layout

- Top navigation with logo, search entry, and sign-in/admin links where relevant.
- Main content centered with clear company search input.
- Search results displayed as selectable company cards.

### Free Preview Layout

Recommended layout:

```txt
[Navbar]
[Breadcrumb: Home / Company Search / Company Name]
[Company Header Card]
[Adverse banners OR clean reassurance line]
[Court Records Prompt Card]
[Curiosity Cards on clean path only]
[Main data preview]
[Right sidebar: Report tier cards]
```

On mobile, sidebar cards should stack below preview content.

### Paid Report Layout

Recommended layout:

```txt
[Report Header]
[Report reference + timestamp]
[Company identity]
[Data source status section]
[Tier-specific sections]
[Plain English Flag Summary placeholder or enabled summary]
[PDF download if available]
[Mandatory disclaimer]
[Report issue link]
```

### Admin Layout

- Protected `/admin` area.
- Simple operational dashboard.
- Tables for reports, payments, provider failures, refunds, search activity.
- Use explicit statuses and timestamps.

## Free Preview UI Specification

The free preview has two conversion paths.

### Always Visible Fields

Show these on every free preview:

- Company name exactly as registered.
- Companies House number in monospace.
- Company status badge.
- Incorporation date and plain-English age.
- Registered address town/county only.
- Number of active directors.

### Adverse Path

Trigger when any free-source adverse condition exists:

- Insolvency flag true.
- Disqualified director flag true.
- Gazette strike-off flag true.
- Gazette winding-up flag true.

Show all relevant banners stacked under the company header.

Approved banner copy:

- Insolvency: `Insolvency or administration records found on this company in the Insolvency Service register. Unlock a paid report to see the full detail.`
- Disqualification: `A director disqualification was found connected to this company. Unlock a paid report to see which director and when.`
- Gazette strike-off: `A compulsory strike-off notice was found for this company in the London Gazette. Unlock a paid report to see the full detail.`
- Gazette winding-up: `A winding-up petition notice was found for this company in the London Gazette. Unlock a paid report to see the full detail.`

Then show Court Records card and paid report tier cards.

### Clean Path

Trigger when all are true:

- Insolvency flag false.
- Disqualified director flag false.
- Gazette strike-off flag false.
- Gazette winding-up flag false.
- Company status is active.

Show reassurance line:

`No insolvency events, director disqualifications, or gazette notices found on the free check.`

Then show Court Records card, three curiosity cards, and paid report tier cards.

## Court Records Prompt Card

This card appears on every free preview.

Style:

- Dark navy background.
- Teal uppercase label.
- White heading.
- Muted white body copy.
- Full-width teal CTA.

Copy:

Label: `COURT RECORDS — NOT YET CHECKED`

Heading: `Has this company ever been taken to court over an unpaid debt?`

Body: `County Court Judgements are held by Registry Trust, a separate official UK register from Companies House. They show whether any court has ordered this company to pay a debt and whether that debt has been settled or remains outstanding. Court records are not included in the free check. They are only retrieved when you unlock a paid report.`

Question line: `Find out whether this company has CCJs on record.`

Button: `Check the Court Records`

Small text: `Included in all paid reports. Basic from £7.99.`

## Clean Path Curiosity Cards

Only show these on clean free preview path.

### Director Network Card

Question:

`How many other UK companies are these [director count] directors connected to right now?`

Blurred answer:

`[number] connected companies found`

Fallback blurred answer:

`Network not yet mapped`

Lock tag:

`Unlock to see the full director network`

Sub-copy:

`Includes active roles, recent resignations, and any dissolved companies connected to these directors.`

### Recent Company Activity Card

Question:

`Has anything changed at this company in the last 12 months?`

Blurred answer:

`[count] changes recorded`

Lock tag:

`Unlock to see recent activity`

Sub-copy:

`Covers director appointments, resignations, address changes, new charges registered, and account submissions.`

### Full Clearance Offer Card

Style differently from the other two cards using a green left border accent and slightly lighter background.

Heading:

`Everything looks clean so far.`

Body:

`The free check covers company status and the most visible public records. The full report confirms there is nothing in the detail. Court records from Registry Trust. Director disqualification check. Insolvency history. Charges registered against company assets. Filing compliance across the last three years. A complete clearance you can keep on file as proof of due diligence.`

Button:

`Get Full Clearance Report — Premium`

Small text:

`Includes branded PDF report and timestamped reference number.`

## Report Tier Cards

Cards should clearly show:

- Tier name.
- Price.
- What is included.
- PDF availability.
- Primary CTA.

Do not mislead users about sources not yet checked.

## Report Page Rules

Every report page must show:

- Report reference.
- Report generated timestamp.
- Company name and Companies House number.
- Purchased tier.
- Data source status section.
- Mandatory disclaimer.
- Report issue link.

For partial reports:

- Show what was successfully retrieved.
- Show what could not be reached.
- Do not silently omit failed provider sections.

## PDF Rules

PDF reports must include:

- Branding.
- Report reference.
- Generation timestamp.
- Companies House number.
- Tier.
- Data source status.
- Mandatory disclaimer on page one.
- Report issue printed URL.

## Content Safety Rules

Avoid words that imply credit judgement or legal advice:

Do not use:

- Safe.
- Unsafe.
- High risk.
- Low risk.
- Approved.
- Rejected.
- Bad payer.
- Creditworthy.

Use factual language:

- Records found.
- No records found in checked sources.
- Source not yet checked.
- Data could not be retrieved.
- Public record position at time of generation.
