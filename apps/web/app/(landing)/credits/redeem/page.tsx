import { redirect } from "next/navigation";
import { CreditRedemptionForm } from "@/components/checkout/CreditRedemptionForm";
import { authHref } from "@/components/auth/fixtures";
import { resolveAuthIdentity } from "@/lib/auth/identity";
import { requestCreditBalance } from "@/lib/data/credit-balance";
import { requestFreePreview } from "@/lib/data/free-company-prev";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const companyNumber = typeof params.companyNumber === "string" ? params.companyNumber : "";
  const returnTo = `/credits/redeem?companyNumber=${encodeURIComponent(companyNumber)}`;
  const identity = await resolveAuthIdentity();
  if (identity.state === "signed-out") redirect(authHref("/sign-up", returnTo));
  const [balance, preview] = await Promise.all([
    requestCreditBalance(),
    requestFreePreview(companyNumber),
  ]);
  if (!balance || balance.availableCredits < 1)
    redirect(`/checkout?companyNumber=${encodeURIComponent(companyNumber)}&tier=single_report`);
  if (preview.status === "failed")
    redirect(`/company/${encodeURIComponent(companyNumber)}/overview`);
  return (
    <CreditRedemptionForm
      companyName={preview.preview.company.companyName}
      companyNumber={preview.preview.company.companiesHouseNumber}
      availableCredits={balance.availableCredits}
      purchaseHref={`/checkout?companyNumber=${encodeURIComponent(companyNumber)}&tier=single_report&purchase=1`}
    />
  );
}
