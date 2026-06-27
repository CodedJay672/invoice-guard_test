import type { ReactNode } from "react";

import Topbar from "@/components/topbar";

export default function LandingPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-page text-content">
      <Topbar />
      <main>{children}</main>
    </div>
  );
}
