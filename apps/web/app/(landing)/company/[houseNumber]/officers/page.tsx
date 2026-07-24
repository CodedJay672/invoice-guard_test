import { CompanyWorkspaceRoute, type CompanyWorkspacePageProps } from "../company-workspace-route";

export default function OfficersPage(props: CompanyWorkspacePageProps) {
  return <CompanyWorkspaceRoute {...props} activeTab="officers" />;
}
