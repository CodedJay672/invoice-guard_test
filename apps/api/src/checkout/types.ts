import type Stripe from "stripe";

import type {
  CheckoutStatus,
  CreateCheckoutSessionInput,
  PaidReportEntitlements,
  ReportTier,
  RedeemCreditResult,
  RefundRequest,
} from "@workspace/validation";

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface CheckoutSessionState {
  id: string;
  status: Stripe.Checkout.Session.Status | null;
  paymentStatus: Stripe.Checkout.Session.PaymentStatus;
  clerkUserId: string | undefined;
}

export interface StripeGateway {
  createSession(input: {
    attemptId: string;
    appUrl: string;
    companyNumber: string;
    companyName: string;
    email: string;
    clerkUserId: string;
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
export interface RefundQueue {
  enqueue(refundRequestId: string): Promise<void>;
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
  clerkUserId: string;
  amountPaidPence: number;
  currency: string;
  entitlements: PaidReportEntitlements;
  creditQuantity: number;
  eventPayload: Record<string, unknown>;
}

export interface PaidReportEventResult {
  reportId: string;
  purchaseId: string;
  alreadyProcessed: boolean;
}

export interface CreditRepository {
  getCreditBalance(
    clerkUserId: string,
  ): Promise<{ redeemableCredits: number; eligiblePurchaseCount: number }>;
  redeemCredit(input: {
    clerkUserId: string;
    companyNumber: string;
    companyName: string;
    idempotencyKey: string;
    entitlements: PaidReportEntitlements;
  }): Promise<RedeemCreditResult & { reportId: string }>;
}

export interface RefundRepository {
  createUnusedCreditRefund(
    input: RefundRequest & { requestedByClerkUserId: string },
  ): Promise<{ refundRequestId: string }>;
  getRefundStatus(
    refundRequestId: string,
  ): Promise<
    { status: "queued" | "processing" | "succeeded" | "failed"; amountPence: number } | undefined
  >;
  confirmRefund(input: {
    refundRequestId: string;
    stripeRefundId: string;
    succeeded: boolean;
    failureCode?: string;
  }): Promise<void>;
}

export interface CheckoutSessionRepository {
  findReportBySessionId(
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
  >;
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
  purchase?: {
    purchaseId: string;
    creditsPurchased: number;
    creditsUsed: 1;
    remainingCredits: number;
  };
}

export interface CreditBalanceResult {
  redeemableCredits: number;
  eligiblePurchaseCount: number;
}

export class CheckoutUnavailableError extends Error {}
export class CheckoutAuthorizationError extends Error {}
export class CheckoutValidationError extends Error {}

export type AuthenticatedCreateCheckoutSessionInput = CreateCheckoutSessionInput & {
  clerkUserId: string;
  verifiedEmail: string;
};
