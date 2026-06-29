import type Stripe from "stripe";

import type { CheckoutStatus, CreateCheckoutSessionInput, ReportTier } from "@workspace/validation";

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface CheckoutSessionState {
  id: string;
  status: Stripe.Checkout.Session.Status | null;
  paymentStatus: Stripe.Checkout.Session.PaymentStatus;
}

export interface StripeGateway {
  createSession(input: {
    attemptId: string;
    appUrl: string;
    companyNumber: string;
    companyName: string;
    email: string;
    clerkUserId?: string | undefined;
    pricePence: number;
    currency: string;
    tier: ReportTier;
  }): Promise<CheckoutSessionResult>;
  retrieveSession(sessionId: string): Promise<CheckoutSessionState>;
  constructEvent(payload: Buffer, signature: string): Stripe.Event;
}

export interface ReportGenerationQueue {
  enqueue(reportId: string): Promise<void>;
}

export interface PaidReportEventInput {
  eventId: string;
  eventType: string;
  checkoutSessionId: string;
  paymentId: string | undefined;
  companyNumber: string;
  companyName: string;
  tier: ReportTier;
  email: string;
  clerkUserId: string | undefined;
  amountPaidPence: number;
  currency: string;
  eventPayload: Record<string, unknown>;
}

export interface PaidReportEventResult {
  reportId: string;
  alreadyProcessed: boolean;
}

export interface CheckoutRepository {
  findReportBySessionId(sessionId: string): Promise<{ id: string } | undefined>;
  recordHandledEvent(input: {
    eventId: string;
    eventType: string;
    payload: Record<string, unknown>;
  }): Promise<void>;
  preparePaidReport(input: PaidReportEventInput): Promise<PaidReportEventResult>;
  markEventProcessed(eventId: string): Promise<void>;
}

export interface CheckoutStatusResult {
  status: CheckoutStatus;
}

export class CheckoutUnavailableError extends Error {}
export class CheckoutValidationError extends Error {}

export type AuthenticatedCreateCheckoutSessionInput = CreateCheckoutSessionInput & {
  clerkUserId?: string | undefined;
};
