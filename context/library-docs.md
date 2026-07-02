# Library Docs

InvoiceGuard-specific third-party usage rules. They supplement—not replace—current documentation.

---

## Before Using Any Library

Before implementing any feature that uses a third party library:

1. **Check AGENTS.md** at the project root — it lists every skill installed for this project and how to use them. Skills contain up-to-date API documentation, usage patterns, and best practices specific to this codebase.

2. **Check if an MCP server is configured** for that library. Some tools have MCP servers that give the AI agent direct access to documentation, logs, and debugging tools. If an MCP server is available — use it before falling back to general knowledge.

3. **Find a skill** for that task. use the `/find-skills` skill to find any skill that would help you perform better at a task.

3. **Read this file** for project-specific patterns that override general library knowledge.

The order of authority is:

```
MCP server (real-time docs) → Skills via AGENTS.md → This file (project rules) → General training knowledge
```

Never rely on general training knowledge alone for library APIs — they change frequently and training data may be outdated.

---

---

## Next.js 16.2.6 and React 19.2

- App Router in `apps/web`.
- Server Components by default; small Client Components for interaction.
- `app/api/**/route.ts` handles web concerns or proxies to Express only.
- Do not duplicate validation, providers, payments, or report creation in web proxies.
- Route handlers are uncached unless explicitly configured.
- Use `next/font` for Inter and Geist Mono.

Relevant installed guides include project structure, Server/Client Components, caching, Route Handlers, error handling, data fetching, and fonts. Dynamic request data may be asynchronous in this version; copy no older API pattern from memory.

---

## Tailwind CSS 4.1 and shadcn/ui

- Global tokens live in `packages/ui/src/styles/globals.css` through `@theme inline`.
- Use semantic project tokens only.
- Use `/shadcn` before adding/fixing shadcn components.
- Shared generated primitives live in `packages/ui/src/components`.
- Domain composition stays in app features.
- Preserve Radix accessibility and use `cn`/CVA for legitimate variants.

---

## Express 5.2 and Zod 3.25

- Express domain API lives in `apps/api` and is composed by `createApiApp`.
- Async errors flow to error middleware.
- Stripe raw-body middleware must precede generic JSON parsing for that endpoint.
- Shared request schemas live in `packages/validation`; environment schemas in `packages/config`.
- Use `safeParse` for controlled boundary errors and `parse` for startup config.
- Validate/normalize provider JSON before domain use.

Express app construction is separate from `listen()` so tests instantiate it without opening ports. Route modules register focused handlers; shared error middleware is last. Stripe raw-body routing must be designed before globally applying JSON parsing to that path.

---

## Drizzle ORM 0.45, drizzle-kit 0.31, postgres.js 3.4

- Schema/client/migrations live in `packages/db`.
- Services use repositories rather than direct Drizzle queries.
- Generate and review migrations with root `pg:*` scripts.
- Use constraints for identity/idempotency, integer pence for money, and typed JSONB for provider/report payloads.
- Never mutate ready report JSON or interpolate user input into SQL.

Root commands are `npm run pg:generate`, `pg:migrate`, `pg:push` (intentional local use only), and `pg:studio`. Generated SQL is reviewed before application; schema code remains the source of migration intent.

### DB Queries

You can use `joins` or `db.query` to query data from the database
```ts

//joins
const result = await db.select().from(users).leftJoin(city, eq(city.id, user.city_id))

//query
const result = await db.query.users.findMany({
  with: {
    city: true
  }
})

```

**Rules:**

- When using `db.query` make sure that a relationship between the tables exists
- Always handle the `error` return — never assume success
- Do not return an array when expecting exactly one row

---

## BullMQ 5.77 and ioredis 5.10

- Queue names/payloads/defaults are centralized in `packages/queues`.
- Current queues: report generation, PDF, email, provider alert, maintenance.
- Payloads carry identifiers; processors load trusted data.
- Three attempts with exponential backoff are the default.
- Side effects remain idempotent despite retries.
- `REDIS_URL` is validated config; in-memory rate limit is local/test only.
- Never store raw IP addresses.

Jobs use centralized names and payload maps. Workers validate IDs, load current database state, transition lifecycle explicitly, and make retries converge. Queue completion is not a substitute for durable report/payment state.

---

## Pino 10.3 and Lucide React

- Use the shared logger factory and stable context fields; never log secrets/tokens.
- Import Lucide icons by name. Icons support labels and do not replace accessible text.

---

## Companies House

- Factory/adapters live in `packages/integrations/src/companies-house`.
- Mock and live modes share normalized contracts.
- Company number—not name—is identity.
- Companies House is foundational for paid reports.
- Keep deterministic fixtures for local/test flows.

Live configuration includes base URL, API key, and explicit timeout. Normalize search/profile/officers/filings/charges before domain use. A paid-report Companies House failure is foundational and cannot be downgraded to a partial success.

### companies house API endpoints.

The companies house api poducmentation is at `https://developer-specs.company-information.service.gov.uk/companies-house-public-data-api/reference`;



companies house endpoints:

| endopoint | description | response |
| :--- | :--- | :--- |
| GET /alphabetical-search/companies?q={company-name}` | Search alphabetically by company name | companyListsResponse |
| GET /company/{companyNumber}/registered-office-address | registered office address | RegisteredOfficeAddress |
| GET /company/{companyNumber} | search by canonical company number | CompanyProfile |
| GET /company/{company_number}/officers | List of all company officers. can take items_per_role; register_type  with values like "drectors", "secretary" etc; and register_view: boolean | OfficersList |
| GET /company/{company_number}/filing-history | Company's filing history | Filing History |
| GET /company/{company_number}/insolvency | company insolvency resource | CompanyInsolvency |


### return types
```ts

const companyListsResponse = {
    "items": [
        {
            "company_name": "string",
            "company_number": "string",
            "company_status": "string",
            "company_type": "string",
            "kind": "string",
            "links": {
                "company_profile": "string"
            },
            "ordered_alpha_key_with_id": "string"
        }
    ],
    "kind": "string",
    "top_hit": {
        "company_name": "string",
        "company_number": "string",
        "company_status": "string",
        "company_type": "string",
        "kind": "string",
        "links": {
            "company_profile": "string"
        },
        "ordered_alpha_key_with_id": "string"
    }
} as const

const RegisteredOfficeAddress = {
    "accept_appropriate_office_address_statement": "boolean",
    "address_line_1": "string",
    "address_line_2": "string",
    "country": "string",
    "etag": "string",
    "kind": "string",
    "links": {
        "self": "uri"
    },
    "locality": "string",
    "postal_code": "string",
    "premises": "string",
    "region": "string"
} as const;

const CompanyProfile = {
    "accounts": {
        "accounting_reference_date": {
            "day": "integer",
            "month": "integer"
        },
        "last_accounts": {
            "made_up_to": "date",
            "period_end_on": "date",
            "period_start_on": "date",
            "type": {}
        },
        "next_accounts": {
            "due_on": "date",
            "overdue": "boolean",
            "period_end_on": "date",
            "period_start_on": "date"
        },
        "next_due": "date",
        "next_made_up_to": "date",
        "overdue": "boolean"
    },
    "annual_return": {
        "last_made_up_to": "date",
        "next_due": "date",
        "next_made_up_to": "date",
        "overdue": "boolean"
    },
    "branch_company_details": {
        "business_activity": "string",
        "parent_company_name": "string",
        "parent_company_number": "string"
    },
    "can_file": "boolean",
    "company_name": "string",
    "company_number": "string",
    "company_status": "string",
    "company_status_detail": "string",
    "confirmation_statement": {
        "last_made_up_to": "date",
        "next_due": "date",
        "next_made_up_to": "date",
        "overdue": "boolean"
    },
    "corporate_annotation": [
        {
            "created_on": "date",
            "description": "string",
            "type": "string"
        }
    ],
    "date_of_cessation": "date",
    "date_of_creation": "date",
    "etag": "string",
    "external_registration_number": "string",
    "foreign_company_details": {
        "accounting_requirement": {
            "foreign_account_type": "string",
            "terms_of_account_publication": "string"
        },
        "accounts": {
            "account_period_from:": {
                "day": "integer",
                "month": "integer"
            },
            "account_period_to": {
                "day": "integer",
                "month": "integer"
            },
            "must_file_within": {
                "months": "integer"
            }
        },
        "business_activity": "string",
        "company_type": "string",
        "governed_by": "string",
        "is_a_credit_finance_institution": "boolean",
        "originating_registry": {
            "country": "string",
            "name": "string"
        },
        "registration_number": "string"
    },
    "has_been_liquidated": "boolean",
    "has_charges": "boolean",
    "has_insolvency_history": "boolean",
    "is_community_interest_company": "boolean",
    "jurisdiction": "string",
    "last_full_members_list_date": "date",
    "links": {
        "charges": "string",
        "exemptions": "string",
        "filing_history": "string",
        "insolvency": "string",
        "officers": "string",
        "overseas": "string",
        "persons_with_significant_control": "string",
        "persons_with_significant_control_statements": "string",
        "registers": "string",
        "self": "string",
        "uk-establishments": "string"
    },
    "partial_data_available": "string",
    "previous_company_names": [
        {
            "ceased_on": "date",
            "effective_from": "date",
            "name": "string"
        }
    ],
    "registered_office_address": {
        "address_line_1": "string",
        "address_line_2": "string",
        "care_of": "string",
        "country": "string",
        "locality": "string",
        "po_box": "string",
        "postal_code": "string",
        "premises": "string",
        "region": "string"
    },
    "registered_office_is_in_dispute": "boolean",
    "service_address": {
        "address_line_1": "string",
        "address_line_2": "string",
        "care_of": "string",
        "country": "string",
        "locality": "string",
        "po_box": "string",
        "postal_code": "string",
        "region": "string"
    },
    "sic_codes": [
        "string"
    ],
    "subtype": "string",
    "super_secure_managing_officer_count": "integer",
    "type": "string",
    "undeliverable_registered_office_address": "boolean"
}

const OfficerList = {
    "active_count": "integer",
    "etag": "string",
    "items": [
        {
            "address": {
                "address_line_1": "string",
                "address_line_2": "string",
                "care_of": "string",
                "country": "string",
                "locality": "string",
                "po_box": "string",
                "postal_code": "string",
                "premises": "string",
                "region": "string"
            },
            "appointed_before": "string",
            "appointed_on": "date",
            "contact_details": {
                "contact_name": "string"
            },
            "country_of_residence": "string",
            "date_of_birth": {
                "month": "integer",
                "year": "integer"
            },
            "etag": "string",
            "former_names": [
                {
                    "forenames": "string",
                    "surname": "string"
                }
            ],
            "identification": {
                "identification_type": "string",
                "legal_authority": "string",
                "legal_form": "string",
                "place_registered": "string",
                "registration_number": "string"
            },
            "identity_verification_details": {
                "anti_money_laundering_supervisory_bodies": [
                    "string"
                ],
                "appointment_verification_end_on": "date",
                "appointment_verification_start_on": "date",
                "appointment_verification_statement_due_on": "date",
                "authorised_corporate_service_provider_name": "string",
                "identity_verified_on": "date",
                "preferred_name": "string"
            },
            "is_pre_1992_appointment": "boolean",
            "links": {
                "officer": {
                    "appointments": "string"
                },
                "self": "string"
            },
            "name": "string",
            "nationality": "string",
            "occupation": "string",
            "officer_role": "string",
            "person_number": "string",
            "principal_office_address": {
                "address_line_1": "string",
                "address_line_2": "string",
                "care_of": "string",
                "country": "string",
                "locality": "string",
                "po_box": "string",
                "postal_code": "string",
                "premises": "string",
                "region": "string"
            },
            "resigned_on": "date",
            "responsibilities": "string"
        }
    ],
    "items_per_page": "integer",
    "kind": "string",
    "links": {
        "self": "string"
    },
    "resigned_count": "integer",
    "start_index": "integer",
    "total_results": "integer"
} as const

const FilingHistory = {
    "annotations": [
        {
            "annotation": "string",
            "date": "date",
            "description": "string"
        }
    ],
    "associated_filings": [
        {
            "date": "date",
            "description": "string",
            "type": "string"
        }
    ],
    "barcode": "string",
    "category": "string",
    "date": "date",
    "description": "string",
    "links": {
        "document_metadata": "string",
        "self": "string"
    },
    "pages": "integer",
    "paper_filed": "boolean",
    "resolutions": [
        {
            "category": "string",
            "description": "string",
            "document_id": "string",
            "receive_date": "date",
            "subcategory": "string",
            "type": "string"
        }
    ],
    "subcategory": "string",
    "transaction_id": "string",
    "type": "string"
} as const;

const CompanyInsolvency = {
    "cases": [
        {
            "dates": [
                {
                    "date": "date",
                    "type": "string"
                }
            ],
            "links": {
                "charge": "string"
            },
            "notes": [
                "string"
            ],
            "number": "string",
            "practitioners": [
                {
                    "address": [
                        {
                            "address_line_1": "string",
                            "address_line_2": "string",
                            "country": "string",
                            "locality": "string",
                            "postal_code": "string",
                            "region": "string"
                        }
                    ],
                    "appointed_on": "date",
                    "ceased_to_act_on": "date",
                    "name": "string",
                    "role": "string"
                }
            ],
            "type": "string"
        }
    ],
    "etag": "string",
    "status": "string"
}

```

## London Gazette

- Normalize strike-off and winding-up flags.
- Paid reports may call it when entitled. Free-tier search/preview must not call it.
- Failure is source-status failure, never a false clean paid result.

Live endpoint behavior, rate limits, response shape, attribution, and terms require production verification.

## Insolvency and Disqualified Officers

- Normalize insolvency and director-disqualification flags.
- Paid reports may call it when entitled. Free-tier search/preview must not call it.
- Current live-shaped endpoint must be verified before production.

## Registry Trust

- Paid-only normalized mock boundary is implemented; live mode fails closed until the verified
  production contract, credentials, pricing, and response schema are supplied.
- Runs only from paid-report generation after confirmed payment.
- Log every query and preserve failure/recheck rules.
- Load current official integration docs before implementation.

Every call records operation, company number, report, estimated cost, status, and timestamp. Basic/Standard failure supports a recovery recheck; Premium failure is escalated for refund/recheck decision.

## Anthropic Paid-Report Interpretation

- The worker integration uses the official `@anthropic-ai/sdk`; no Anthropic dependency is exposed
  to the web or API runtime.
- This integration is mandatory Phase A work for every paid report tier.
- Use exactly `claude-haiku-4-5-20251001` and set `max_tokens` to `1500` on every interpretation request.
- Invoke Anthropic only in the paid report worker after webhook-confirmed payment, authenticated ownership, entitled source collection, and frozen factual assembly. Free-tier search/preview must have no Anthropic dependency.
- The model receives only tier-entitled facts and explicit source statuses. Prompts require factual attribution, uncertainty for missing sources, and no invented data, legal/financial advice, credit decisions, risk scores, or safety verdicts.
- Persist model ID, prompt/template version, generation timestamp, status, and output with the immutable report artifact. Use explicit timeout, bounded retry, idempotency, and visible failure behavior.
- The v1 implementation uses `output_config.format` with JSON Schema, an explicit 30-second
  request timeout, SDK retries disabled, and BullMQ as the single retry layer. Runtime Zod and
  safety checks still validate the returned text before persistence.
- Before implementation, install/load an Anthropic skill if available and read the current official SDK/API documentation; do not infer SDK syntax from memory.

---

## Stripe

Configuration exists; SDK/feature are not implemented.

- One-off Checkout only in Phase A.
- Server chooses product, price, currency, and metadata.
- Signed raw-body webhook creates reports and uses `stripe_events` idempotency.
- Redirect pages only display status.
- Refunds are admin-audited.
- Do not add Figma subscription behavior in Phase A.

Checkout metadata is treated as an identifier carrier, not authority for price/entitlements. Retrieve trusted product/company context server-side. Verify library/Express raw-body guidance for the exact installed versions before coding.

## Clerk

Configuration exists; package/feature are not implemented.

- Public Companies House search/preview does not require an account; purchase and report access do.
- Persist `clerk_user_id`.
- Admin requires verified email exactly matching `ADMIN_EMAIL`.
- Require a verified primary email before creating Checkout. No guest purchase, guest token, or guest-claim flow exists.

Client auth state may improve navigation but cannot authorize admin/report access. Server checks use authenticated identity and verified email claims.

## Postmark

Selected/configured but not implemented.

- Send authenticated-owner report-ready notices and admin alerts through jobs.
- Jobs receive report IDs and load trusted data.
- Notification links resolve through authenticated owner authorization; never create bearer guest tokens.
- Use approved templates and expose delivery failure operationally.

Report-ready and admin-alert messages are distinct templates. Email jobs load report/access state at execution time, avoid placing sensitive payloads in queues, and record terminal delivery failure.

## PDF and Object Storage

Provider not selected. Choose it only when the Premium PDF slice starts.

- Generate from frozen browser-report data.
- Store files in object storage and only references in PostgreSQL.
- Disclaimer is on page one; status never depends on colour alone.
- Do not copy the template project's PDF library choice automatically.

Evaluate server-runtime compatibility, deterministic pagination, font embedding, accessibility/print needs, storage lifecycle, signed/public access, and retry behavior before selection.

---

## Environment Configuration

Existing config covers app URL/API port, database, Redis, Clerk, Stripe, Postmark, admin emails, provider modes/base URLs/timeouts/credentials, `ANTHROPIC_API_KEY`, and `ENABLE_FLAG_SUMMARY`. `ANTHROPIC_API_KEY` is validated server-only worker configuration and is required for the production worker; the model and token limit are fixed code constants rather than environment-controlled values.

Mock provider mode is the local/test default. Production activation requires credentials and explicit live-mode verification; absence of optional future credentials must not block unrelated Phase A development.

---

Invoice/accounting integrations, recovery, statutory interest, demand letters, subscriptions, and dashboard concepts are future reference. The depicted risk score conflicts with confirmed product rules and is not implemented unless those rules formally change.
