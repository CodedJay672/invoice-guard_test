import { CompanyWorkspaceRoute, type CompanyWorkspacePageProps } from "../company-workspace-route";

export default function ChargesPage(props: CompanyWorkspacePageProps) {
  return <CompanyWorkspaceRoute {...props} activeTab="charges" />;
}
