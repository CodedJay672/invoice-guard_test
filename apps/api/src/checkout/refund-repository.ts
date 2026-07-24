import { finalizeCreditRefund, schema, type Database } from "@workspace/db";
import type { RefundRequest } from "@workspace/validation";
import { and, eq, gt } from "drizzle-orm";

import { redeemablePurchasePredicate } from "./credit-eligibility.js";
import { CheckoutValidationError, type RefundRepository } from "./types.js";

export class DrizzleRefundRepository implements RefundRepository {
  constructor(private readonly db: Database) {}

  async createUnusedCreditRefund(
    input: RefundRequest & { requestedByClerkUserId: string },
  ): Promise<{ refundRequestId: string }> {
    return this.db.transaction(async (tx) => {
      const prior = (
        await tx
          .select({ id: schema.creditRefundRequests.id })
          .from(schema.creditRefundRequests)
          .where(eq(schema.creditRefundRequests.idempotencyKey, input.idempotencyKey))
          .limit(1)
      )[0];
      if (prior) return { refundRequestId: prior.id };
      const purchase = (
        await tx
          .select()
          .from(schema.creditPurchases)
          .where(
            and(
              eq(schema.creditPurchases.id, input.purchaseId),
              redeemablePurchasePredicate(),
              gt(schema.creditPurchases.availableQuantity, input.creditQuantity - 1),
            ),
          )
          .for("update")
          .limit(1)
      )[0];
      if (!purchase)
        throw new CheckoutValidationError("The requested unused credits are not refundable.");
      const amountPence = purchase.unitPricePence * input.creditQuantity;
      const request = (
        await tx
          .insert(schema.creditRefundRequests)
          .values({
            creditPurchaseId: purchase.id,
            requestedByClerkUserId: input.requestedByClerkUserId,
            creditQuantity: input.creditQuantity,
            amountPence,
            reason: input.reason,
            idempotencyKey: input.idempotencyKey,
            previousPurchaseStatus: purchase.status,
          })
          .returning({ id: schema.creditRefundRequests.id })
      )[0];
      if (!request) throw new Error("Refund request creation failed.");
      await tx
        .update(schema.creditPurchases)
        .set({ status: "refund_pending", updatedAt: new Date() })
        .where(eq(schema.creditPurchases.id, purchase.id));
      await tx.insert(schema.adminAuditLogs).values({
        adminClerkUserId: input.requestedByClerkUserId,
        action: "credit_refund_requested",
        targetType: "credit_purchase",
        targetId: purchase.id,
        metadata: { creditQuantity: input.creditQuantity, amountPence, reason: input.reason },
      });
      return { refundRequestId: request.id };
    });
  }

  async getRefundStatus(
    refundRequestId: string,
  ): Promise<
    { status: "queued" | "processing" | "succeeded" | "failed"; amountPence: number } | undefined
  > {
    return (
      await this.db
        .select({
          status: schema.creditRefundRequests.status,
          amountPence: schema.creditRefundRequests.amountPence,
        })
        .from(schema.creditRefundRequests)
        .where(eq(schema.creditRefundRequests.id, refundRequestId))
        .limit(1)
    )[0];
  }

  async confirmRefund(input: {
    refundRequestId: string;
    stripeRefundId: string;
    succeeded: boolean;
    failureCode?: string;
  }): Promise<void> {
    await finalizeCreditRefund(this.db, input);
  }
}
