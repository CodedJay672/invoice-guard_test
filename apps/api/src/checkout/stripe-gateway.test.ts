import assert from "node:assert/strict";
import test from "node:test";

import Stripe from "stripe";

import { StripeSdkGateway } from "./stripe-gateway.js";

const webhookSecret = "whsec_test_invoiceguard";
const payload = JSON.stringify({
  id: "evt_signature_test",
  object: "event",
  type: "checkout.session.completed",
  created: 1,
  livemode: false,
  data: { object: { id: "cs_test_signature" } },
});

void test("Stripe gateway verifies the exact raw webhook payload", () => {
  const stripe = new Stripe("sk_test_invoiceguard");
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret });
  const gateway = new StripeSdkGateway("sk_test_invoiceguard", webhookSecret);

  assert.equal(gateway.constructEvent(Buffer.from(payload), signature).id, "evt_signature_test");
});

void test("Stripe gateway rejects an invalid webhook signature", () => {
  const gateway = new StripeSdkGateway("sk_test_invoiceguard", webhookSecret);
  assert.throws(
    () => gateway.constructEvent(Buffer.from(payload), "t=1,v1=invalid"),
    Stripe.errors.StripeSignatureVerificationError,
  );
});
