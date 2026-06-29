import { randomBytes } from "node:crypto";

import { schema, type Database } from "@workspace/db";
import { eq } from "drizzle-orm";

import type { CheckoutRepository, PaidReportEventInput, PaidReportEventResult } from "./types.js";

export class DrizzleCheckoutRepository implements CheckoutRepository {
  constructor(private readonly db: Database) {}

  async findReportBySessionId(sessionId: string): Promise<{ id: string } | undefined> {
    const rows = await this.db
      .select({ id: schema.purchasedReports.id })
      .from(schema.purchasedReports)
      .where(eq(schema.purchasedReports.stripeCheckoutSessionId, sessionId))
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
        const inserted = await transaction
          .insert(schema.purchasedReports)
          .values({
            reportReference: createReportReference(),
            guestEmail: input.email,
            companiesHouseNumber: input.companyNumber,
            companyName: input.companyName,
            reportTier: input.tier,
            stripePaymentId: input.paymentId,
            stripeCheckoutSessionId: input.checkoutSessionId,
            amountPaidPence: input.amountPaidPence,
            currency: input.currency,
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
      return { reportId: report.id, alreadyProcessed: Boolean(eventRows[0]?.processedAt) };
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
