"use client";

import { useRouter } from "next/navigation";

import type { CompanyWorkspaceTab } from "./fixtures";
import { companyWorkspaceTabs } from "./fixtures";

type MobileTabSelectProps = {
  activeTab: CompanyWorkspaceTab;
  houseNumber: string;
};

export function MobileTabSelect({ activeTab, houseNumber }: MobileTabSelectProps) {
  const router = useRouter();

  return (
    <div className="md:hidden">
      <label
        htmlFor="company-workspace-tab"
        className="mb-2 block text-xs font-semibold text-content-muted"
      >
        Company section
      </label>
      <select
        id="company-workspace-tab"
        value={activeTab}
        onChange={(event) => {
          const nextTab = event.target.value as CompanyWorkspaceTab;
          const tab = companyWorkspaceTabs.find((candidate) => candidate.id === nextTab);
          if (tab) router.push(`/company/${houseNumber}/${tab.href}`);
        }}
        className="min-h-11 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
      >
        {companyWorkspaceTabs.map((tab) => (
          <option key={tab.id} value={tab.id}>
            {tab.label}
          </option>
        ))}
      </select>
    </div>
  );
}
