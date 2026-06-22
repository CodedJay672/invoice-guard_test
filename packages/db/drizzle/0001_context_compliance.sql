ALTER TYPE "public"."purchased_report_status" ADD VALUE IF NOT EXISTS 'partial' AFTER 'ready';
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "company_data_snapshots"
    WHERE "source_context"::text = 'watchlist'
  ) THEN
    RAISE EXCEPTION 'Cannot remove watchlist source context while watchlist snapshots exist.';
  END IF;
END
$$;
--> statement-breakpoint
ALTER TYPE "public"."snapshot_source_context" RENAME TO "snapshot_source_context_legacy";
--> statement-breakpoint
CREATE TYPE "public"."snapshot_source_context" AS ENUM('free_preview', 'paid_report');
--> statement-breakpoint
ALTER TABLE "company_data_snapshots"
  ALTER COLUMN "source_context" TYPE "public"."snapshot_source_context"
  USING "source_context"::text::"public"."snapshot_source_context";
--> statement-breakpoint
DROP TYPE "public"."snapshot_source_context_legacy";
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "provider_usage_logs"
    WHERE "subscription_tier" IS NOT NULL
      AND "subscription_tier" NOT IN ('basic', 'standard', 'premium')
  ) THEN
    RAISE EXCEPTION 'Cannot convert provider usage tier because unsupported values exist.';
  END IF;
END
$$;
--> statement-breakpoint
ALTER TABLE "provider_usage_logs" RENAME COLUMN "subscription_tier" TO "report_tier";
--> statement-breakpoint
ALTER TABLE "provider_usage_logs"
  ALTER COLUMN "report_tier" TYPE "public"."report_tier"
  USING "report_tier"::"public"."report_tier";
--> statement-breakpoint
INSERT INTO "report_products" (
  "tier",
  "name",
  "price_pence",
  "currency",
  "includes_pdf",
  "is_active",
  "entitlements"
)
VALUES
  (
    'basic',
    'Basic',
    799,
    'GBP',
    false,
    true,
    '{"includedItems":["Court records check","Director names and appointment dates","Registered address history"]}'::jsonb
  ),
  (
    'standard',
    'Standard',
    1499,
    'GBP',
    false,
    true,
    '{"includedItems":["Everything in Basic","CCJ amounts and satisfaction status","Recent filings and registered charges"]}'::jsonb
  ),
  (
    'premium',
    'Premium',
    2700,
    'GBP',
    true,
    true,
    '{"includedItems":["Everything in Standard","Director and insolvency depth checks","Branded PDF and timestamped reference"]}'::jsonb
  )
ON CONFLICT ("tier") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "price_pence" = EXCLUDED."price_pence",
  "currency" = EXCLUDED."currency",
  "includes_pdf" = EXCLUDED."includes_pdf",
  "is_active" = EXCLUDED."is_active",
  "entitlements" = EXCLUDED."entitlements",
  "updated_at" = now();
