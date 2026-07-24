import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

export default function ReportNotFound() {
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-3xl items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <FileQuestion aria-hidden="true" className="size-8 text-content-muted" />
          <CardTitle>Report not found</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          <p className="text-sm text-content-muted">
            The report reference is invalid, unavailable, or does not belong to an accessible
            report.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Search for a company</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
