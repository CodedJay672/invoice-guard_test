import { randomBytes } from "node:crypto";

import { schema, type Database } from "@workspace/db";
import { and, asc, count, eq, gt, sql, sum } from "drizzle-orm";

import {
  CheckoutValidationError,
  type CheckoutRepository,
  type PaidReportEventInput,
  type PaidReportEventResult,
} from "./types.js";
import { redeemablePurchasePredicate } from "./credit-eligibility.js";

export class DrizzleCheckoutRepository implements CheckoutRepository {
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
    entitlements: import("@workspace/validation").PaidReportEntitlements;
  }): Promise<import("@workspace/validation").RedeemCreditResult & { reportId: string }> {
    return this.db.transaction(async (tx) => {
      const existing = await tx
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
        .limit(1);
      if (existing[0]) {
        const balance = await this.getCreditBalance(input.clerkUserId);
        return {
          reportId: existing[0].id,
          reportReference: existing[0].reportReference,
          remainingCredits: balance.redeemableCredits,
          lifecycleUrl: `/reports/${existing[0].reportReference}`,
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

  async createUnusedCreditRefund(
    input: import("@workspace/validation").RefundRequest & { requestedByClerkUserId: string },
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
    await this.db.transaction(async (tx) => {
      const request = (
        await tx
          .select()
          .from(schema.creditRefundRequests)
          .where(eq(schema.creditRefundRequests.id, input.refundRequestId))
          .limit(1)
      )[0];
      if (!request || request.status === "succeeded") return;
      const purchase = (
        await tx
          .select()
          .from(schema.creditPurchases)
          .where(eq(schema.creditPurchases.id, request.creditPurchaseId))
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
        if (!request.reportId)
          await tx
            .update(schema.creditPurchases)
            .set({ status: request.previousPurchaseStatus, updatedAt: new Date() })
            .where(eq(schema.creditPurchases.id, purchase.id));
        return;
      }
      const unused = request.reportId === null;
      if (unused) {
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
          refundReference: input.stripeRefundId,
        });
      }
      await tx
        .update(schema.creditPurchases)
        .set({
          availableQuantity: unused
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
      if (request.reportId)
        await tx
          .update(schema.purchasedReports)
          .set({ status: "refunded", updatedAt: new Date() })
          .where(eq(schema.purchasedReports.id, request.reportId));
    });
  }

  async findReportBySessionId(
    sessionId: string,
    clerkUserId: string,
  ): Promise<
    | {
        id: string;
        purchaseId: string | null;
        creditQuantity: number | null;
        remainingCredits: number | null;
      }
    | undefined
  > {
    const rows = await this.db
      .select({
        id: schema.purchasedReports.id,
        purchaseId: schema.purchasedReports.creditPurchaseId,
        creditQuantity: schema.creditPurchases.originalQuantity,
        remainingCredits: schema.creditPurchases.availableQuantity,
      })
      .from(schema.purchasedReports)
      .leftJoin(
        schema.creditPurchases,
        eq(schema.creditPurchases.id, schema.purchasedReports.creditPurchaseId),
      )
      .where(
        and(
          eq(schema.purchasedReports.stripeCheckoutSessionId, sessionId),
          eq(schema.purchasedReports.clerkUserId, clerkUserId),
        ),
      )
      .limit(1);
    return rows[0];
  }

  async recordHandledEvent(input: {
    eventId: string;
    eventType: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    await this.db
      .insert(schema.stripeEvents)
      .values({
        id: input.eventId,
        eventType: input.eventType,
        payload: input.payload,
        processedAt: new Date(),
      })
      .onConflictDoNothing({ target: schema.stripeEvents.id });
  }

  async preparePaidReport(input: PaidReportEventInput): Promise<PaidReportEventResult> {
    return this.db.transaction(async (transaction) => {
      await transaction
        .insert(schema.stripeEvents)
        .values({ id: input.eventId, eventType: input.eventType, payload: input.eventPayload })
        .onConflictDoNothing({ target: schema.stripeEvents.id });

      const eventRows = await transaction
        .select({ processedAt: schema.stripeEvents.processedAt })
        .from(schema.stripeEvents)
        .where(eq(schema.stripeEvents.id, input.eventId))
        .limit(1);

      const existingRows = await transaction
        .select({ id: schema.purchasedReports.id })
        .from(schema.purchasedReports)
        .where(eq(schema.purchasedReports.stripeCheckoutSessionId, input.checkoutSessionId))
        .limit(1);
      let report = existingRows[0];

      if (!report) {
        await transaction
          .insert(schema.creditAccounts)
          .values({ clerkUserId: input.clerkUserId })
          .onConflictDoNothing({ target: schema.creditAccounts.clerkUserId });

        const purchaseRows = await transaction
          .insert(schema.creditPurchases)
          .values({
            clerkUserId: input.clerkUserId,
            reportTier: input.tier,
            originalQuantity: input.creditQuantity,
            availableQuantity: input.creditQuantity - 1,
            unitPricePence: Math.round(input.amountPaidPence / input.creditQuantity),
            amountPaidPence: input.amountPaidPence,
            currency: input.currency,
            stripePaymentId: input.paymentId,
            stripeCheckoutSessionId: input.checkoutSessionId,
          })
          .onConflictDoNothing({ target: schema.creditPurchases.stripeCheckoutSessionId })
          .returning({ id: schema.creditPurchases.id });
        const purchase =
          purchaseRows[0] ??
          (
            await transaction
              .select({ id: schema.creditPurchases.id })
              .from(schema.creditPurchases)
              .where(eq(schema.creditPurchases.stripeCheckoutSessionId, input.checkoutSessionId))
              .limit(1)
          )[0];
        if (!purchase) throw new Error("Credit purchase creation did not converge.");

        const inserted = await transaction
          .insert(schema.purchasedReports)
          .values({
            reportReference: createReportReference(),
            clerkUserId: input.clerkUserId,
            companiesHouseNumber: input.companyNumber,
            companyName: input.companyName,
            reportTier: input.tier,
            creditPurchaseId: purchase.id,
            stripePaymentId: input.paymentId,
            stripeCheckoutSessionId: input.checkoutSessionId,
            amountPaidPence: input.amountPaidPence,
            currency: input.currency,
            entitlements: input.entitlements,
            status: "pending",
          })
          .onConflictDoNothing({ target: schema.purchasedReports.stripeCheckoutSessionId })
          .returning({ id: schema.purchasedReports.id });
        report = inserted[0];
      }

      if (!report) {
        const converged = await transaction
          .select({ id: schema.purchasedReports.id })
          .from(schema.purchasedReports)
          .where(eq(schema.purchasedReports.stripeCheckoutSessionId, input.checkoutSessionId))
          .limit(1);
        report = converged[0];
      }

      if (!report) throw new Error("Pending report creation did not converge.");

      const purchaseRows = await transaction
        .select({ id: schema.creditPurchases.id })
        .from(schema.creditPurchases)
        .where(eq(schema.creditPurchases.stripeCheckoutSessionId, input.checkoutSessionId))
        .limit(1);
      const purchase = purchaseRows[0];
      if (!purchase) throw new Error("Credit purchase was not found.");

      if (!existingRows[0]) {
        await transaction.insert(schema.creditLedgerEntries).values([
          {
            clerkUserId: input.clerkUserId,
            entryType: "purchase_grant",
            creditPurchaseId: purchase.id,
            creditDelta: input.creditQuantity,
            reportTier: input.tier,
            stripeCheckoutSessionId: input.checkoutSessionId,
          },
          {
            clerkUserId: input.clerkUserId,
            entryType: "report_redemption",
            creditPurchaseId: purchase.id,
            creditDelta: -1,
            reportTier: input.tier,
            reportId: report.id,
          },
        ]);

        await transaction
          .update(schema.creditAccounts)
          .set({
            availableCredits: sql`${schema.creditAccounts.availableCredits} + ${input.creditQuantity - 1}`,
            updatedAt: new Date(),
          })
          .where(eq(schema.creditAccounts.clerkUserId, input.clerkUserId));
      }
      return {
        reportId: report.id,
        purchaseId: purchase.id,
        alreadyProcessed: Boolean(eventRows[0]?.processedAt),
      };
    });
  }

  async markEventProcessed(eventId: string): Promise<void> {
    await this.db
      .update(schema.stripeEvents)
      .set({ processedAt: new Date() })
      .where(eq(schema.stripeEvents.id, eventId));
  }
}

function createReportReference(): string {
  return `IG-${new Date().getUTCFullYear()}-${randomBytes(6).toString("hex").toUpperCase()}`;
}
