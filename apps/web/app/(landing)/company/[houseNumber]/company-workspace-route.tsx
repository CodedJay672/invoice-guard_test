import { loadWebProxyConfig } from "@workspace/config/web";

import { CompanyWorkspace } from "@/components/company-workspace/CompanyWorkspace";
import {
  getCompanyWorkspaceFixture,
  resolveCompanyWorkspaceFixtureName,
  type CompanyWorkspaceTab,
} from "@/components/company-workspace/fixtures";
import { requestFreePreview } from "@/lib/data/free-company-prev";

export type CompanyWorkspacePageProps = {
  params: Promise<{ houseNumber: string }>;
  searchParams?: Promise<{ fixture?: string | string[] }>;
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
  const [previewResult] = await Promise.all([requestFreePreview(houseNumber)]);

  return (
    <CompanyWorkspace
      activeTab={activeTab}
      fixture={getCompanyWorkspaceFixture(activeTab, fixtureName, environment)}
      houseNumber={houseNumber}
      previewResult={previewResult}
    />
  );
}
