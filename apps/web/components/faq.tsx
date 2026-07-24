"use client";


import { cn } from '@workspace/ui/lib/utils';
import React, { useState } from 'react'


function FAQ({ question, answer }: { question: string; answer: string }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="border-b border-b-line">
      <button className="w-full bg-none border-none text-content text-base font-semibold text-left py-5 cursor-pointer flex justify-between items-center gap-3.5 transition-colors duration-150" onClick={() => setShowDetails(true)}>{question}<span className={cn("text-lg text-content-subtle shrink-0 transition-transform duration-150", showDetails && "rotate-180")}>⌄</span>
      </button>
      <div className={cn("max-h-0 overflow-hidden transition-all duration-300 ease text-sm  text-content p-0", showDetails && "max-h-50 pb-4")}>{answer}</div>
    </div>
  )
}

export default FAQ