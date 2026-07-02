DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "purchased_reports" WHERE "clerk_user_id" IS NULL) THEN
    RAISE EXCEPTION 'AUTH-C migration blocked: purchased_reports contains ownerless rows';
  END IF;
END $$;--> statement-breakpoint
DROP INDEX "purchased_reports_guest_token_idx";--> statement-breakpoint
ALTER TABLE "purchased_reports" ALTER COLUMN "clerk_user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "purchased_reports" DROP COLUMN "guest_email";--> statement-breakpoint
ALTER TABLE "purchased_reports" DROP COLUMN "guest_access_token_hash";--> statement-breakpoint
ALTER TABLE "purchased_reports" DROP COLUMN "guest_access_expires_at";--> statement-breakpoint
ALTER TABLE "purchased_reports" DROP COLUMN "claimed_at";
