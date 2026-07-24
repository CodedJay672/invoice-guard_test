ALTER TABLE "purchased_reports" ADD COLUMN "amount_paid_pence" integer;--> statement-breakpoint
ALTER TABLE "purchased_reports" ADD COLUMN "currency" varchar(3);--> statement-breakpoint
UPDATE "purchased_reports"
SET
  "amount_paid_pence" = "report_products"."price_pence",
  "currency" = "report_products"."currency"
FROM "report_products"
WHERE "purchased_reports"."report_tier" = "report_products"."tier";--> statement-breakpoint
ALTER TABLE "purchased_reports" ALTER COLUMN "amount_paid_pence" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "purchased_reports" ALTER COLUMN "currency" SET NOT NULL;
