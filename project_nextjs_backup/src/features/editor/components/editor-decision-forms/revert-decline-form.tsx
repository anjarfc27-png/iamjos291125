"use client";

import { useState } from "react";
import { PkpButton } from "@/components/ui/pkp-button";
import { FormMessage } from "@/components/ui/form-message";
import { EditorDecisionModal } from "../editor-decisions/editor-decision-modal";
import type { SubmissionStage } from "../../types";
import { SUBMISSION_EDITOR_DECISION_REVERT_DECLINE } from "../../types";

type Props = {
  open: boolean;
  onClose: () => void;
  submissionId: string;
  stage: SubmissionStage;
  reviewRoundId?: string;
  onSubmit: (data: {
    submissionId: string;
    stage: SubmissionStage;
    decision: typeof SUBMISSION_EDITOR_DECISION_REVERT_DECLINE;
    reviewRoundId?: string;
  }) => Promise<void>;
};

/**
 * Revert Decline Form
 * Based on OJS PKP 3.3 RevertDeclineForm.inc.php
 * Used for: Revert Decline Decision
 */
export function RevertDeclineForm({
  open,
  onClose,
  submissionId,
  stage,
  reviewRoundId,
  onSubmit,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        submissionId,
        stage,
        decision: SUBMISSION_EDITOR_DECISION_REVERT_DECLINE,
        reviewRoundId,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revert decline");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EditorDecisionModal
      open={open}
      onClose={onClose}
      submissionId={submissionId}
      stage={stage}
      decision={SUBMISSION_EDITOR_DECISION_REVERT_DECLINE}
      reviewRoundId={reviewRoundId}
      title="Revert Decline Decision"
    >
      <p
        style={{
          fontSize: "0.875rem",
          color: "rgba(0, 0, 0, 0.54)",
          marginBottom: "1.5rem",
        }}
      >
        Revert the decline decision and restore this submission to the workflow.
      </p>

      {error && <FormMessage tone="error">{error}</FormMessage>}

      {/* Form Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.75rem",
          marginTop: "1.5rem",
          paddingTop: "1rem",
          borderTop: "1px solid #e5e5e5",
        }}
      >
        <PkpButton
          type="button"
          variant="onclick"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </PkpButton>
        <PkpButton
          type="button"
          variant="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Revert Decline
        </PkpButton>
      </div>
    </EditorDecisionModal>
  );
}
