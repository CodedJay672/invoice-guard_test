ALTER TABLE "companies" ADD COLUMN "cessation_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "registered_office_address_1" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "registered_office_address_2" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "registered_office_postal_code" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "registered_office_po_box" text;
