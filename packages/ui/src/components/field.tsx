import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset data-slot="field-set" className={cn("flex flex-col gap-3", className)} {...props} />
  );
}

function FieldLegend({ className, ...props }: React.ComponentProps<"legend">) {
  return (
    <legend
      data-slot="field-legend"
      className={cn("mb-3 text-lg font-semibold text-brand-navy", className)}
      {...props}
    />
  );
}

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field" className={cn("flex flex-col gap-2", className)} {...props} />;
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn("font-medium text-content", className)}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-sm text-content-muted", className)}
      {...props}
    />
  );
}

export { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet };
