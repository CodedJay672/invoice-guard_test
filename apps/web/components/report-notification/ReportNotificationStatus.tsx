import { CheckCircle2, CircleAlert, Clock3, MailCheck } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import type { ReportNotificationFixture } from "./fixtures";

type Props = {
  notification: ReportNotificationFixture;
};

export function ReportNotificationStatus({ notification }: Props) {
  const content = notificationContent(notification.state);
  const Icon = content.icon;

  return (
    <Card className="mb-6 print:hidden" aria-labelledby="report-notification-title">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle id="report-notification-title">Report-ready email</CardTitle>
            <CardDescription>
              Delivery updates do not affect access to this completed report.
            </CardDescription>
          </div>
          <Badge variant={content.badgeVariant}>{content.badge}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Alert variant={content.alertVariant} role="status" aria-live="polite">
          <Icon aria-hidden="true" />
          <AlertTitle>{content.title}</AlertTitle>
          <AlertDescription>
            {content.description} Destination: {notification.destinationLabel}. Last update:{" "}
            {notification.updatedAt}.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function notificationContent(state: ReportNotificationFixture["state"]) {
  if (state === "sending") {
    return {
      badge: "Sending",
      badgeVariant: "caution" as const,
      alertVariant: "caution" as const,
      title: "Your email is being sent",
      description: "You can use the report now while delivery is in progress.",
      icon: Clock3,
    };
  }
  if (state === "delayed") {
    return {
      badge: "Delayed",
      badgeVariant: "caution" as const,
      alertVariant: "caution" as const,
      title: "Email delivery is taking longer than expected",
      description: "The report remains available here; there is no need to purchase it again.",
      icon: CircleAlert,
    };
  }
  if (state === "failed") {
    return {
      badge: "Not delivered",
      badgeVariant: "critical" as const,
      alertVariant: "critical" as const,
      title: "The email could not be delivered",
      description: "The report is complete and available here; support has the report reference.",
      icon: CircleAlert,
    };
  }
  return {
    badge: "Sent",
    badgeVariant: "positive" as const,
    alertVariant: "positive" as const,
    title: "Report-ready email sent",
    description: "A secure sign-in link was sent successfully.",
    icon: state === "sent" ? MailCheck : CheckCircle2,
  };
}
