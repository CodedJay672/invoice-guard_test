import { CompanyRouteState } from "../CompanyRouteState";

export default function InsolvencyPage() {
  return (
    <CompanyRouteState
      title="Insolvency"
      status="source_not_yet_checked"
      description="Insolvency and disqualified-officer checks are paid-report sources. The free company view does not make those calls."
    />
  );
}
