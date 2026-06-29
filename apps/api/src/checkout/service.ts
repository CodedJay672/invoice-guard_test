import type Stripe from "stripe";

import { guestEmailSchema, reportTierSchema } from "@workspace/validation";

import { CompanyService } from "../companies/service.js";
import type { ReportProductRepository } from "../report-products/repository.js";
import type {
  CheckoutRepository,
  CheckoutSessionResult,
  CheckoutStatusResult,
  AuthenticatedCreateCheckoutSessionInput,
  ReportGenerationQueue,
  StripeGateway,
} from "./types.js";
import { CheckoutUnavailableError, CheckoutValidationError } from "./types.js";

export interface CheckoutServiceDependencies {
  appUrl: string;
  companyService: CompanyService;
  reportProductRepository: ReportProductRepository;
  checkoutRepository: CheckoutRepository;
  stripeGateway: StripeGateway;
  reportGenerationQueue: ReportGenerationQueue;
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
        email: input.email,
        clerkUserId: input.clerkUserId,
        pricePence: product.pricePence,
        currency: "GBP",
        tier: product.tier,
      });
    } catch {
      throw new CheckoutUnavailableError("Checkout could not be started.");
    }
  }

  async getStatus(sessionId: string): Promise<CheckoutStatusResult> {
    const report = await this.dependencies.checkoutRepository.findReportBySessionId(sessionId);
    if (report) return { status: "paid_pending" };

    try {
      const session = await this.dependencies.stripeGateway.retrieveSession(sessionId);
      if (session.status === "expired") return { status: "failed" };
      if (session.status === "complete" && session.paymentStatus === "unpaid") {
        return { status: "delayed" };
      }
      return { status: "confirming" };
    } catch {
      throw new CheckoutUnavailableError("Payment status could not be retrieved.");
    }
  }

  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    return this.dependencies.stripeGateway.constructEvent(payload, signature);
  }

  async processEvent(event: Stripe.Event): Promise<void> {
    const payload = { livemode: event.livemode, created: event.created };
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
    const emailResult = guestEmailSchema.safeParse(session.customer_details?.email);
    const companyNumber = metadata["companyNumber"];
    const clerkUserId = parseClerkUserId(metadata["clerkUserId"]);
    const amountPaidPence = session.amount_total;
    const currency = session.currency?.toUpperCase();

    if (
      session.mode !== "payment" ||
      !tierResult.success ||
      !emailResult.success ||
      !companyNumber ||
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
