import { CompanyWorkspaceRoute, type CompanyWorkspacePageProps } from "../company-workspace-route";

export default function AiSummaryPage(props: CompanyWorkspacePageProps) {
  return <CompanyWorkspaceRoute {...props} activeTab="ai-summary" />;
}
