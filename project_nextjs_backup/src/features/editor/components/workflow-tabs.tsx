"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { WorkflowStageView } from "./workflow-stage-view";
import { SubmissionWorkflowView } from "./submission-workflow-view";
import { SubmissionActivityForm } from "./submission-activity-form";
import { PublicationTab } from "./publication/publication-tab";
import type { SubmissionDetail, SubmissionStage } from "../types";

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  currentStage: SubmissionStage;
};

export function WorkflowTabs({ submissionId, detail, currentStage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab: "summary" | "review" | "copyediting" | "production" | "publication" =
    (searchParams?.get("tab") === "publication")
      ? "publication"
      : currentStage === "submission"
      ? "summary"
      : (currentStage as "review" | "copyediting" | "production");
  const [activeTab, setActiveTab] = useState<"summary" | "review" | "copyediting" | "production" | "publication">(initialTab);

  const tabs: { key: "summary" | "review" | "copyediting" | "production" | "publication"; label: string }[] = [
    { key: "summary", label: "Summary" },
    { key: "review", label: "Review" },
    { key: "copyediting", label: "Copyediting" },
    { key: "production", label: "Production" },
    { key: "publication", label: "Publication" },
  ];

  function navigate(tab: typeof tabs[number]["key"]) {
    setActiveTab(tab);
    if (tab === "publication") {
      const params = new URLSearchParams(searchParams ?? undefined);
      params.set("tab", "publication");
      if (!params.get("stage")) params.set("stage", currentStage);
      router.push(`?${params.toString()}`);
      return;
    }
    const stage = tab === "summary" ? "submission" : tab;
    const params = new URLSearchParams(searchParams ?? undefined);
    params.delete("tab");
    params.set("stage", stage);
    router.push(`?${params.toString()}`);
  }

  return (
    <div 
      style={{ 
        padding: 0,
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
      }}
    >
      {/* OJS 3.3 Exact Tab Layout */}
      <div
        style={{
          borderBottom: "2px solid #e5e5e5",
          backgroundColor: "#ffffff",
          padding: "0 1.5rem",
          marginBottom: "1.5rem",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            listStyle: "none",
            margin: 0,
            padding: 0,
            background: "transparent",
            alignItems: "flex-end",
            gap: "0.25rem",
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => navigate(tab.key)}
                className="pkp_tab_trigger"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 1rem",
                  lineHeight: "3rem",
                  height: "3rem",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  color: isActive ? "rgba(0, 0, 0, 0.84)" : "#006798",
                  backgroundColor: isActive ? "#ffffff" : "transparent",
                  border: "none",
                  borderTop: "none",
                  borderRight: "none",
                  borderBottom: isActive ? "2px solid #006798" : "2px solid transparent",
                  borderLeft: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  position: "relative",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#005a82";
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#006798";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* OJS 3.3 Exact Tab Content Layout */}
      <div
        style={{
          backgroundColor: "#eaedee",
          padding: 0,
          marginBottom: "1.5rem",
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        {activeTab === "summary" && <SubmissionWorkflowView detail={detail} />}
        {activeTab === "review" && <WorkflowStageView detail={detail} stage={"review"} />}
        {activeTab === "copyediting" && <WorkflowStageView detail={detail} stage={"copyediting"} />}
        {activeTab === "production" && <WorkflowStageView detail={detail} stage={"production"} />}
        {activeTab === "publication" && <PublicationTab submissionId={submissionId} detail={detail} />}
      </div>

      {/* Activity Log Section - OJS 3.3 Exact Layout */}
      <div
        style={{
          borderRadius: "0",
          border: "none",
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          boxShadow: "none",
          marginBottom: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "#002C40",
            marginBottom: "1rem",
          }}
        >
          Activity Log
        </h2>
        <div style={{ marginBottom: "1rem" }}>
          {detail.activity.length === 0 && (
            <p
              style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
              }}
            >
              Belum ada aktivitas tercatat.
            </p>
          )}
          {detail.activity.map((log) => (
            <div
              key={log.id}
              style={{
                borderRadius: "0.25rem",
                border: "1px solid #e5e5e5",
                backgroundColor: "#f8f9fa",
                padding: "0.75rem 1rem",
                marginBottom: "0.75rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#002C40",
                  marginBottom: "0.25rem",
                }}
              >
                {log.category}
              </p>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginBottom: "0.25rem",
                }}
              >
                {log.message}
              </p>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                }}
              >
                {formatDate(log.createdAt)}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "1rem" }}>
          <SubmissionActivityForm submissionId={submissionId} />
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}





