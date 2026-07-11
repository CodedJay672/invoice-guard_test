CREATE TYPE "public"."credit_purchase_status" AS ENUM('active', 'refund_pending', 'partially_refunded', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."credit_refund_status" AS ENUM('queued', 'processing', 'succeeded', 'failed');--> statement-breakpoint
CREATE TABLE "credit_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" varchar(128) NOT NULL,
	"report_tier" "report_tier" NOT NULL,
	"original_quantity" integer NOT NULL,
	"available_quantity" integer NOT NULL,
	"unit_price_pence" integer NOT NULL,
	"amount_paid_pence" integer NOT NULL,
	"amount_refunded_pence" integer DEFAULT 0 NOT NULL,
	"currency" varchar(3) NOT NULL,
	"stripe_payment_id" varchar(128),
	"stripe_checkout_session_id" varchar(128) NOT NULL,
	"status" "credit_purchase_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_purchases_valid_quantities" CHECK ("credit_purchases"."original_quantity" > 0 AND "credit_purchases"."available_quantity" >= 0 AND "credit_purchases"."available_quantity" <= "credit_purchases"."original_quantity")
);
--> statement-breakpoint
CREATE TABLE "credit_refund_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credit_purchase_id" uuid NOT NULL,
	"report_id" uuid,
	"requested_by_clerk_user_id" varchar(128),
	"credit_quantity" integer NOT NULL,
	"amount_pence" integer NOT NULL,
	"reason" text NOT NULL,
	"idempotency_key" uuid DEFAULT gen_random_uuid() NOT NULL,
	"stripe_refund_id" varchar(128),
	"status" "credit_refund_status" DEFAULT 'queued' NOT NULL,
	"failure_code" varchar(80),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_refund_requests_positive_values" CHECK ("credit_refund_requests"."credit_quantity" > 0 AND "credit_refund_requests"."amount_pence" > 0)
);
--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD COLUMN "credit_purchase_id" uuid;--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD COLUMN "refund_reference" varchar(128);--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_valid_shape" CHECK (("entry_type" = 'purchase_grant' AND "credit_delta" > 0 AND "stripe_checkout_session_id" IS NOT NULL AND "report_id" IS NULL AND "refund_reference" IS NULL) OR ("entry_type" = 'report_redemption' AND "credit_delta" = -1 AND "report_id" IS NOT NULL AND "refund_reference" IS NULL) OR ("entry_type" = 'refund_reversal' AND "credit_delta" < 0 AND "refund_reference" IS NOT NULL));--> statement-breakpoint
ALTER TABLE "purchased_reports" ADD COLUMN "credit_purchase_id" uuid;--> statement-breakpoint
ALTER TABLE "purchased_reports" ADD COLUMN "credit_redemption_attempt_id" uuid;--> statement-breakpoint
INSERT INTO "credit_purchases" ("clerk_user_id", "report_tier", "original_quantity", "available_quantity", "unit_price_pence", "amount_paid_pence", "currency", "stripe_payment_id", "stripe_checkout_session_id", "created_at", "updated_at")
SELECT "clerk_user_id", "report_tier",
  CASE "report_tier" WHEN 'single_report' THEN 1 WHEN 'starter_pack' THEN 3 WHEN 'business_pack' THEN 5 WHEN 'agency_pack' THEN 10 END,
  CASE "report_tier" WHEN 'single_report' THEN 0 WHEN 'starter_pack' THEN 2 WHEN 'business_pack' THEN 4 WHEN 'agency_pack' THEN 9 END,
  "amount_paid_pence" / CASE "report_tier" WHEN 'single_report' THEN 1 WHEN 'starter_pack' THEN 3 WHEN 'business_pack' THEN 5 WHEN 'agency_pack' THEN 10 END,
  "amount_paid_pence", "currency", "stripe_payment_id", "stripe_checkout_session_id", "created_at", "updated_at"
FROM "purchased_reports" WHERE "stripe_checkout_session_id" IS NOT NULL;--> statement-breakpoint
UPDATE "purchased_reports" AS r SET "credit_purchase_id" = p."id" FROM "credit_purchases" AS p WHERE p."stripe_checkout_session_id" = r."stripe_checkout_session_id";--> statement-breakpoint
UPDATE "credit_ledger_entries" AS l SET "credit_purchase_id" = p."id" FROM "credit_purchases" AS p WHERE l."stripe_checkout_session_id" = p."stripe_checkout_session_id";--> statement-breakpoint
UPDATE "credit_ledger_entries" AS l SET "credit_purchase_id" = r."credit_purchase_id" FROM "purchased_reports" AS r WHERE l."report_id" = r."id" AND l."credit_purchase_id" IS NULL;--> statement-breakpoint
DO $$ BEGIN IF EXISTS (SELECT 1 FROM "credit_ledger_entries" WHERE "credit_purchase_id" IS NULL) THEN RAISE EXCEPTION 'Credit purchase backfill incomplete'; END IF; END $$;--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ALTER COLUMN "credit_purchase_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "credit_purchases" ADD CONSTRAINT "credit_purchases_clerk_user_id_credit_accounts_clerk_user_id_fk" FOREIGN KEY ("clerk_user_id") REFERENCES "public"."credit_accounts"("clerk_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_refund_requests" ADD CONSTRAINT "credit_refund_requests_credit_purchase_id_credit_purchases_id_fk" FOREIGN KEY ("credit_purchase_id") REFERENCES "public"."credit_purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_refund_requests" ADD CONSTRAINT "credit_refund_requests_report_id_purchased_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."purchased_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "credit_purchases_checkout_session_unique" ON "credit_purchases" USING btree ("stripe_checkout_session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_purchases_payment_unique" ON "credit_purchases" USING btree ("stripe_payment_id");--> statement-breakpoint
CREATE INDEX "credit_purchases_owner_available_idx" ON "credit_purchases" USING btree ("clerk_user_id","available_quantity","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_refund_requests_idempotency_unique" ON "credit_refund_requests" USING btree ("idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_refund_requests_stripe_refund_unique" ON "credit_refund_requests" USING btree ("stripe_refund_id");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_refund_requests_report_unique" ON "credit_refund_requests" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "credit_refund_requests_status_idx" ON "credit_refund_requests" USING btree ("status");--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_credit_purchase_id_credit_purchases_id_fk" FOREIGN KEY ("credit_purchase_id") REFERENCES "public"."credit_purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchased_reports" ADD CONSTRAINT "purchased_reports_credit_purchase_id_credit_purchases_id_fk" FOREIGN KEY ("credit_purchase_id") REFERENCES "public"."credit_purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "purchased_reports_credit_purchase_idx" ON "purchased_reports" USING btree ("credit_purchase_id");--> statement-breakpoint
CREATE UNIQUE INDEX "purchased_reports_credit_redemption_attempt_unique" ON "purchased_reports" USING btree ("credit_redemption_attempt_id");
--> statement-breakpoint
CREATE FUNCTION "prevent_credit_ledger_mutation"() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'credit_ledger_entries is append-only'; END; $$;--> statement-breakpoint
CREATE TRIGGER "credit_ledger_entries_append_only" BEFORE UPDATE OR DELETE ON "credit_ledger_entries" FOR EACH ROW EXECUTE FUNCTION "prevent_credit_ledger_mutation"();
