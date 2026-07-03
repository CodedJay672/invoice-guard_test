CREATE TYPE "public"."report_pdf_status" AS ENUM('queued', 'generating', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "report_pdf_artifacts" (
	"report_id" uuid PRIMARY KEY NOT NULL,
	"status" "report_pdf_status" DEFAULT 'queued' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"object_key" text,
	"sha256" varchar(64),
	"byte_size" integer,
	"template_version" varchar(64) NOT NULL,
	"compliance_version" varchar(64) NOT NULL,
	"failure_code" varchar(80),
	"failure_message" text,
	"generation_started_at" timestamp with time zone,
	"generated_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_pdf_artifacts" ADD CONSTRAINT "report_pdf_artifacts_report_id_purchased_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."purchased_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "report_pdf_artifacts_status_idx" ON "report_pdf_artifacts" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "report_pdf_artifacts_object_key_unique" ON "report_pdf_artifacts" USING btree ("object_key");