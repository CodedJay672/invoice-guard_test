import { CompanyRouteState } from "../CompanyRouteState";

export default function ChargesPage() {
  return (
    <CompanyRouteState
      title="Registered charges"
      status="source_not_yet_checked"
      description="Registered charges detail is included in paid full reports. This tab does not call paid-only providers."
    />
  );
}
