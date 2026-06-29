import Stripe from "stripe";

import type { CheckoutSessionResult, CheckoutSessionState, StripeGateway } from "./types.js";

export class StripeSdkGateway implements StripeGateway {
  private readonly client: Stripe;

  constructor(
    secretKey: string,
    private readonly webhookSecret: string,
  ) {
    this.client = new Stripe(secretKey, {
      apiVersion: "2026-06-24.dahlia",
    });
  }

  async createSession(input: {
    attemptId: string;
    appUrl: string;
    companyNumber: string;
    companyName: string;
    email: string;
    pricePence: number;
    currency: string;
    tier: "basic" | "standard" | "premium";
  }): Promise<CheckoutSessionResult> {
    const cancelParams = new URLSearchParams({
      companyNumber: input.companyNumber,
      tier: input.tier,
      q: input.companyName,
    });
    const session = await this.client.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: input.email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: input.currency.toLowerCase(),
              unit_amount: input.pricePence,
              product_data: { name: `${input.companyName} — ${input.tier} report` },
            },
          },
        ],
        metadata: { companyNumber: input.companyNumber, tier: input.tier },
        success_url: `${input.appUrl}/checkout/status?sessionId={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.appUrl}/checkout?${cancelParams.toString()}&cancelled=1`,
      },
      { idempotencyKey: input.attemptId },
    );

    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    return { sessionId: session.id, url: session.url };
  }

  async retrieveSession(sessionId: string): Promise<CheckoutSessionState> {
    const session = await this.client.checkout.sessions.retrieve(sessionId);
    return { id: session.id, status: session.status, paymentStatus: session.payment_status };
  }

  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    return this.client.webhooks.constructEvent(payload, signature, this.webhookSecret);
  }
}
