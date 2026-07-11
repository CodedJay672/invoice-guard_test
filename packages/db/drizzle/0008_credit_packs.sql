CREATE TYPE "public"."credit_ledger_entry_type" AS ENUM('purchase_grant', 'report_redemption', 'refund_reversal');--> statement-breakpoint
CREATE TABLE "credit_accounts" (
	"clerk_user_id" varchar(128) PRIMARY KEY NOT NULL,
	"available_credits" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_accounts_non_negative_balance" CHECK ("credit_accounts"."available_credits" >= 0)
);
--> statement-breakpoint
CREATE TABLE "credit_ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" varchar(128) NOT NULL,
	"entry_type" "credit_ledger_entry_type" NOT NULL,
	"credit_delta" integer NOT NULL,
	"report_tier" "report_tier" NOT NULL,
	"stripe_checkout_session_id" varchar(128),
	"report_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_ledger_entries_non_zero_delta" CHECK ("credit_ledger_entries"."credit_delta" <> 0)
);
--> statement-breakpoint
ALTER TABLE "report_products" ADD COLUMN "credit_quantity" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
UPDATE "report_products" SET "credit_quantity" = CASE "tier" WHEN 'single_report' THEN 1 WHEN 'starter_pack' THEN 3 WHEN 'business_pack' THEN 5 WHEN 'agency_pack' THEN 10 END;--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_clerk_user_id_credit_accounts_clerk_user_id_fk" FOREIGN KEY ("clerk_user_id") REFERENCES "public"."credit_accounts"("clerk_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_report_id_purchased_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."purchased_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_ledger_entries_owner_created_idx" ON "credit_ledger_entries" USING btree ("clerk_user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_ledger_entries_purchase_session_unique" ON "credit_ledger_entries" USING btree ("stripe_checkout_session_id","entry_type");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_ledger_entries_report_type_unique" ON "credit_ledger_entries" USING btree ("report_id","entry_type");
