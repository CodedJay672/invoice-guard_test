import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { createDatabase, createPostgresClient, schema } from "@workspace/db";
import { entitlementsForTier } from "@workspace/validation/paid-report";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { DrizzleCreditRepository } from "./credit-repository.js";
import { DrizzleRefundRepository } from "./refund-repository.js";

void test("financial transactions use only redeemable purchases and serialize the final credit", async (t) => {
  let container: StartedPostgreSqlContainer;
  try {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();
  } catch (error) {
    if (process.env["REQUIRE_TESTCONTAINERS"] === "1") throw error;
    t.skip(`Docker is unavailable: ${error instanceof Error ? error.message : "unknown error"}`);
    return;
  }

  const connectionString = container.getConnectionUri();
  const client = createPostgresClient({ connectionString });
  const db = createDatabase(connectionString);
  try {
    await migrate(db, {
      migrationsFolder: fileURLToPath(new URL("../../../../packages/db/drizzle", import.meta.url)),
    });
    const repository = new DrizzleCreditRepository(db);
    const refundRepository = new DrizzleRefundRepository(db);
    const clerkUserId = "user_financial_test";
    await db.insert(schema.creditAccounts).values({ clerkUserId, availableCredits: 7 });
    const purchases = await db
      .insert(schema.creditPurchases)
      .values([
        purchase(clerkUserId, "active", 1, "cs_test_active"),
        purchase(clerkUserId, "partially_refunded", 2, "cs_test_partial"),
        purchase(clerkUserId, "refund_pending", 4, "cs_test_pending"),
      ])
      .returning({ id: schema.creditPurchases.id, status: schema.creditPurchases.status });

    assert.deepEqual(await repository.getCreditBalance(clerkUserId), {
      redeemableCredits: 3,
      eligiblePurchaseCount: 2,
    });

    const redemptionInput = {
      clerkUserId,
      companyNumber: "12345678",
      companyName: "Example Limited",
      entitlements: entitlementsForTier("single_report"),
    };
    const outcomes = await Promise.allSettled([
      repository.redeemCredit({
        ...redemptionInput,
        idempotencyKey: "11111111-1111-4111-8111-111111111111",
      }),
      repository.redeemCredit({
        ...redemptionInput,
        idempotencyKey: "22222222-2222-4222-8222-222222222222",
      }),
    ]);
    assert.equal(outcomes.filter((outcome) => outcome.status === "fulfilled").length, 2);
    assert.deepEqual(await repository.getCreditBalance(clerkUserId), {
      redeemableCredits: 1,
      eligiblePurchaseCount: 1,
    });

    const partial = purchases.find((item) => item.status === "partially_refunded");
    assert.ok(partial);
    const refund = await refundRepository.createUnusedCreditRefund({
      purchaseId: partial.id,
      creditQuantity: 1,
      reason: "Refund the remaining unused report credit",
      idempotencyKey: "33333333-3333-4333-8333-333333333333",
      requestedByClerkUserId: "user_admin_test",
    });
    assert.ok(refund.refundRequestId);
    assert.deepEqual(await repository.getCreditBalance(clerkUserId), {
      redeemableCredits: 0,
      eligiblePurchaseCount: 0,
    });
    await assert.rejects(
      refundRepository.createUnusedCreditRefund({
        purchaseId: partial.id,
        creditQuantity: 1,
        reason: "Attempt a duplicate pending refund",
        idempotencyKey: "44444444-4444-4444-8444-444444444444",
        requestedByClerkUserId: "user_admin_test",
      }),
      /not refundable/,
    );
    await refundRepository.confirmRefund({
      refundRequestId: refund.refundRequestId,
      stripeRefundId: "re_test_success",
      succeeded: true,
    });
    await refundRepository.confirmRefund({
      refundRequestId: refund.refundRequestId,
      stripeRefundId: "re_test_success",
      succeeded: true,
    });
    const reversals = await db
      .select({ id: schema.creditLedgerEntries.id })
      .from(schema.creditLedgerEntries)
      .where(eq(schema.creditLedgerEntries.refundReference, "re_test_success"));
    assert.equal(reversals.length, 1);

    const failedOwner = "user_failed_refund";
    await db.insert(schema.creditAccounts).values({
      clerkUserId: failedOwner,
      availableCredits: 1,
    });
    const failedPurchase = (
      await db
        .insert(schema.creditPurchases)
        .values(purchase(failedOwner, "active", 1, "cs_test_failed_refund"))
        .returning({ id: schema.creditPurchases.id })
    )[0];
    assert.ok(failedPurchase);
    const failedRequest = await refundRepository.createUnusedCreditRefund({
      purchaseId: failedPurchase.id,
      creditQuantity: 1,
      reason: "Test definitive Stripe failure restoration",
      idempotencyKey: "77777777-7777-4777-8777-777777777777",
      requestedByClerkUserId: "user_admin_test",
    });
    await refundRepository.confirmRefund({
      refundRequestId: failedRequest.refundRequestId,
      stripeRefundId: "re_test_failed",
      succeeded: false,
      failureCode: "declined",
    });
    const restored = (
      await db
        .select({
          status: schema.creditPurchases.status,
          availableQuantity: schema.creditPurchases.availableQuantity,
          amountRefundedPence: schema.creditPurchases.amountRefundedPence,
        })
        .from(schema.creditPurchases)
        .where(eq(schema.creditPurchases.id, failedPurchase.id))
    )[0];
    assert.equal(restored?.status, "active");
    assert.equal(restored?.availableQuantity, 1);
    assert.equal(restored?.amountRefundedPence, 0);

    const finalCreditOwner = "user_final_credit";
    await db
      .insert(schema.creditAccounts)
      .values({ clerkUserId: finalCreditOwner, availableCredits: 1 });
    await db
      .insert(schema.creditPurchases)
      .values(purchase(finalCreditOwner, "active", 1, "cs_test_final"));
    const finalOutcomes = await Promise.allSettled([
      repository.redeemCredit({
        ...redemptionInput,
        clerkUserId: finalCreditOwner,
        idempotencyKey: "55555555-5555-4555-8555-555555555555",
      }),
      repository.redeemCredit({
        ...redemptionInput,
        clerkUserId: finalCreditOwner,
        idempotencyKey: "66666666-6666-4666-8666-666666666666",
      }),
    ]);
    assert.equal(finalOutcomes.filter((outcome) => outcome.status === "fulfilled").length, 1);
    assert.deepEqual(await repository.getCreditBalance(finalCreditOwner), {
      redeemableCredits: 0,
      eligiblePurchaseCount: 0,
    });
  } finally {
    await client.end();
    await container.stop();
  }
});

function purchase(
  clerkUserId: string,
  status: "active" | "partially_refunded" | "refund_pending",
  availableQuantity: number,
  stripeCheckoutSessionId: string,
): typeof schema.creditPurchases.$inferInsert {
  return {
    clerkUserId,
    reportTier: "agency_pack" as const,
    originalQuantity: 10,
    availableQuantity,
    unitPricePence: 1400,
    amountPaidPence: 14000,
    amountRefundedPence: status === "partially_refunded" ? 1400 : 0,
    currency: "GBP",
    stripeCheckoutSessionId,
    status,
  };
}
