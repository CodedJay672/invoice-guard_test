# InvoiceGuard Project Overview

## Product Summary

InvoiceGuard is a UK-focused company intelligence and paid report platform for SMEs, freelancers, agencies, contractors, and other businesses that want to check a company before deciding whether to work with it.

The product originally included invoice chasing and late payment recovery. The confirmed implementation direction is now search-first. The first commercial build is Phase A: company search and paid reports only. Invoice chasing is Phase F and must not be scoped or implemented until Phase A proves commercial traction.

## Confirmed Phase Structure

| Phase | Name | Build Timing | Purpose |
| --- | --- | --- | --- |
| Phase A | Company Search and Paid Reports | Build now | Let users search a UK company, view a free preview, pay for a report, and access/download the report where allowed. |
| Phase B | User Accounts and Dashboard | After Phase A reaches at least 30 real paid transactions | Let users save reports, view report history, add saved companies, add notes, and recheck stale reports. |
| Phase C | Starter Watchlists and Alerts | After Phase B | Starter monthly monitoring for non-CCJ alert sources. |
| Phase D | Pro, Business, Enterprise Watchlists | After Phase C | Higher-tier watchlists including Registry Trust CCJ monitoring and Enterprise admin setup. |
| Phase E | Payment Signal Collection | After sufficient Premium report usage | Collect structured payment experiences from eligible Premium buyers. |
| Phase F | Invoice Recovery and Chasing | Future separate scope | Invoice upload, Xero, QuickBooks, statutory interest, demand letters, and recovery workflows. |

## Phase Gate

Do not build Phase B, C, D, or E until Phase A has processed at least 30 real paid transactions from real users.

A transaction counts toward this gate only if:

- It is a real user purchase.
- It is not a test payment.
- It is not refunded.
- A report was generated and delivered.

If Phase A conversion is poor, improve Phase A instead of adding later features.

## Phase A Goal

Build and launch a working commercial flow:

1. Visitor searches a UK company.
2. System resolves the company to a Companies House number.
3. Visitor sees a free preview.
4. Visitor chooses Basic, Standard, or Premium report.
5. Visitor pays via Stripe.
6. Stripe webhook confirms payment.
7. System generates a paid report from fresh provider data.
8. User views the report.
9. Guest buyers receive a secure report access email link.
10. Premium reports include a branded PDF.
11. Admin can monitor report generation, provider failures, and refunds.

## Phase A Explicit Exclusions

Do not build the following in Phase A:

- Full user dashboard.
- Saved companies.
- Saved company notes.
- Watchlists.
- Monthly subscriptions.
- Payment signal submission.
- Invoice upload.
- OCR.
- Xero integration.
- QuickBooks integration.
- Late payment calculator.
- Demand letter templates.
- Company response portal.
- SMS overdue notifications.
- Invoice recovery/chasing.
- AI-generated legal copy.
- Risk scores or colour-band risk ratings.

## Company Identity Rule

Company name is not identity.

Companies House registration number is the canonical company identifier across the system.

Every report, provider snapshot, search result, watchlist entry, saved company, payment signal, and future invoice intelligence record must use Companies House number as the stable company key.

## Free Preview

The free preview is shown before payment. It has two jobs:

1. Show enough genuine value to build trust.
2. Leave meaningful unanswered questions that the paid report can answer.

### Free Preview API Calls

The free preview makes exactly three external provider calls:

1. Companies House company profile.
2. Insolvency/disqualified officer data accessed through the Companies House/API route.
3. London Gazette strike-off and winding-up notices.

Registry Trust must never be called on the free preview under any circumstances. CCJ data is fetched only after Stripe confirms payment for Basic or above.

### Free Preview Always Shows

- Company name exactly as registered at Companies House.
- Companies House number in monospace.
- Company status badge.
- Incorporation date and plain-English age.
- Registered address town and county only.
- Number of active directors.
- Paid report tier cards.
- Court Records prompt card explaining Registry Trust has not yet been checked.

### Free Preview Conversion Paths

#### Adverse Free-Source Path

Show adverse banners when any of these are true:

- Insolvency flag is true.
- Disqualified director flag is true.
- Gazette strike-off flag is true.
- Gazette winding-up flag is true.

Multiple adverse banners may be stacked.

#### Clean Free-Source Path

Show reassurance line when all are true:

- Insolvency flag is false.
- Disqualified director flag is false.
- Gazette strike-off flag is false.
- Gazette winding-up flag is false.
- Company status is active.

Then show Court Records card plus clean-path curiosity cards.

## Report Products

| Tier | Price | Contents |
| --- | ---: | --- |
| Free Preview | £0 | Company name, Companies House number, company status, incorporation date, plain-English SIC industry, partial registered address, active director count, free-source adverse banners. |
| Basic | £7.99 | Free preview data plus CCJ count, court name, year of registration for each CCJ, director names and appointment dates, registered address history from AD01 filings. No PDF. |
| Standard | £14.99 | Basic plus full CCJ amounts and satisfaction status, last three filing records with compliance assessment, charges including holder name/date/status. Standard may support paid PDF add-on later. |
| Premium | £27.00 | Standard plus director disqualification checks, insolvency/admin history, related companies under same directors, previous dissolved/insolvent companies connected to directors, Fair Payment Code status, Confidence Indicator, branded PDF, timestamped reference number, Plain English Flag Summary placeholder or enabled template output. |

## Paid Report Freshness Rules

- Every paid report attempts a fresh fetch from every provider included in the purchased tier.
- Do not use cached data older than 24 hours for a paid report fetch.
- Store fetched provider responses in `company_data_snapshots` with timestamps and provider statuses.
- Delivered reports are frozen and are not updated after generation.
- Rechecks create new reports; they never overwrite previous reports.

## Provider Failure Rules

- Companies House is foundational. If Companies House fails during paid report generation, the report cannot be generated and the user receives a full automatic Stripe refund.
- For non-critical provider failures, generate a partial report with a clear data source status section.
- If Registry Trust fails on Basic or Standard, generate a partial report and offer a free recheck within 7 days when the provider recovers.
- If Registry Trust fails on Premium, allow Lucky to decide between a free recheck and a partial refund.
- Every provider failure on a paid report sends an admin alert to `ADMIN_ALERT_EMAIL`.

## Guest Purchases

Guest checkout is allowed.

Rules:

- Guest users receive a secure report access link by email.
- Guest access link is valid for 30 days.
- After 30 days, the link expires.
- The underlying guest report data is retained for 12 months from generation.
- If a guest later creates an account with the same verified email, all matching guest purchased reports are linked to that account.
- Never link reports using an unverified email address.

## Legal and Compliance Requirements

- InvoiceGuard is not a credit reference agency.
- InvoiceGuard does not provide credit assessments, financial advice, or legal advice.
- Every paid report at every tier must include the mandatory report disclaimer from day one.
- The disclaimer is separate from the Plain English Flag Summary and is not controlled by `ENABLE_FLAG_SUMMARY`.
- Report issue link must appear on every delivered report page, every PDF report, and later every dashboard report card.
- Lucky handles disputes manually through email in Phase A.
- Admin refund tool must allow Lucky to trigger full or partial Stripe refunds from the report record.
- ICO registration must be confirmed by Lucky before production launch.

## Plain English Flag Summary

The Plain English Flag Summary uses pre-approved master templates only.

Rules:

- `ENABLE_FLAG_SUMMARY` defaults to `false` in all environments, including production.
- When false, show: `Detailed plain English analysis of this company's public record is coming very soon.`
- When true, assemble the summary using approved templates only.
- Lucky enables the flag only after solicitor sign-off.
- No developer may reword, paraphrase, invent, or add legally sensitive wording without Lucky's written approval.

## Future Phase Notes

Later phases include accounts, saved companies, watchlists, subscriptions, alerts, payment signals, and invoice recovery. Architecture may prepare for these, but implementation must not begin before the proper phase gate.
