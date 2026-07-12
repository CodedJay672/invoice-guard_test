import Stripe from "stripe";
import { and, eq, sql } from "drizzle-orm";
import { schema, type Database } from "@workspace/db";

export class CreditRefundService {
  constructor(
    private readonly db: Database,
    private readonly gateway: CreditRefundGateway,
  ) {}
  async process(refundRequestId: string): Promise<void> {
    const claimed = await this.db
      .update(schema.creditRefundRequests)
      .set({ status: "processing", updatedAt: new Date() })
      .where(
        and(
          eq(schema.creditRefundRequests.id, refundRequestId),
          eq(schema.creditRefundRequests.status, "queued"),
        ),
      )
      .returning();
    const request = claimed[0];
    if (!request) return;
    const purchase = (
      await this.db
        .select()
        .from(schema.creditPurchases)
        .where(eq(schema.creditPurchases.id, request.creditPurchaseId))
        .limit(1)
    )[0];
    if (!purchase?.stripePaymentId) throw new Error("Refund purchase payment is unavailable.");
    try {
      const refund = await this.gateway.create({
        paymentIntentId: purchase.stripePaymentId,
        amountPence: request.amountPence,
        refundRequestId: request.id,
        idempotencyKey: request.idempotencyKey,
      });
      if (
        refund.status !== "succeeded" &&
        refund.status !== "failed" &&
        refund.status !== "canceled"
      ) {
        await this.db
          .update(schema.creditRefundRequests)
          .set({ status: "processing", stripeRefundId: refund.id, updatedAt: new Date() })
          .where(eq(schema.creditRefundRequests.id, request.id));
        return;
      }
      await this.db.transaction(async (tx) => {
        const failed = refund.status === "failed" || refund.status === "canceled";
        await tx
          .update(schema.creditRefundRequests)
          .set({
            status: failed ? "failed" : "succeeded",
            stripeRefundId: refund.id,
            failureCode: refund.failureReason,
            updatedAt: new Date(),
          })
          .where(eq(schema.creditRefundRequests.id, request.id));
        if (!failed) {
          const unusedRefund = request.reportId === null;
          await tx
            .update(schema.creditPurchases)
            .set({
              availableQuantity: unusedRefund
                ? sql`${schema.creditPurchases.availableQuantity} - ${request.creditQuantity}`
                : purchase.availableQuantity,
              amountRefundedPence: purchase.amountRefundedPence + request.amountPence,
              status:
                purchase.amountRefundedPence + request.amountPence >= purchase.amountPaidPence
                  ? "refunded"
                  : "partially_refunded",
              updatedAt: new Date(),
            })
            .where(eq(schema.creditPurchases.id, purchase.id));
          if (unusedRefund) {
            await tx
              .update(schema.creditAccounts)
              .set({
                availableCredits: sql`${schema.creditAccounts.availableCredits} - ${request.creditQuantity}`,
                updatedAt: new Date(),
              })
              .where(eq(schema.creditAccounts.clerkUserId, purchase.clerkUserId));
            await tx.insert(schema.creditLedgerEntries).values({
              clerkUserId: purchase.clerkUserId,
              entryType: "refund_reversal",
              creditPurchaseId: purchase.id,
              creditDelta: -request.creditQuantity,
              reportTier: purchase.reportTier,
              refundReference: refund.id,
            });
          }
          if (request.reportId)
            await tx
              .update(schema.purchasedReports)
              .set({ status: "refunded", updatedAt: new Date() })
              .where(eq(schema.purchasedReports.id, request.reportId));
        } else if (request.reportId === null) {
          await tx
            .update(schema.creditPurchases)
            .set({ status: request.previousPurchaseStatus, updatedAt: new Date() })
            .where(eq(schema.creditPurchases.id, purchase.id));
        }
      });
    } catch (error) {
      await this.db
        .update(schema.creditRefundRequests)
        .set({ status: "queued", failureCode: "stripe_unavailable", updatedAt: new Date() })
        .where(eq(schema.creditRefundRequests.id, request.id));
      if (request.reportId === null)
        await this.db
          .update(schema.creditPurchases)
          .set({ status: request.previousPurchaseStatus, updatedAt: new Date() })
          .where(eq(schema.creditPurchases.id, request.creditPurchaseId));
      throw error;
    }
  }
}

export interface CreditRefundGateway {
  create(input: {
    paymentIntentId: string;
    amountPence: number;
    refundRequestId: string;
    idempotencyKey: string;
  }): Promise<{ id: string; status: Stripe.Refund["status"]; failureReason: string | null }>;
}

export class StripeCreditRefundGateway implements CreditRefundGateway {
  private readonly stripe: Stripe;
  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey, { apiVersion: "2026-06-24.dahlia" });
  }
  async create(input: {
    paymentIntentId: string;
    amountPence: number;
    refundRequestId: string;
    idempotencyKey: string;
  }): Promise<{ id: string; status: Stripe.Refund["status"]; failureReason: string | null }> {
    const refund = await this.stripe.refunds.create(
      {
        payment_intent: input.paymentIntentId,
        amount: input.amountPence,
        metadata: { refundRequestId: input.refundRequestId },
      },
      { idempotencyKey: input.idempotencyKey },
    );
    return { id: refund.id, status: refund.status, failureReason: refund.failure_reason ?? null };
  }
}
