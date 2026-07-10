import { CompanyWorkspaceRoute, type CompanyWorkspacePageProps } from "../company-workspace-route";

export default function FpcPage(props: CompanyWorkspacePageProps) {
  return <CompanyWorkspaceRoute {...props} activeTab="fpc" />;
}
