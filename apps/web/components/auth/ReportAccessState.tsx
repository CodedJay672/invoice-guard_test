import { CheckCircle2, CircleAlert, UserRound } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import type { AuthIdentityState, ReportAccessOutcome } from "./fixtures";

export function ReportAccessState({
  identity,
  outcome,
}: {
  identity: AuthIdentityState;
  outcome: ReportAccessOutcome;
}) {
  const content = accessContent(identity, outcome);
  const Icon = content.icon;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Report access</CardTitle>
            <CardDescription>
              Presentation fixture only; no report lookup is performed.
            </CardDescription>
          </div>
          <Badge variant={content.badgeVariant}>{content.badge}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Alert variant={content.alertVariant}>
          <Icon aria-hidden="true" />
          <AlertTitle>{content.title}</AlertTitle>
          <AlertDescription>{content.description}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function accessContent(identity: AuthIdentityState, outcome: ReportAccessOutcome) {
  if (outcome === "owner" && identity === "signed-in") {
    return {
      badge: "Owner",
      badgeVariant: "positive" as const,
      alertVariant: "positive" as const,
      title: "Account ownership confirmed",
      description:
        "AUTH-B will authorize this identity server-side before report data is returned.",
      icon: CheckCircle2,
    };
  }
  if (identity === "unverified-email") {
    return {
      badge: "Verification needed",
      badgeVariant: "caution" as const,
      alertVariant: "caution" as const,
      title: "Verify your account email",
      description: "A verified primary email is required before an owned report can be accessed.",
      icon: UserRound,
    };
  }
  return {
    badge: "Access denied",
    badgeVariant: "critical" as const,
    alertVariant: "critical" as const,
    title: "This report belongs to another account",
    description: "Signing in does not grant access unless server-side ownership is confirmed.",
    icon: CircleAlert,
  };
}
