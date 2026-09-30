import { LucideIcon } from "lucide-react";
import React from "react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  source: string;
}

function FeatureCard({ icon: Icon, title, desc, source }: FeatureCardProps) {
  return (
    <div className="transition-color nth-[3n]:border-r-none nth-[4n]:border-b-none nth-[5]:border-b-none nth-[6]:border-b-none border-r border-b border-r-line border-b-line p-8 duration-150 hover:bg-surface-subtle">
      <Icon size={22} className="mb-2.5 block" />
      <p className="mb-2 text-sm font-bold text-content">{title}</p>
      <p className="text-xs leading-5 font-medium text-content-muted">{desc}</p>
      <span className="mt-3 inline-flex items-center gap-2.25 text-xs font-light text-content-muted">
        {source}
      </span>
    </div>
  );
}

export default FeatureCard;
