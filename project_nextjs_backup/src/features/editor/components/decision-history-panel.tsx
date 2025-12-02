"use client";

import type { EditorDecisionHistory } from "../types";

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

type Props = {
  submissionId: string;
  history: EditorDecisionHistory[];
};

/**
 * Decision History Panel
 * Displays the history of editor decisions for a submission
 * Based on OJS PKP 3.3 editorial history
 */
export function DecisionHistoryPanel({ submissionId, history }: Props) {
  if (history.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
          Decision History
        </h2>
        <p className="text-sm text-[var(--muted)]">
          No decisions recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
        Decision History
      </h2>
      <div className="space-y-4">
        {history.map((decision) => (
          <div
            key={decision.id}
            className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[var(--foreground)]">
                    {decision.editorName}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {formatDate(decision.decisionDate)}
                  </span>
                </div>
                <div className="mt-1 text-sm text-[var(--foreground)]">
                  Decision: {getDecisionLabel(decision.decision)}
                </div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  Stage: {decision.stage}
                  {decision.reviewRoundId && ` | Round: ${decision.reviewRoundId}`}
                </div>
                {decision.notes && (
                  <div className="mt-2 text-sm text-[var(--muted)]">
                    {decision.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getDecisionLabel(decision: number): string {
  // Map decision constants to labels
  const labels: Record<number, string> = {
    6: "Send to External Review",
    1: "Accept",
    8: "Decline",
    9: "Initial Decline",
    4: "Request Revisions",
    5: "Resubmit for Review",
    7: "Send to Production",
    17: "Revert Decline",
    10: "New Review Round",
    11: "Recommend Accept",
    12: "Recommend Revisions",
    13: "Recommend Resubmit",
    14: "Recommend Decline",
  };
  return labels[decision] || `Decision ${decision}`;
}
