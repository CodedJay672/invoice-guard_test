import { checkoutSessionIdSchema, createCheckoutSessionSchema } from "@workspace/validation";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import Stripe from "stripe";

import { sendApiError } from "../http.js";
import { CheckoutService } from "./service.js";
import { CheckoutUnavailableError, CheckoutValidationError } from "./types.js";

export function registerStripeWebhookRoute(app: Express, checkoutService: CheckoutService): void {
  app.post(
    "/webhooks/stripe",
    express.raw({ type: "application/json" }),
    (request: Request, response: Response, next: NextFunction) => {
      void handleWebhook(request, response, checkoutService).catch(next);
    },
  );
}

export function registerCheckoutRoutes(app: Express, checkoutService: CheckoutService): void {
  app.post("/checkout/sessions", (request: Request, response: Response, next: NextFunction) => {
    void handleCreateSession(request, response, checkoutService).catch(next);
  });
  app.get(
    "/checkout/sessions/:sessionId/status",
    (request: Request, response: Response, next: NextFunction) => {
      void handleStatus(request, response, checkoutService).catch(next);
    },
  );
}

async function handleCreateSession(
  request: Request,
  response: Response,
  service: CheckoutService,
): Promise<void> {
  const input = createCheckoutSessionSchema.safeParse(request.body);
  if (!input.success) {
    sendApiError(
      response,
      400,
      "invalid_checkout",
      "Check the company, report, and email details.",
    );
    return;
  }
  try {
    response.status(201).json({ data: await service.createSession(input.data) });
  } catch (error) {
    handleCheckoutError(error, response);
  }
}

async function handleStatus(
  request: Request,
  response: Response,
  service: CheckoutService,
): Promise<void> {
  const sessionId = checkoutSessionIdSchema.safeParse(request.params["sessionId"]);
  if (!sessionId.success) {
    sendApiError(response, 400, "invalid_checkout_session", "Checkout Session ID is invalid.");
    return;
  }
  try {
    response.json({ data: await service.getStatus(sessionId.data) });
  } catch (error) {
    handleCheckoutError(error, response);
  }
}

async function handleWebhook(
  request: Request,
  response: Response,
  service: CheckoutService,
): Promise<void> {
  const signature = request.header("stripe-signature");
  if (!signature || !Buffer.isBuffer(request.body)) {
    sendApiError(response, 400, "invalid_stripe_signature", "Webhook signature is invalid.");
    return;
  }
  try {
    const event = service.constructEvent(request.body, signature);
    await service.processEvent(event);
    response.status(200).json({ data: { received: true } });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      sendApiError(response, 400, "invalid_stripe_signature", "Webhook signature is invalid.");
      return;
    }
    handleCheckoutError(error, response);
  }
}

function handleCheckoutError(error: unknown, response: Response): void {
  if (error instanceof CheckoutValidationError) {
    sendApiError(response, 400, "invalid_checkout", error.message);
    return;
  }
  if (error instanceof CheckoutUnavailableError) {
    sendApiError(response, 503, "checkout_unavailable", "Checkout is temporarily unavailable.");
    return;
  }
  throw error;
}
