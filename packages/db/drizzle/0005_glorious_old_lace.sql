CREATE TYPE "public"."report_notification_status" AS ENUM('queued', 'sending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."report_notification_type" AS ENUM('owner_report_ready');--> statement-breakpoint
CREATE TABLE "report_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"type" "report_notification_type" NOT NULL,
	"status" "report_notification_status" DEFAULT 'queued' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"postmark_message_id" varchar(128),
	"failure_code" varchar(80),
	"failure_kind" varchar(40),
	"queued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submission_started_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_notifications" ADD CONSTRAINT "report_notifications_report_id_purchased_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."purchased_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "report_notifications_report_type_unique" ON "report_notifications" USING btree ("report_id","type");--> statement-breakpoint
CREATE INDEX "report_notifications_status_idx" ON "report_notifications" USING btree ("status");