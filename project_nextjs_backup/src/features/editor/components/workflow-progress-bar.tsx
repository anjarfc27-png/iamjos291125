"use client";

import Link from "next/link";

import type { SubmissionStage } from "../types";

const WORKFLOW_STAGES: Array<{ id: SubmissionStage; label: string; path: string }> = [
  { id: "submission", label: "Submission", path: "submission" },
  { id: "review", label: "Review", path: "review" },
  { id: "copyediting", label: "Copyediting", path: "copyediting" },
  { id: "production", label: "Production", path: "production" },
];

type Props = {
  submissionId: string;
  currentStage: SubmissionStage;
};

/**
 * Workflow Progress Bar
 * Based on OJS PKP 3.3 submission progress bar
 * Matches OJS 3.3 styling: border-bottom-4, colors, spacing
 */
export function WorkflowProgressBar({ submissionId, currentStage }: Props) {
  const currentStageIndex = WORKFLOW_STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div
      className="pkp_submission_progress"
      style={{
        borderBottom: "2px solid #e5e5e5",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {WORKFLOW_STAGES.map((stage, index) => {
          const isCurrent = stage.id === currentStage;
          const isPast = index < currentStageIndex;
          const href = `/editor/submissions/${submissionId}?stage=${stage.id}`;

          return (
            <Link
              key={stage.id}
              href={href}
              className="pkp_submission_progress_item"
              style={{
                flex: 1,
                borderBottom: isCurrent ? "4px solid #006798" : "4px solid transparent",
                padding: "1rem 1.5rem",
                textAlign: "center",
                fontSize: "0.875rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.2s ease",
                backgroundColor: isCurrent ? "#f8f9fa" : isPast ? "#f8f9fa" : "#ffffff",
                color: isCurrent
                  ? "#006798" // Primary blue
                  : isPast
                    ? "rgba(0, 0, 0, 0.84)" // Dark grey
                    : "rgba(0, 0, 0, 0.54)", // Muted grey
              }}
              onMouseEnter={(e) => {
                if (!isCurrent) {
                  e.currentTarget.style.backgroundColor = "#f0f0f0";
                  e.currentTarget.style.color = isPast ? "rgba(0, 0, 0, 0.84)" : "rgba(0, 0, 0, 0.7)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isCurrent) {
                  e.currentTarget.style.backgroundColor = isPast ? "#f8f9fa" : "#ffffff";
                  e.currentTarget.style.color = isPast ? "rgba(0, 0, 0, 0.84)" : "rgba(0, 0, 0, 0.54)";
                }
              }}
            >
              {stage.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

