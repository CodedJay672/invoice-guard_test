"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { FreePreviewPayload } from "@workspace/validation";
import { ArrowRight } from "lucide-react";

type TierCardProps = {
  tier: FreePreviewPayload["tierCards"][number];
  ready: boolean;
};

function TierCard({ tier, ready }: TierCardProps) {
  return (
    <Card
      size="sm"
      className="flex flex-wrap items-center justify-between gap-4 bg-linear-to-tr from-brand-navy from-0% to-brand-navy-hover to-100% px-6 py-5"
    >
      <CardHeader>
        <CardTitle>
          <h2 className="mb-px text-base font-extrabold text-content-inverse">{tier.name}</h2>
        </CardTitle>
        <CardDescription className="text-xs text-content-subtle">
          One-off company report
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-2xl font-semibold text-content">{tier.price}</p>
        <ul className="flex flex-col gap-2 text-sm text-content-muted">
          {tier.includedItems.map((item) => (
            <li key={item} className="flex gap-2">
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-teal"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          variant="authoritative"
          disabled={!ready}
          className="h-10 w-full justify-between"
        >
          {tier.cta}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default TierCard;
