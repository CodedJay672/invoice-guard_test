CREATE TYPE "public"."provider_status" AS ENUM('success', 'failed');--> statement-breakpoint
CREATE TYPE "public"."purchased_report_status" AS ENUM('pending', 'generating', 'ready', 'failed', 'refund_required', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."report_tier" AS ENUM('single_report', 'starter_pack', 'business_pack', 'agency_pack');--> statement-breakpoint
CREATE TYPE "public"."snapshot_source_context" AS ENUM('free_preview', 'paid_report', 'watchlist');--> statement-breakpoint
CREATE TABLE "admin_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_clerk_user_id" varchar(128) NOT NULL,
	"action" varchar(120) NOT NULL,
	"target_type" varchar(80) NOT NULL,
	"target_id" varchar(128) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companies_house_number" varchar(16) NOT NULL,
	"company_name" text NOT NULL,
	"company_status" varchar(64) NOT NULL,
	"company_type" varchar(64),
	"incorporation_date" timestamp with time zone,
	"registered_office_locality" text,
	"registered_office_region" text,
	"registered_office_country" text,
	"sic_codes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"industry_label" text,
	"active_director_count" integer,
	"last_fetched_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_data_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companies_house_number" varchar(16) NOT NULL,
	"provider" varchar(80) NOT NULL,
	"source_context" "snapshot_source_context" NOT NULL,
	"report_tier" "report_tier",
	"snapshot_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"snapshot_hash" varchar(128) NOT NULL,
	"status" "provider_status" NOT NULL,
	"error_code" varchar(120),
	"error_message" text,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(80) NOT NULL,
	"operation" varchar(120) NOT NULL,
	"companies_house_number" varchar(16),
	"report_id" uuid,
	"subscription_tier" varchar(80),
	"estimated_cost_pence" integer,
	"status" "provider_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchased_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_reference" varchar(64) NOT NULL,
	"clerk_user_id" varchar(128),
	"guest_email" text,
	"companies_house_number" varchar(16) NOT NULL,
	"company_name" text NOT NULL,
	"report_tier" "report_tier" NOT NULL,
	"stripe_payment_id" varchar(128),
	"stripe_checkout_session_id" varchar(128),
	"status" "purchased_report_status" DEFAULT 'pending' NOT NULL,
	"report_data" jsonb,
	"provider_statuses" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"pdf_storage_url" text,
	"guest_access_token_hash" varchar(128),
	"guest_access_expires_at" timestamp with time zone,
	"claimed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" "report_tier" NOT NULL,
	"name" text NOT NULL,
	"price_pence" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"includes_pdf" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"entitlements" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" varchar(128),
	"ip_hash" varchar(128),
	"query" text NOT NULL,
	"matched_companies_count" integer DEFAULT 0 NOT NULL,
	"selected_companies_house_number" varchar(16),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_anonymised_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "stripe_events" (
	"id" varchar(128) NOT NULL,
	"event_type" varchar(128) NOT NULL,
	"processed_at" timestamp with time zone,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stripe_events_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE INDEX "admin_audit_logs_admin_idx" ON "admin_audit_logs" USING btree ("admin_clerk_user_id");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_target_idx" ON "admin_audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_created_at_idx" ON "admin_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "companies_companies_house_number_unique" ON "companies" USING btree ("companies_house_number");--> statement-breakpoint
CREATE INDEX "companies_company_name_idx" ON "companies" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX "company_data_snapshots_company_fetched_idx" ON "company_data_snapshots" USING btree ("companies_house_number","fetched_at");--> statement-breakpoint
CREATE INDEX "company_data_snapshots_provider_idx" ON "company_data_snapshots" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "company_data_snapshots_hash_idx" ON "company_data_snapshots" USING btree ("snapshot_hash");--> statement-breakpoint
CREATE INDEX "provider_usage_logs_provider_idx" ON "provider_usage_logs" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "provider_usage_logs_report_idx" ON "provider_usage_logs" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "provider_usage_logs_created_at_idx" ON "provider_usage_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "purchased_reports_reference_unique" ON "purchased_reports" USING btree ("report_reference");--> statement-breakpoint
CREATE UNIQUE INDEX "purchased_reports_stripe_payment_unique" ON "purchased_reports" USING btree ("stripe_payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "purchased_reports_checkout_session_unique" ON "purchased_reports" USING btree ("stripe_checkout_session_id");--> statement-breakpoint
CREATE INDEX "purchased_reports_company_idx" ON "purchased_reports" USING btree ("companies_house_number");--> statement-breakpoint
CREATE INDEX "purchased_reports_status_idx" ON "purchased_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "purchased_reports_guest_token_idx" ON "purchased_reports" USING btree ("guest_access_token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "report_products_tier_unique" ON "report_products" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "report_products_active_idx" ON "report_products" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "search_logs_created_at_idx" ON "search_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "search_logs_selected_company_idx" ON "search_logs" USING btree ("selected_companies_house_number");--> statement-breakpoint
CREATE INDEX "stripe_events_event_type_idx" ON "stripe_events" USING btree ("event_type");
