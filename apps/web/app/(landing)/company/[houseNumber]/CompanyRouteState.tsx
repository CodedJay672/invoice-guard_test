import { LockKeyhole } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

type CompanyRouteStateProps = {
  title: string;
  description: string;
  status: "source_not_yet_checked" | "not_entitled";
};

export function CompanyRouteState({ title, description, status }: CompanyRouteStateProps) {
  return (
    <main className="mx-auto w-full max-w-240 px-6 py-8">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle>{title}</CardTitle>
            <Badge variant="outline">
              {status === "source_not_yet_checked" ? "Source not yet checked" : "Locked"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex gap-3 text-sm text-content-muted">
          <LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{description}</p>
        </CardContent>
      </Card>
    </main>
  );
}
