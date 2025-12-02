"use client";

import { useState } from "react";
import { PkpButton } from "@/components/ui/pkp-button";
import { FormMessage } from "@/components/ui/form-message";
import { EditorDecisionModal } from "../editor-decisions/editor-decision-modal";
import type { SubmissionStage } from "../../types";
import { SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW } from "../../types";

type Props = {
  open: boolean;
  onClose: () => void;
  submissionId: string;
  stage: SubmissionStage;
  onSubmit: (data: {
    submissionId: string;
    stage: SubmissionStage;
    decision: typeof SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW;
    selectedFiles?: string[];
  }) => Promise<void>;
};

/**
 * Initiate External Review Form
 * Based on OJS PKP 3.3 InitiateExternalReviewForm.inc.php
 * Used for: Send to External Review
 */
export function InitiateExternalReviewForm({
  open,
  onClose,
  submissionId,
  stage,
  onSubmit,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        submissionId,
        stage,
        decision: SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW,
        selectedFiles: selectedFiles.length > 0 ? selectedFiles : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate external review");
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
      decision={SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW}
      title="Send to External Review"
    >
      <p
        style={{
          fontSize: "0.875rem",
          color: "rgba(0, 0, 0, 0.54)",
          marginBottom: "1.5rem",
        }}
      >
        Send this submission to the external review stage. Select the files to be reviewed.
      </p>

      {/* Available Submission Files */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <label
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#002C40",
          }}
        >
          Files for Review
        </label>
        <div
          style={{
            borderRadius: "0.25rem",
            border: "1px solid #e5e5e5",
            backgroundColor: "#f8f9fa",
            padding: "1rem",
          }}
        >
          <p
            style={{
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.54)",
            }}
          >
            File selection grid will be implemented here
          </p>
          {/* TODO: Add submission files grid for review */}
        </div>
      </div>

      {error && (
        <FormMessage tone="error">{error}</FormMessage>
      )}

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
          Send to Review
        </PkpButton>
      </div>
    </EditorDecisionModal>
  );
}
