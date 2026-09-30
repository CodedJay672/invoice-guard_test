import { notFound, redirect } from "next/navigation";

import { loadAppConfig } from "@workspace/config";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import { isAdminIdentity, resolveAuthIdentity } from "@/lib/auth/identity";
import { loadAdminCollection, loadAdminOverview } from "@/lib/data/admin";
import { AdminRefundForm } from "@/components/admin/AdminRefundForm";

const collections = [
  "reports",
  "payments",
  "refunds",
  "providers",
  "searches",
  "alerts",
  "maintenance",
];

function displayValue(value: unknown, fallback = ""): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
}

export default async function AdminPage() {
  const identity = await resolveAuthIdentity();
  if (identity.state === "signed-out") redirect("/sign-in?returnTo=/admin");
  const config = loadAppConfig();
  if (!isAdminIdentity(identity, config.adminEmail)) notFound();

  const [overview, ...data] = await Promise.all([
    loadAdminOverview(identity),
    ...collections.map((collection) => loadAdminCollection(identity, collection)),
  ]);
  const metrics = [
    ["Net revenue", `£${(overview.netRevenuePence / 100).toFixed(2)}`],
    ["Qualifying transactions", String(overview.qualifyingTransactions)],
    ["Search conversion", `${(overview.conversionRate * 100).toFixed(1)}%`],
    ["Open alerts", String(overview.openAlertCount)],
    ["Failed maintenance", String(overview.failedMaintenanceCount)],
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
        <Badge variant="outline" className="w-fit">
          Phase A operations
        </Badge>
        <h1 className="text-3xl font-semibold">Admin dashboard</h1>
        <p className="text-content-muted">
          Reports, payments, provider health, refunds, alerts, and maintenance.
        </p>
      </header>
      <section
        aria-label="Operational metrics"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"
      >
        {metrics.map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardDescription>{label}</CardDescription>
              <CardTitle>{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Refund unused credits</CardTitle>
            <CardDescription>
              Refunds require a reason and are validated against the remaining purchase balance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminRefundForm />
          </CardContent>
        </Card>
        {collections.map((collection, index) => (
          <Card key={collection}>
            <CardHeader>
              <CardTitle className="capitalize">{collection}</CardTitle>
              <CardDescription>{data[index]?.total ?? 0} total records</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {data[index]?.items.length ? (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="py-2">Reference</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data[index].items.map((item, itemIndex) => (
                      <tr
                        className="border-b border-line"
                        key={displayValue(item.id, String(itemIndex))}
                      >
                        <td className="max-w-56 truncate py-2">
                          {displayValue(
                            item.reportReference,
                            displayValue(item.id, displayValue(item.task, "Record")),
                          )}
                        </td>
                        <td className="py-2">
                          {displayValue(item.status, displayValue(item.provider, "Recorded"))}
                        </td>
                        <td className="py-2">
                          {displayValue(
                            item.createdAt,
                            displayValue(item.occurredAt, displayValue(item.startedAt)),
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-content-muted">No records found.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
