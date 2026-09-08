"use client";

import { useActionState } from "react";

import { Button } from "@workspace/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";

import { requestAdminRefund } from "@/actions/admin-refund";

interface RefundState {
  message: string;
  ok?: boolean;
}

export function AdminRefundForm() {
  const [state, action, pending] = useActionState(
    async (_state: RefundState, formData: FormData): Promise<RefundState> => {
      const result = await requestAdminRefund({
        purchaseId: formData.get("purchaseId"),
        creditQuantity: Number(formData.get("creditQuantity")),
        reason: formData.get("reason"),
        idempotencyKey: crypto.randomUUID(),
      });
      return {
        ok: result.ok,
        message: result.ok ? `Refund queued: ${result.refundRequestId}` : result.message,
      };
    },
    { message: "" },
  );

  return (
    <form action={action}>
      <FieldSet>
        <FieldLegend className="sr-only">Refund details</FieldLegend>
        <Field>
          <FieldLabel htmlFor="purchaseId">Purchase ID</FieldLabel>
          <Input id="purchaseId" name="purchaseId" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="creditQuantity">Unused credits</FieldLabel>
          <Input id="creditQuantity" min={1} name="creditQuantity" required type="number" />
        </Field>
        <Field>
          <FieldLabel htmlFor="reason">Reason</FieldLabel>
          <Input id="reason" minLength={8} name="reason" required />
          <FieldDescription>Only unused credits can be refunded.</FieldDescription>
        </Field>
        <Button disabled={pending} type="submit">
          {pending ? "Queueing refund…" : "Queue refund"}
        </Button>
        {state.message ? (
          <p aria-live="polite" className="text-sm text-content-muted">
            {state.message}
          </p>
        ) : null}
      </FieldSet>
    </form>
  );
}
