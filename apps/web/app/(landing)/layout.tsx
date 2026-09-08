import type { ReactNode } from "react";

import Topbar from "@/components/topbar";
import Footer from "@/components/footer";

export default function LandingPageLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-svh bg-page text-content">
      <Topbar />
      <div className="bg-surface p-2">{children}</div>
      <Footer />
    </main>
  );
}
