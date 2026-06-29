import { CheckCircle2, LockKeyhole } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import type { CheckoutSelection } from "@workspace/validation/checkout";

import type { ReportProductFixture } from "./fixtures";

type CheckoutShellProps = {
  selection: CheckoutSelection;
  product: ReportProductFixture;
  children: React.ReactNode;
};

export function CheckoutShell({ selection, product, children }: CheckoutShellProps) {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
      <section aria-labelledby="checkout-heading" className="min-w-0">
        {children}
      </section>

      <aside aria-label="Order summary" className="min-w-0 lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle>Order summary</CardTitle>
                <CardDescription>One-off company report</CardDescription>
              </div>
              <Badge variant="outline">
                {product.includesPdf ? "PDF included" : "Browser report"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="min-w-0 rounded-md border border-line bg-surface-subtle p-4">
              <p className="font-semibold wrap-break-word text-brand-navy">
                {selection.q ?? "Selected UK company"}
              </p>
              <p className="mt-1 font-mono text-sm text-content-muted">{selection.companyNumber}</p>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-content-muted">{product.name} report</p>
                <p className="text-2xl font-semibold text-content">{product.price}</p>
              </div>
              <Badge variant="positive">One-off</Badge>
            </div>
            <ul className="flex flex-col gap-3 text-sm text-content-muted">
              {product.includedItems.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-brand-teal-hover"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="flex gap-2 text-xs text-content-muted">
              <LockKeyhole aria-hidden="true" className="size-4 shrink-0" />
              Payment confirmation will come from Stripe.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
