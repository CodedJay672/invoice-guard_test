import { and, gt, inArray } from "drizzle-orm";
import { schema } from "@workspace/db";

export const REDEEMABLE_PURCHASE_STATUSES = ["active", "partially_refunded"] as const;

export function redeemablePurchasePredicate(): ReturnType<typeof and> {
  return and(
    inArray(schema.creditPurchases.status, [...REDEEMABLE_PURCHASE_STATUSES]),
    gt(schema.creditPurchases.availableQuantity, 0),
  );
}
