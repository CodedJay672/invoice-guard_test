import { LucideIcon } from 'lucide-react';
import React from 'react'

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  source: string
}

function FeatureCard({ icon: Icon, title, desc, source }: FeatureCardProps) {
  return (
    <div className="p-8 border-r border-r-line border-b border-b-line transition-color duration-150 nth-[3n]:border-r-none nth-[4n]:border-b-none nth-[5]:border-b-none nth-[6]:border-b-none hover:bg-surface-subtle">
      <Icon size={22} className="mb-2.5 block" />
      <p className="text-sm font-bold text-content mb-2">{title}</p>
      <p className="text-xs font-medium text-content-muted leading-5">{desc}</p>
      <span className="inline-flex items-center gap-2.25 mt-3 text-xs font-light text-content-muted">{source}</span>
    </div>
  )
}

export default FeatureCard