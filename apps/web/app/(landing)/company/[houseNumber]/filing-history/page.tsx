import { CompanyRouteState } from "../CompanyRouteState";

export default function FilingsPage() {
  return (
    <CompanyRouteState
      title="Filing history"
      status="source_not_yet_checked"
      description="Filing history is checked only as part of a paid full report. The free company view remains limited to Companies House profile facts."
    />
  );
}
