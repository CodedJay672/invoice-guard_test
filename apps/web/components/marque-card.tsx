import { cn } from "@workspace/ui/lib/utils";
import React from "react";

const statuses = [
  {
    name: "administration",
    classNames: "text-positive bg-positive-surface",
  },
  {
    name: "active",
    classNames: "text-positive bg-positive-surface",
  },
  {
    name: "desolved",
    classNames: "text-caution bg-caution-surface",
  },
  {
    name: "liquidation",
    classNames: "text-critical bg-critical-surface",
  },
];

function MarqueCard({ name, status, list }: { name: string; status: string; list: string[] }) {
  return (
    <div className="transition-color min-w-52.5 shrink-0 rounded-lg border border-line bg-surface-subtle px-4 py-3 duration-75 hover:border-content-subtle">
      <div className="mb-1.75 flex items-center justify-between">
        <span className="text-xs font-bold text-content">{name}</span>
        <span
          className={cn(
            "rounded-[100px] px-2 py-0.5 text-[9px] font-bold",
            statuses.find((s) => s.name === status.toLowerCase())?.classNames,
          )}
        >
          {status}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {list.map((i, idx) => (
          <span
            key={idx}
            className="rounded-sm bg-line px-1.5 py-0.5 text-[9px] font-medium text-content-subtle"
          >
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}

export default MarqueCard;
