import Link from "next/link";

import { PkpButton } from "@/components/ui/pkp-button";
import type { SubmissionSummary } from "../types";

type Props = {
  submission: SubmissionSummary;
  authorName?: string;
};

/**
 * Workflow Header
 * Based on OJS PKP 3.3 workflow header
 * Matches OJS 3.3 styling: pkpWorkflow__header, pkpWorkflow__identification
 */
export function WorkflowHeader({ submission, authorName = "—" }: Props) {
  const statusBadge = getStatusBadge(submission.status);

  return (
    <div
      className="pkpWorkflow__header"
      style={{
        borderBottom: "2px solid #e5e5e5",
        backgroundColor: "#ffffff",
        padding: "1rem 1.5rem",
        boxShadow: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1
          className="pkpWorkflow__identification"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "1rem",
            lineHeight: "1.5",
            margin: 0,
            padding: 0,
          }}
        >
          {statusBadge && (
            <span
              className="pkpWorkflow__identificationStatus"
              style={{
                display: "inline-flex",
                alignItems: "center",
                borderRadius: "9999px",
                padding: "0.25rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                backgroundColor:
                  statusBadge.variant === "success"
                    ? "#d4edda"
                    : statusBadge.variant === "primary"
                      ? "#cce5ff"
                      : statusBadge.variant === "warning"
                        ? "#fff3cd"
                        : "#e9ecef",
                color:
                  statusBadge.variant === "success"
                    ? "#155724"
                    : statusBadge.variant === "primary"
                      ? "#004085"
                      : statusBadge.variant === "warning"
                        ? "#856404"
                        : "#495057",
              }}
            >
              {statusBadge.label}
            </span>
          )}
          <span
            className="pkpWorkflow__identificationId"
            style={{
              fontWeight: 700,
              color: "#002C40",
            }}
          >
            {submission.id}
          </span>
          <span
            className="pkpWorkflow__identificationDivider"
            style={{
              color: "rgba(0, 0, 0, 0.54)",
              fontWeight: 400,
            }}
          >
            /
          </span>
          <span
            className="pkpWorkflow__identificationAuthor"
            style={{
              color: "#002C40",
            }}
          >
            {authorName}
          </span>
          <span
            className="pkpWorkflow__identificationDivider"
            style={{
              color: "rgba(0, 0, 0, 0.54)",
              fontWeight: 400,
            }}
          >
            /
          </span>
          <span
            className="pkpWorkflow__identificationTitle"
            style={{
              color: "#002C40",
              fontWeight: 500,
            }}
          >
            {submission.title}
          </span>
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {submission.status === "published" && (
            <PkpButton
              variant="primary"
              href={`/submissions/${submission.id}`}
              target="_blank"
            >
              View
            </PkpButton>
          )}
          {submission.status !== "published" && submission.stage === "production" && (
            <PkpButton
              variant="primary"
              href={`/submissions/${submission.id}/preview`}
              target="_blank"
            >
              Preview
            </PkpButton>
          )}
          <PkpButton
            variant="onclick"
            href={`/editor/submissions/${submission.id}#activity`}
          >
            Activity Log
          </PkpButton>
          <PkpButton
            variant="onclick"
            href={`/editor/submissions/${submission.id}/library`}
          >
            Submission Library
          </PkpButton>
        </div>
      </div>
    </div>
  );
}

function getStatusBadge(status: string): { label: string; variant: "success" | "primary" | "warning" | "default" } | null {
  switch (status) {
    case "published":
      return { label: "Published", variant: "success" };
    case "scheduled":
      return { label: "Scheduled", variant: "primary" };
    case "declined":
      return { label: "Declined", variant: "warning" };
    default:
      return null;
  }
}

