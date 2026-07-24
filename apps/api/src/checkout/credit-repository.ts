import { randomBytes } from "node:crypto";

import { schema, type Database } from "@workspace/db";
import type { PaidReportEntitlements, RedeemCreditResult } from "@workspace/validation";
import { and, asc, count, eq, gt, sql, sum } from "drizzle-orm";

import { redeemablePurchasePredicate } from "./credit-eligibility.js";
import { CheckoutValidationError, type CreditRepository } from "./types.js";

export class DrizzleCreditRepository implements CreditRepository {
  constructor(private readonly db: Database) {}

  async getCreditBalance(
    clerkUserId: string,
  ): Promise<{ redeemableCredits: number; eligiblePurchaseCount: number }> {
    const result = (
      await this.db
        .select({
          redeemableCredits: sum(schema.creditPurchases.availableQuantity),
          eligiblePurchaseCount: count(schema.creditPurchases.id),
        })
        .from(schema.creditPurchases)
        .where(
          and(eq(schema.creditPurchases.clerkUserId, clerkUserId), redeemablePurchasePredicate()),
        )
    )[0];
    return {
      redeemableCredits: Number(result?.redeemableCredits ?? 0),
      eligiblePurchaseCount: result?.eligiblePurchaseCount ?? 0,
    };
  }

  async redeemCredit(input: {
    clerkUserId: string;
    companyNumber: string;
    companyName: string;
    idempotencyKey: string;
    entitlements: PaidReportEntitlements;
  }): Promise<RedeemCreditResult & { reportId: string }> {
    return this.db.transaction(async (tx) => {
      const existing = (
        await tx
          .select({
            id: schema.purchasedReports.id,
            reportReference: schema.purchasedReports.reportReference,
          })
          .from(schema.purchasedReports)
          .where(
            and(
              eq(schema.purchasedReports.clerkUserId, input.clerkUserId),
              eq(schema.purchasedReports.creditRedemptionAttemptId, input.idempotencyKey),
            ),
          )
          .limit(1)
      )[0];
      if (existing) {
        const balance = await this.getCreditBalance(input.clerkUserId);
        return {
          reportId: existing.id,
          reportReference: existing.reportReference,
          remainingCredits: balance.redeemableCredits,
          lifecycleUrl: `/reports/${existing.reportReference}`,
        };
      }
      const purchase = (
        await tx
          .select()
          .from(schema.creditPurchases)
          .where(
            and(
              eq(schema.creditPurchases.clerkUserId, input.clerkUserId),
              redeemablePurchasePredicate(),
            ),
          )
          .orderBy(asc(schema.creditPurchases.createdAt))
          .for("update", { skipLocked: true })
          .limit(1)
      )[0];
      if (!purchase) throw new CheckoutValidationError("No report credits are available.");
      const claimed = await tx
        .update(schema.creditPurchases)
        .set({
          availableQuantity: sql`${schema.creditPurchases.availableQuantity} - 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.creditPurchases.id, purchase.id),
            gt(schema.creditPurchases.availableQuantity, 0),
          ),
        )
        .returning({ id: schema.creditPurchases.id });
      if (!claimed[0]) throw new CheckoutValidationError("No report credits are available.");
      const account = await tx
        .update(schema.creditAccounts)
        .set({
          availableCredits: sql`${schema.creditAccounts.availableCredits} - 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.creditAccounts.clerkUserId, input.clerkUserId),
            gt(schema.creditAccounts.availableCredits, 0),
          ),
        )
        .returning({ availableCredits: schema.creditAccounts.availableCredits });
      if (!account[0]) throw new CheckoutValidationError("No report credits are available.");
      const reportReference = createReportReference();
      const report = (
        await tx
          .insert(schema.purchasedReports)
          .values({
            reportReference,
            clerkUserId: input.clerkUserId,
            companiesHouseNumber: input.companyNumber,
            companyName: input.companyName,
            reportTier: purchase.reportTier,
            creditPurchaseId: purchase.id,
            creditRedemptionAttemptId: input.idempotencyKey,
            entitlements: input.entitlements,
            amountPaidPence: purchase.unitPricePence,
            currency: purchase.currency,
            status: "pending",
          })
          .returning({ id: schema.purchasedReports.id })
      )[0];
      if (!report) throw new Error("Credit report creation failed.");
      await tx.insert(schema.creditLedgerEntries).values({
        clerkUserId: input.clerkUserId,
        entryType: "report_redemption",
        creditPurchaseId: purchase.id,
        creditDelta: -1,
        reportTier: purchase.reportTier,
        reportId: report.id,
      });
      return {
        reportId: report.id,
        reportReference,
        remainingCredits: account[0].availableCredits,
        lifecycleUrl: `/reports/${reportReference}`,
      };
    });
  }
}

function createReportReference(): string {
  return `IG-${new Date().getUTCFullYear()}-${randomBytes(6).toString("hex").toUpperCase()}`;
}
