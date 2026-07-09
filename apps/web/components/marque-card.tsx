import { cn } from '@workspace/ui/lib/utils'
import React from 'react'


const statuses = [
  {
    name: "administration",
    classNames: "text-positive bg-positive-surface"
  },
  {
    name: "active",
    classNames: "text-positive bg-positive-surface"
  },
  {
    name: "desolved",
    classNames: "text-caution bg-caution-surface"
  },
  {
    name: "liquidation",
    classNames: "text-critical bg-critical-surface"
  },
]


function MarqueCard({ name, status, list }: { name: string, status: string, list: string[] }) {
  return (
    <div className="shrink-0 bg-surface-subtle rounded-lg border border-line px-4 py-3 min-w-52.5 transition-color duration-75 hover:border-content-subtle">
      <div className="flex items-center justify-between mb-1.75">
        <span className="text-xs font-bold text-content">{name}</span><span className={cn("text-[9px] font-bold py-0.5 px-2 rounded-[100px]", statuses.find((s) => s.name === status.toLowerCase())?.classNames)}>{status}</span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {list.map((i, idx) => (
          <span key={idx} className="text-[9px] text-content-subtle bg-line rounded-sm px-1.5 py-0.5 font-medium">{i}</span>
        ))}
      </div>
    </div>
  )
}

export default MarqueCard