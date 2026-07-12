import assert from "node:assert/strict";
import test from "node:test";

import type Stripe from "stripe";

import { entitlementsForTier } from "@workspace/validation/paid-report";

import type { CompanyService } from "../companies/service.js";
import type { ReportProductRepository } from "../report-products/repository.js";
import { CheckoutService } from "./service.js";
import type {
  CheckoutRepository,
  CheckoutSessionResult,
  CheckoutSessionState,
  PaidReportEventInput,
  PaidReportEventResult,
  ReportGenerationQueue,
  StripeGateway,
} from "./types.js";

const companyService = {
  getCompanyProfile: (companyNumber: string) =>
    Promise.resolve({
      companiesHouseNumber: companyNumber,
      companyName: "Example Limited",
      companyStatus: "active",
      registeredOfficeAddress: {},
      sicCodes: [],
    }),
} as unknown as CompanyService;

const productRepository: ReportProductRepository = {
  listActive: () => Promise.resolve([]),
  findActiveByTier: (tier) =>
    Promise.resolve({
      tier,
      name: "Single Report",
      pricePence: 2000,
      creditQuantity: 1,
      includesPdf: false,
      includedItems: [],
      entitlements: entitlementsForTier(tier),
    }),
};

class MemoryCheckoutRepository implements CheckoutRepository {
  report:
    | {
        id: string;
        purchaseId: string | null;
        creditQuantity: number | null;
        remainingCredits: number | null;
      }
    | undefined;
  reportOwner = "user_owner_123";
  handledEvents: string[] = [];
  prepared: PaidReportEventInput[] = [];
  processedEvents: string[] = [];
  alreadyProcessed = false;

  getCreditBalance(): Promise<{ redeemableCredits: number; eligiblePurchaseCount: number }> {
    return Promise.resolve({ redeemableCredits: 0, eligiblePurchaseCount: 0 });
  }
  redeemCredit(): Promise<never> {
    return Promise.reject(new Error("Not used"));
  }
  createUnusedCreditRefund(): Promise<never> {
    return Promise.reject(new Error("Not used"));
  }
  getRefundStatus(): Promise<undefined> {
    return Promise.resolve(undefined);
  }
  confirmRefund(): Promise<void> {
    return Promise.resolve();
  }

  findReportBySessionId(
    _sessionId: string,
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
    return Promise.resolve(clerkUserId === this.reportOwner ? this.report : undefined);
  }
  recordHandledEvent(input: { eventId: string }): Promise<void> {
    this.handledEvents.push(input.eventId);
    return Promise.resolve();
  }
  preparePaidReport(input: PaidReportEventInput): Promise<PaidReportEventResult> {
    this.prepared.push(input);
    return Promise.resolve({
      reportId: "report-1",
      purchaseId: "purchase-1",
      alreadyProcessed: this.alreadyProcessed,
    });
  }
  markEventProcessed(eventId: string): Promise<void> {
    this.processedEvents.push(eventId);
    return Promise.resolve();
  }
}

class FakeStripeGateway implements StripeGateway {
  status: Stripe.Checkout.Session.Status | null = "open";
  paymentStatus: Stripe.Checkout.Session.PaymentStatus = "unpaid";
  createdPrice: number | undefined;
  createdClerkUserId: string | undefined;

  createSession(input: {
    pricePence: number;
    clerkUserId: string;
  }): Promise<CheckoutSessionResult> {
    this.createdPrice = input.pricePence;
    this.createdClerkUserId = input.clerkUserId;
    return Promise.resolve({ sessionId: "cs_test_one", url: "https://checkout.stripe.test/one" });
  }
  retrieveSession(): Promise<CheckoutSessionState> {
    return Promise.resolve({
      id: "cs_test_one",
      status: this.status,
      paymentStatus: this.paymentStatus,
      clerkUserId: "user_owner_123",
    });
  }
  constructEvent(): Stripe.Event {
    throw new Error("Not used in service tests.");
  }
}

function createHarness(): {
  service: CheckoutService;
  repository: MemoryCheckoutRepository;
  stripeGateway: FakeStripeGateway;
  enqueued: string[];
} {
  const repository = new MemoryCheckoutRepository();
  const stripeGateway = new FakeStripeGateway();
  const enqueued: string[] = [];
  const queue: ReportGenerationQueue = {
    enqueue(reportId) {
      enqueued.push(reportId);
      return Promise.resolve();
    },
  };
  const service = new CheckoutService({
    appUrl: "https://invoiceguard.test",
    companyService,
    reportProductRepository: productRepository,
    checkoutRepository: repository,
    stripeGateway,
    reportGenerationQueue: queue,
  });
  return { service, repository, stripeGateway, enqueued };
}

void test("checkout creation uses the trusted active product price", async () => {
  const harness = createHarness();
  const result = await harness.service.createSession({
    companyNumber: "12345678",
    tier: "single_report",
    verifiedEmail: "buyer@example.com",
    clerkUserId: "user_owner_123",
    attemptId: "4f90d0e1-6241-45db-995e-b30c3e45aa93",
  });
  assert.equal(result.sessionId, "cs_test_one");
  assert.equal(harness.stripeGateway.createdPrice, 2000);
});

void test("verified checkout ownership is carried into Stripe by the service", async () => {
  const harness = createHarness();
  await harness.service.createSession({
    companyNumber: "12345678",
    tier: "single_report",
    verifiedEmail: "owner@example.com",
    attemptId: "4f90d0e1-6241-45db-995e-b30c3e45aa93",
    clerkUserId: "user_owner_123",
  });
  assert.equal(harness.stripeGateway.createdClerkUserId, "user_owner_123");
});

void test("unpaid completion is recorded without creating or queueing a report", async () => {
  const harness = createHarness();
  await harness.service.processEvent(checkoutEvent("checkout.session.completed", "unpaid"));
  assert.deepEqual(harness.repository.handledEvents, ["evt_one"]);
  assert.equal(harness.repository.prepared.length, 0);
  assert.deepEqual(harness.enqueued, []);
});

void test("paid completion creates one pending report job and marks the event processed", async () => {
  const harness = createHarness();
  await harness.service.processEvent(checkoutEvent("checkout.session.completed", "paid"));
  assert.equal(harness.repository.prepared.length, 1);
  assert.deepEqual(harness.enqueued, ["report-1"]);
  assert.deepEqual(harness.repository.processedEvents, ["evt_one"]);
});

void test("paid completion preserves server-created Clerk ownership metadata", async () => {
  const harness = createHarness();
  await harness.service.processEvent(
    checkoutEvent("checkout.session.completed", "paid", "user_owner_123"),
  );
  assert.equal(harness.repository.prepared[0]?.clerkUserId, "user_owner_123");
});

void test("paid completion rejects missing Clerk ownership metadata", async () => {
  const harness = createHarness();
  await assert.rejects(
    harness.service.processEvent(checkoutEvent("checkout.session.completed", "paid", null)),
    /metadata is invalid/,
  );
  assert.equal(harness.repository.prepared.length, 0);
  assert.deepEqual(harness.enqueued, []);
});

void test("processed replay does not enqueue a duplicate generation job", async () => {
  const harness = createHarness();
  harness.repository.alreadyProcessed = true;
  await harness.service.processEvent(
    checkoutEvent("checkout.session.async_payment_succeeded", "paid"),
  );
  assert.deepEqual(harness.enqueued, []);
  assert.deepEqual(harness.repository.processedEvents, []);
});

void test("status is paid only after the pending report exists", async () => {
  const harness = createHarness();
  assert.deepEqual(await harness.service.getStatus("cs_test_one", "user_owner_123"), {
    status: "confirming",
  });
  harness.repository.report = {
    id: "report-1",
    purchaseId: null,
    creditQuantity: null,
    remainingCredits: null,
  };
  assert.deepEqual(await harness.service.getStatus("cs_test_one", "user_owner_123"), {
    status: "paid_pending",
  });
  await assert.rejects(
    harness.service.getStatus("cs_test_one", "user_other"),
    /owner does not match/,
  );
});

function checkoutEvent(
  type:
    | "checkout.session.completed"
    | "checkout.session.async_payment_succeeded"
    | "checkout.session.async_payment_failed",
  paymentStatus: Stripe.Checkout.Session.PaymentStatus,
  clerkUserId: string | null = "user_owner_123",
): Stripe.Event {
  return {
    id: "evt_one",
    type,
    created: 1,
    livemode: false,
    data: {
      object: {
        id: "cs_test_one",
        object: "checkout.session",
        mode: "payment",
        payment_status: paymentStatus,
        amount_total: 2000,
        currency: "gbp",
        customer_details: { email: "buyer@example.com" },
        metadata: {
          companyNumber: "12345678",
          tier: "single_report",
          ...(clerkUserId ? { clerkUserId } : {}),
        },
        payment_intent: "pi_one",
      } as unknown as Stripe.Checkout.Session,
    },
  } as Stripe.Event;
}
