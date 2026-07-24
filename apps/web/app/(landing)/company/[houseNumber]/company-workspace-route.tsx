import { loadWebProxyConfig } from "@workspace/config/web";

import { CompanyWorkspace } from "@/components/company-workspace/CompanyWorkspace";
import {
  getCompanyWorkspaceFixture,
  failedCompanyWorkspaceFixture,
  resolveCompanyWorkspaceFixtureName,
  toCompanyWorkspaceFixture,
  type CompanyWorkspaceTab,
} from "@/components/company-workspace/fixtures";
import { requestFreePreview } from "@/lib/data/free-company-prev";
import { requestFreeCompanyTab } from "@/lib/data/free-company-tab";
import { resolvePurchaseTier } from "@/lib/purchase-intent";

export type CompanyWorkspacePageProps = {
  params: Promise<{ houseNumber: string }>;
  searchParams?: Promise<{
    fixture?: string | string[];
    page?: string | string[];
    tier?: string | string[];
  }>;
};

type CompanyWorkspaceRouteProps = CompanyWorkspacePageProps & {
  activeTab: CompanyWorkspaceTab;
};

export async function CompanyWorkspaceRoute({
  activeTab,
  params,
  searchParams,
}: CompanyWorkspaceRouteProps) {
  const { houseNumber } = await params;
  const query = searchParams ? await searchParams : {};
  const environment = loadWebProxyConfig().environment;
  const fixtureName = resolveCompanyWorkspaceFixtureName(query.fixture, environment);
  const purchaseTier = resolvePurchaseTier(query.tier);
  const isPaidTab = activeTab === "ccj" || activeTab === "fpc" || activeTab === "ai-summary";
  const page =
    typeof query.page === "string" && /^\d+$/.test(query.page)
      ? Math.max(1, Number(query.page))
      : 1;
  const [previewResult, tabResult] = await Promise.all([
    requestFreePreview(houseNumber),
    isPaidTab || fixtureName
      ? Promise.resolve(undefined)
      : requestFreeCompanyTab(houseNumber, activeTab, page),
  ]);
  const fixture =
    isPaidTab || fixtureName
      ? getCompanyWorkspaceFixture(activeTab, fixtureName, environment)
      : tabResult?.status === "success"
        ? toCompanyWorkspaceFixture(tabResult.tab)
        : failedCompanyWorkspaceFixture(activeTab);

  return (
    <CompanyWorkspace
      activeTab={activeTab}
      fixture={fixture}
      houseNumber={houseNumber}
      previewResult={previewResult}
      fixtureMode={Boolean(fixtureName)}
      purchaseTier={purchaseTier}
    />
  );
}
