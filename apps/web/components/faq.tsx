"use client";

import { cn } from "@workspace/ui/lib/utils";
import React, { useState } from "react";

function FAQ({ question, answer }: { question: string; answer: string }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="border-b border-b-line">
      <button
        className="flex w-full cursor-pointer items-center justify-between gap-3.5 border-none bg-none py-5 text-left text-base font-semibold text-content transition-colors duration-150"
        onClick={() => setShowDetails(true)}
      >
        {question}
        <span
          className={cn(
            "shrink-0 text-lg text-content-subtle transition-transform duration-150",
            showDetails && "rotate-180",
          )}
        >
          ⌄
        </span>
      </button>
      <div
        className={cn(
          "ease max-h-0 overflow-hidden p-0 text-sm text-content transition-all duration-300",
          showDetails && "max-h-50 pb-4",
        )}
      >
        {answer}
      </div>
    </div>
  );
}

export default FAQ;
