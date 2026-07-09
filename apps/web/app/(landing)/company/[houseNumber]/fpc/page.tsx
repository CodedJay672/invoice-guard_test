import { CompanyRouteState } from "../CompanyRouteState";

export default function FairPaymentCodePage() {
  return (
    <CompanyRouteState
      title="Fair Payment Code"
      status="source_not_yet_checked"
      description="Fair Payment Code status is included only in paid full reports. It is not checked during free search or preview."
    />
  );
}
