CREATE TABLE "fair_payment_code_statuses" (
	"companies_house_number" varchar(16) PRIMARY KEY NOT NULL,
	"status_label" text NOT NULL,
	"award_level" text,
	"source_reference" text,
	"verified_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "company_data_snapshots" ADD COLUMN "report_id" uuid;--> statement-breakpoint
ALTER TABLE "company_data_snapshots" ADD COLUMN "operation" varchar(120) DEFAULT 'legacy' NOT NULL;--> statement-breakpoint
ALTER TABLE "company_data_snapshots" ADD COLUMN "attempt" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "company_data_snapshots" ADD COLUMN "retryable" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "purchased_reports" ADD COLUMN "entitlements" jsonb;--> statement-breakpoint
UPDATE "purchased_reports"
SET "entitlements" = CASE "report_tier"
  WHEN 'single_report' THEN '{"companiesHouse":{"profile":true,"addressHistory":true,"officers":true,"filingHistory":true,"charges":true,"insolvency":true},"registryTrust":{"enabled":true,"includeAmounts":true,"includeSatisfaction":true},"londonGazette":true,"insolvencyDisqualifiedOfficers":true,"fairPaymentCode":true,"evidenceCoverage":true,"relatedCompanies":false,"aiInterpretation":true}'::jsonb
  WHEN 'starter_pack' THEN '{"companiesHouse":{"profile":true,"addressHistory":true,"officers":true,"filingHistory":true,"charges":true,"insolvency":true},"registryTrust":{"enabled":true,"includeAmounts":true,"includeSatisfaction":true},"londonGazette":true,"insolvencyDisqualifiedOfficers":true,"fairPaymentCode":true,"evidenceCoverage":true,"relatedCompanies":false,"aiInterpretation":true}'::jsonb
  WHEN 'business_pack' THEN '{"companiesHouse":{"profile":true,"addressHistory":true,"officers":true,"filingHistory":true,"charges":true,"insolvency":true},"registryTrust":{"enabled":true,"includeAmounts":true,"includeSatisfaction":true},"londonGazette":true,"insolvencyDisqualifiedOfficers":true,"fairPaymentCode":true,"evidenceCoverage":true,"relatedCompanies":false,"aiInterpretation":true}'::jsonb
  WHEN 'agency_pack' THEN '{"companiesHouse":{"profile":true,"addressHistory":true,"officers":true,"filingHistory":true,"charges":true,"insolvency":true},"registryTrust":{"enabled":true,"includeAmounts":true,"includeSatisfaction":true},"londonGazette":true,"insolvencyDisqualifiedOfficers":true,"fairPaymentCode":true,"evidenceCoverage":true,"relatedCompanies":false,"aiInterpretation":true}'::jsonb
END;--> statement-breakpoint
ALTER TABLE "purchased_reports" ALTER COLUMN "entitlements" SET NOT NULL;--> statement-breakpoint
UPDATE "report_products"
SET "entitlements" = jsonb_set(
  "entitlements",
  '{paidReport}',
  CASE "tier"
    WHEN 'single_report' THEN '{"companiesHouse":{"profile":true,"addressHistory":true,"officers":true,"filingHistory":true,"charges":true,"insolvency":true},"registryTrust":{"enabled":true,"includeAmounts":true,"includeSatisfaction":true},"londonGazette":true,"insolvencyDisqualifiedOfficers":true,"fairPaymentCode":true,"evidenceCoverage":true,"relatedCompanies":false,"aiInterpretation":true}'::jsonb
    WHEN 'starter_pack' THEN '{"companiesHouse":{"profile":true,"addressHistory":true,"officers":true,"filingHistory":true,"charges":true,"insolvency":true},"registryTrust":{"enabled":true,"includeAmounts":true,"includeSatisfaction":true},"londonGazette":true,"insolvencyDisqualifiedOfficers":true,"fairPaymentCode":true,"evidenceCoverage":true,"relatedCompanies":false,"aiInterpretation":true}'::jsonb
    WHEN 'business_pack' THEN '{"companiesHouse":{"profile":true,"addressHistory":true,"officers":true,"filingHistory":true,"charges":true,"insolvency":true},"registryTrust":{"enabled":true,"includeAmounts":true,"includeSatisfaction":true},"londonGazette":true,"insolvencyDisqualifiedOfficers":true,"fairPaymentCode":true,"evidenceCoverage":true,"relatedCompanies":false,"aiInterpretation":true}'::jsonb
    WHEN 'agency_pack' THEN '{"companiesHouse":{"profile":true,"addressHistory":true,"officers":true,"filingHistory":true,"charges":true,"insolvency":true},"registryTrust":{"enabled":true,"includeAmounts":true,"includeSatisfaction":true},"londonGazette":true,"insolvencyDisqualifiedOfficers":true,"fairPaymentCode":true,"evidenceCoverage":true,"relatedCompanies":false,"aiInterpretation":true}'::jsonb
  END,
  true
);--> statement-breakpoint
CREATE INDEX "fair_payment_code_statuses_verified_at_idx" ON "fair_payment_code_statuses" USING btree ("verified_at");--> statement-breakpoint
CREATE INDEX "company_data_snapshots_report_idx" ON "company_data_snapshots" USING btree ("report_id");--> statement-breakpoint
CREATE UNIQUE INDEX "company_data_snapshots_report_provider_operation_attempt_unique" ON "company_data_snapshots" USING btree ("report_id","provider","operation","attempt");
