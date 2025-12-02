"use client";

import { useState } from "react";
import { SubmissionTable } from "@/features/editor/components/submission-table";
import type { SubmissionSummary } from "@/features/editor/types";

interface TabData {
  id: string;
  label: string;
  count?: number;
  submissions: SubmissionSummary[];
}

interface SubmissionTabsProps {
  tabs: TabData[];
  emptyMessage?: string;
}

export function SubmissionTabs({ tabs, emptyMessage = "No submissions found." }: SubmissionTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "my-queue");
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="app__page">
      {/* Tab Headers */}
      <div className="border-b border-[var(--border)] mb-6">
        <nav className="pkp_controllers_tab flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs font-medium">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTabData && (
          <SubmissionTable 
            submissions={activeTabData.submissions} 
            emptyMessage={emptyMessage}
          />
        )}
      </div>
    </div>
  );
}