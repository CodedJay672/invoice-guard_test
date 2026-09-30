CREATE TYPE "public"."admin_alert_status" AS ENUM('queued', 'sending', 'sent', 'failed', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."maintenance_run_status" AS ENUM('running', 'succeeded', 'failed');--> statement-breakpoint
CREATE TABLE "admin_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" varchar(80) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"related_entity_type" varchar(80),
	"related_entity_id" varchar(128),
	"deduplication_key" varchar(200) NOT NULL,
	"status" "admin_alert_status" DEFAULT 'queued' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delivered_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"failure_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task" varchar(80) NOT NULL,
	"schedule_boundary" timestamp with time zone NOT NULL,
	"status" "maintenance_run_status" DEFAULT 'running' NOT NULL,
	"records_examined" integer DEFAULT 0 NOT NULL,
	"records_changed" integer DEFAULT 0 NOT NULL,
	"safe_error_summary" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fair_payment_code_statuses" ADD COLUMN "source_version" varchar(128);--> statement-breakpoint
ALTER TABLE "fair_payment_code_statuses" ADD COLUMN "retrieval_status" "provider_status" DEFAULT 'success' NOT NULL;--> statement-breakpoint
ALTER TABLE "fair_payment_code_statuses" ADD COLUMN "failure_code" varchar(80);--> statement-breakpoint
ALTER TABLE "fair_payment_code_statuses" ADD COLUMN "failure_message" text;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_alerts_deduplication_key_unique" ON "admin_alerts" USING btree ("deduplication_key");--> statement-breakpoint
CREATE INDEX "admin_alerts_status_occurred_idx" ON "admin_alerts" USING btree ("status","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "maintenance_runs_task_boundary_unique" ON "maintenance_runs" USING btree ("task","schedule_boundary");--> statement-breakpoint
CREATE INDEX "maintenance_runs_task_started_idx" ON "maintenance_runs" USING btree ("task","started_at");