import { randomBytes } from "node:crypto";

import { schema, type Database } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";

import type {
  CheckoutSessionRepository,
  PaidReportEventInput,
  PaidReportEventResult,
} from "./types.js";

export class DrizzleCheckoutSessionRepository implements CheckoutSessionRepository {
  constructor(private readonly db: Database) {}

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
    return (
      await this.db
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
        .limit(1)
    )[0];
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
    return this.db.transaction(async (tx) => {
      await tx
        .insert(schema.stripeEvents)
        .values({ id: input.eventId, eventType: input.eventType, payload: input.eventPayload })
        .onConflictDoNothing({ target: schema.stripeEvents.id });
      const event = (
        await tx
          .select({ processedAt: schema.stripeEvents.processedAt })
          .from(schema.stripeEvents)
          .where(eq(schema.stripeEvents.id, input.eventId))
          .limit(1)
      )[0];
      const existing = (
        await tx
          .select({ id: schema.purchasedReports.id })
          .from(schema.purchasedReports)
          .where(eq(schema.purchasedReports.stripeCheckoutSessionId, input.checkoutSessionId))
          .limit(1)
      )[0];
      let report = existing;
      if (!report) {
        await tx
          .insert(schema.creditAccounts)
          .values({ clerkUserId: input.clerkUserId })
          .onConflictDoNothing({ target: schema.creditAccounts.clerkUserId });
        const insertedPurchase = (
          await tx
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
            .returning({ id: schema.creditPurchases.id })
        )[0];
        const purchase =
          insertedPurchase ??
          (
            await tx
              .select({ id: schema.creditPurchases.id })
              .from(schema.creditPurchases)
              .where(eq(schema.creditPurchases.stripeCheckoutSessionId, input.checkoutSessionId))
              .limit(1)
          )[0];
        if (!purchase) throw new Error("Credit purchase creation did not converge.");
        report = (
          await tx
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
            .returning({ id: schema.purchasedReports.id })
        )[0];
      }
      report ??= (
        await tx
          .select({ id: schema.purchasedReports.id })
          .from(schema.purchasedReports)
          .where(eq(schema.purchasedReports.stripeCheckoutSessionId, input.checkoutSessionId))
          .limit(1)
      )[0];
      if (!report) throw new Error("Pending report creation did not converge.");
      const purchase = (
        await tx
          .select({ id: schema.creditPurchases.id })
          .from(schema.creditPurchases)
          .where(eq(schema.creditPurchases.stripeCheckoutSessionId, input.checkoutSessionId))
          .limit(1)
      )[0];
      if (!purchase) throw new Error("Credit purchase was not found.");
      if (!existing) {
        await tx.insert(schema.creditLedgerEntries).values([
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
        await tx
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
        alreadyProcessed: Boolean(event?.processedAt),
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
