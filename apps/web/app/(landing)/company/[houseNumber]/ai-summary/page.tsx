import { CompanyRouteState } from "../CompanyRouteState";

export default function AISummaryPage() {
  return (
    <CompanyRouteState
      title="AI interpretation"
      status="source_not_yet_checked"
      description="AI interpretation is generated only for paid full reports from checked source facts. No AI call is made for the free company view."
    />
  );
}
