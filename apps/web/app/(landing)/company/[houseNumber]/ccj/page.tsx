import { CompanyRouteState } from "../CompanyRouteState";

export default function CCJPage() {
  return (
    <CompanyRouteState
      title="County Court Judgements"
      status="source_not_yet_checked"
      description="Registry Trust court records are retrieved only after confirmed payment. No CCJ conclusion is available in the free company view."
    />
  );
}
