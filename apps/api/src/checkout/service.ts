import type Stripe from "stripe";

import { reportTierSchema, verifiedEmailSchema } from "@workspace/validation";

import { CompanyService } from "../companies/service.js";
import type { ReportProductRepository } from "../report-products/repository.js";
import type {
  CheckoutRepository,
  CheckoutSessionResult,
  CheckoutStatusResult,
  AuthenticatedCreateCheckoutSessionInput,
  ReportGenerationQueue,
  RefundQueue,
  StripeGateway,
} from "./types.js";
import {
  CheckoutAuthorizationError,
  CheckoutUnavailableError,
  CheckoutValidationError,
} from "./types.js";

export interface CheckoutServiceDependencies {
  appUrl: string;
  companyService: CompanyService;
  reportProductRepository: ReportProductRepository;
  checkoutRepository: CheckoutRepository;
  stripeGateway: StripeGateway;
  reportGenerationQueue: ReportGenerationQueue;
  refundQueue?: RefundQueue;
  adminEmail?: string;
}

export class CheckoutService {
  constructor(private readonly dependencies: CheckoutServiceDependencies) {}

  async createSession(
    input: AuthenticatedCreateCheckoutSessionInput,
  ): Promise<CheckoutSessionResult> {
    const product = await this.dependencies.reportProductRepository.findActiveByTier(input.tier);
    if (!product) throw new CheckoutValidationError("This report product is not available.");

    const company = await this.dependencies.companyService.getCompanyProfile(input.companyNumber);
    try {
      return await this.dependencies.stripeGateway.createSession({
        attemptId: input.attemptId,
        appUrl: this.dependencies.appUrl,
        companyNumber: company.companiesHouseNumber,
        companyName: company.companyName,
        email: input.verifiedEmail,
        clerkUserId: input.clerkUserId,
        pricePence: product.pricePence,
        currency: "GBP",
        tier: product.tier,
      });
    } catch {
      throw new CheckoutUnavailableError("Checkout could not be started.");
    }
  }

  async getStatus(sessionId: string, clerkUserId: string): Promise<CheckoutStatusResult> {
    const report = await this.dependencies.checkoutRepository.findReportBySessionId(
      sessionId,
      clerkUserId,
    );
    if (report) {
      return report.purchaseId && report.creditQuantity !== null && report.remainingCredits !== null
        ? {
            status: "paid_pending",
            purchase: {
              purchaseId: report.purchaseId,
              creditsPurchased: report.creditQuantity,
              creditsUsed: 1,
              remainingCredits: report.remainingCredits,
            },
          }
        : { status: "paid_pending" };
    }

    try {
      const session = await this.dependencies.stripeGateway.retrieveSession(sessionId);
      if (session.clerkUserId !== clerkUserId) {
        throw new CheckoutAuthorizationError("Checkout Session owner does not match.");
      }
      if (session.status === "expired") return { status: "failed" };
      if (session.status === "complete" && session.paymentStatus === "unpaid") {
        return { status: "delayed" };
      }
      return { status: "confirming" };
    } catch (error) {
      if (error instanceof CheckoutAuthorizationError) throw error;
      throw new CheckoutUnavailableError("Payment status could not be retrieved.");
    }
  }

  async getCreditBalance(
    clerkUserId: string,
  ): Promise<{ redeemableCredits: number; eligiblePurchaseCount: number }> {
    return this.dependencies.checkoutRepository.getCreditBalance(clerkUserId);
  }

  async redeemCredit(input: {
    clerkUserId: string;
    companyNumber: string;
    idempotencyKey: string;
  }): Promise<import("@workspace/validation").RedeemCreditResult> {
    const company = await this.dependencies.companyService.getCompanyProfile(input.companyNumber);
    const entitlements = (
      await this.dependencies.reportProductRepository.findActiveByTier("single_report")
    )?.entitlements;
    if (!entitlements) throw new CheckoutUnavailableError("Report entitlement is unavailable.");
    const redeemed = await this.dependencies.checkoutRepository.redeemCredit({
      clerkUserId: input.clerkUserId,
      companyNumber: company.companiesHouseNumber,
      companyName: company.companyName,
      idempotencyKey: input.idempotencyKey,
      entitlements,
    });
    await this.dependencies.reportGenerationQueue.enqueue(redeemed.reportId);
    return {
      reportReference: redeemed.reportReference,
      remainingCredits: redeemed.remainingCredits,
      lifecycleUrl: redeemed.lifecycleUrl,
    };
  }

  async createAdminRefund(
    input: import("@workspace/validation").RefundRequest & {
      clerkUserId: string;
      verifiedEmail: string;
    },
  ): Promise<{ refundRequestId: string }> {
    if (
      !this.dependencies.adminEmail ||
      input.verifiedEmail.toLowerCase() !== this.dependencies.adminEmail.toLowerCase()
    )
      throw new CheckoutAuthorizationError("Admin access is denied.");
    if (!this.dependencies.refundQueue)
      throw new CheckoutUnavailableError("Refund processing is unavailable.");
    const created = await this.dependencies.checkoutRepository.createUnusedCreditRefund({
      ...input,
      requestedByClerkUserId: input.clerkUserId,
    });
    await this.dependencies.refundQueue.enqueue(created.refundRequestId);
    return created;
  }
  async getAdminRefundStatus(input: {
    refundRequestId: string;
    verifiedEmail: string;
  }): Promise<{ status: "queued" | "processing" | "succeeded" | "failed"; amountPence: number }> {
    if (
      !this.dependencies.adminEmail ||
      input.verifiedEmail.toLowerCase() !== this.dependencies.adminEmail.toLowerCase()
    )
      throw new CheckoutAuthorizationError("Admin access is denied.");
    const result = await this.dependencies.checkoutRepository.getRefundStatus(
      input.refundRequestId,
    );
    if (!result) throw new CheckoutValidationError("Refund request was not found.");
    return result;
  }

  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    return this.dependencies.stripeGateway.constructEvent(payload, signature);
  }

  async processEvent(event: Stripe.Event): Promise<void> {
    const payload = { livemode: event.livemode, created: event.created };
    if (event.type === "refund.updated" || event.type === "refund.created") {
      const refund = event.data.object;
      const refundRequestId = refund.metadata?.["refundRequestId"];
      if (
        refundRequestId &&
        /^[0-9a-f-]{36}$/i.test(refundRequestId) &&
        (refund.status === "succeeded" ||
          refund.status === "failed" ||
          refund.status === "canceled")
      ) {
        await this.dependencies.checkoutRepository.confirmRefund({
          refundRequestId,
          stripeRefundId: refund.id,
          succeeded: refund.status === "succeeded",
          failureCode: refund.failure_reason ?? refund.status,
        });
      }
      await this.dependencies.checkoutRepository.recordHandledEvent({
        eventId: event.id,
        eventType: event.type,
        payload: {
          ...payload,
          refundRequestId,
          stripeRefundId: refund.id,
          refundStatus: refund.status,
        },
      });
      return;
    }
    if (!isCheckoutEvent(event.type)) {
      await this.dependencies.checkoutRepository.recordHandledEvent({
        eventId: event.id,
        eventType: event.type,
        payload,
      });
      return;
    }

    const session = event.data.object as Stripe.Checkout.Session;
    if (
      event.type === "checkout.session.async_payment_failed" ||
      session.payment_status !== "paid"
    ) {
      await this.dependencies.checkoutRepository.recordHandledEvent({
        eventId: event.id,
        eventType: event.type,
        payload: {
          ...payload,
          checkoutSessionId: session.id,
          paymentStatus: session.payment_status,
        },
      });
      return;
    }

    const metadata = session.metadata ?? {};
    const tierResult = reportTierSchema.safeParse(metadata["tier"]);
    const emailResult = verifiedEmailSchema.safeParse(session.customer_details?.email);
    const companyNumber = metadata["companyNumber"];
    const clerkUserId = parseClerkUserId(metadata["clerkUserId"]);
    const amountPaidPence = session.amount_total;
    const currency = session.currency?.toUpperCase();

    if (
      session.mode !== "payment" ||
      !tierResult.success ||
      !emailResult.success ||
      !companyNumber ||
      !clerkUserId ||
      amountPaidPence === null ||
      currency !== "GBP"
    ) {
      throw new CheckoutValidationError("Paid Checkout Session metadata is invalid.");
    }

    const product = await this.dependencies.reportProductRepository.findActiveByTier(
      tierResult.data,
    );
    if (!product || product.pricePence !== amountPaidPence) {
      throw new CheckoutValidationError("Paid amount does not match the report product.");
    }

    const company = await this.dependencies.companyService.getCompanyProfile(companyNumber);
    const paymentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    const prepared = await this.dependencies.checkoutRepository.preparePaidReport({
      eventId: event.id,
      eventType: event.type,
      checkoutSessionId: session.id,
      paymentId,
      companyNumber: company.companiesHouseNumber,
      companyName: company.companyName,
      tier: product.tier,
      email: emailResult.data,
      clerkUserId,
      amountPaidPence,
      currency,
      entitlements: product.entitlements,
      creditQuantity: product.creditQuantity,
      eventPayload: {
        ...payload,
        checkoutSessionId: session.id,
        paymentStatus: session.payment_status,
      },
    });

    if (!prepared.alreadyProcessed) {
      await this.dependencies.reportGenerationQueue.enqueue(prepared.reportId);
      await this.dependencies.checkoutRepository.markEventProcessed(event.id);
    }
  }
}

function parseClerkUserId(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (!/^user_[A-Za-z0-9_-]{1,123}$/.test(value)) {
    throw new CheckoutValidationError("Paid Checkout Session owner metadata is invalid.");
  }
  return value;
}

function isCheckoutEvent(type: string): boolean {
  return (
    type === "checkout.session.completed" ||
    type === "checkout.session.async_payment_succeeded" ||
    type === "checkout.session.async_payment_failed"
  );
}
