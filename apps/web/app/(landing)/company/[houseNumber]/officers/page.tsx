import { CompanyRouteState } from "../CompanyRouteState";

export default function OfficersPage() {
  return (
    <CompanyRouteState
      title="Officers"
      status="source_not_yet_checked"
      description="Officer detail is checked in paid full reports. The free company view does not expose director-network analysis."
    />
  );
}
