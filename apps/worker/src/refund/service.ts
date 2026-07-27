import Stripe from "stripe";
import { and, eq } from "drizzle-orm";
import { finalizeCreditRefund, schema, type Database } from "@workspace/db";

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
    let refund: Awaited<ReturnType<CreditRefundGateway["create"]>>;
    try {
      refund = await this.gateway.create({
        paymentIntentId: purchase.stripePaymentId,
        amountPence: request.amountPence,
        refundRequestId: request.id,
        idempotencyKey: request.idempotencyKey,
      });
    } catch (error) {
      await this.db
        .update(schema.creditRefundRequests)
        .set({ status: "queued", failureCode: "stripe_unavailable", updatedAt: new Date() })
        .where(eq(schema.creditRefundRequests.id, request.id));
      throw error;
    }
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
    await finalizeCreditRefund(this.db, {
      refundRequestId: request.id,
      stripeRefundId: refund.id,
      succeeded: refund.status === "succeeded",
      ...(refund.status === "succeeded"
        ? {}
        : { failureCode: refund.failureReason ?? refund.status }),
    });
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
    this.stripe = new Stripe(secretKey);
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
