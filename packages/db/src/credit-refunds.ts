import { and, eq, gt, sql } from "drizzle-orm";

import type { Database } from "./client.js";
import * as schema from "./schema/index.js";

export interface FinalizeCreditRefundInput {
  refundRequestId: string;
  stripeRefundId: string;
  succeeded: boolean;
  failureCode?: string | undefined;
}

export async function finalizeCreditRefund(
  db: Database,
  input: FinalizeCreditRefundInput,
): Promise<void> {
  await db.transaction(async (tx) => {
    const request = (
      await tx
        .select()
        .from(schema.creditRefundRequests)
        .where(eq(schema.creditRefundRequests.id, input.refundRequestId))
        .for("update")
        .limit(1)
    )[0];
    if (!request || request.status === "succeeded" || request.status === "failed") return;

    const purchase = (
      await tx
        .select()
        .from(schema.creditPurchases)
        .where(eq(schema.creditPurchases.id, request.creditPurchaseId))
        .for("update")
        .limit(1)
    )[0];
    if (!purchase) throw new Error("Refund purchase was not found.");

    if (!input.succeeded) {
      await tx
        .update(schema.creditRefundRequests)
        .set({
          status: "failed",
          stripeRefundId: input.stripeRefundId,
          failureCode: input.failureCode ?? "stripe_failed",
          updatedAt: new Date(),
        })
        .where(eq(schema.creditRefundRequests.id, request.id));
      if (!request.reportId) {
        await tx
          .update(schema.creditPurchases)
          .set({ status: request.previousPurchaseStatus, updatedAt: new Date() })
          .where(eq(schema.creditPurchases.id, purchase.id));
      }
      return;
    }

    const unusedRefund = request.reportId === null;
    if (unusedRefund && purchase.availableQuantity < request.creditQuantity) {
      throw new Error("Refund exceeds unused purchase credits.");
    }

    if (unusedRefund) {
      const account = await tx
        .update(schema.creditAccounts)
        .set({
          availableCredits: sql`${schema.creditAccounts.availableCredits} - ${request.creditQuantity}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.creditAccounts.clerkUserId, purchase.clerkUserId),
            gt(schema.creditAccounts.availableCredits, request.creditQuantity - 1),
          ),
        )
        .returning({ clerkUserId: schema.creditAccounts.clerkUserId });
      if (!account[0]) throw new Error("Refund would produce a negative credit balance.");

      await tx.insert(schema.creditLedgerEntries).values({
        clerkUserId: purchase.clerkUserId,
        entryType: "refund_reversal",
        creditPurchaseId: purchase.id,
        creditDelta: -request.creditQuantity,
        reportTier: purchase.reportTier,
        refundReference: input.stripeRefundId,
      });
    }

    await tx
      .update(schema.creditPurchases)
      .set({
        availableQuantity: unusedRefund
          ? sql`${schema.creditPurchases.availableQuantity} - ${request.creditQuantity}`
          : schema.creditPurchases.availableQuantity,
        amountRefundedPence: sql`${schema.creditPurchases.amountRefundedPence} + ${request.amountPence}`,
        status: sql`case when ${schema.creditPurchases.amountRefundedPence} + ${request.amountPence} >= ${purchase.amountPaidPence} then 'refunded' else 'partially_refunded' end`,
        updatedAt: new Date(),
      })
      .where(eq(schema.creditPurchases.id, purchase.id));
    await tx
      .update(schema.creditRefundRequests)
      .set({
        status: "succeeded",
        stripeRefundId: input.stripeRefundId,
        failureCode: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.creditRefundRequests.id, request.id));
    if (request.reportId) {
      await tx
        .update(schema.purchasedReports)
        .set({ status: "refunded", updatedAt: new Date() })
        .where(eq(schema.purchasedReports.id, request.reportId));
    }
  });
}
