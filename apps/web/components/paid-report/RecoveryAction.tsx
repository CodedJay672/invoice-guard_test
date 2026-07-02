"use client";

import { useState } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

import type { RegistryRecovery } from "./fixtures";

type RecoveryActionProps = {
  recovery: RegistryRecovery;
};

export function RecoveryAction({ recovery }: RecoveryActionProps) {
  const [previewed, setPreviewed] = useState(false);
  const Icon = recovery.kind === "free_recheck" ? RefreshCw : TriangleAlert;

  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" variant="outline" onClick={() => setPreviewed(true)}>
        <Icon data-icon="inline-start" />
        {recovery.actionLabel}
      </Button>
      <p className="text-xs text-content-muted" aria-live="polite">
        {previewed
          ? "Preview only — no request was sent. Live recovery actions are planned for 15B."
          : "This preview action does not submit or change the report."}
      </p>
    </div>
  );
}
