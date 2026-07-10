import { CompanyWorkspaceRoute, type CompanyWorkspacePageProps } from "../company-workspace-route";

export default function CcjPage(props: CompanyWorkspacePageProps) {
  return <CompanyWorkspaceRoute {...props} activeTab="ccj" />;
}
