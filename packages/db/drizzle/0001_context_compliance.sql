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
      AND "subscription_tier" NOT IN ('single_report', 'starter_pack', 'business_pack', 'agency_pack')
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
    'single_report',
    'Single Report',
    2000,
    'GBP',
    false,
    true,
    '{"includedItems":["All 6 data sources","CCJ registry check","Fair Payment Code status","Full written summary","Instant access"]}'::jsonb
  ),
  (
    'starter_pack',
    'Starter Pack',
    5400,
    'GBP',
    false,
    true,
    '{"includedItems":["Everything in Single Report","Credits never expire","Use on any companies","Instant access"]}'::jsonb
  ),
  (
    'business_pack',
    'Business Pack',
    8000,
    'GBP',
    false,
    true,
    '{"includedItems":["Everything in Starter Pack","Ideal for monthly checks","Best value under Agency","Priority email support"]}'::jsonb
  ),
  (
    'agency_pack',
    'Agency Pack',
    14000,
    'GBP',
    false,
    true,
    '{"includedItems":["Everything in Business Pack","Lowest per-report rate","Team access coming soon","Priority email support"]}'::jsonb
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
