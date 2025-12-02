"use client";

import { useState } from "react";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import { PkpRadio } from "@/components/ui/pkp-radio";
import { FormMessage } from "@/components/ui/form-message";
import { EditorDecisionModal } from "../editor-decisions/editor-decision-modal";
import { FileSelectionGrid } from "../file-selection/file-selection-grid";
import { ReviewAttachmentsSelector } from "../review-attachments/review-attachments-selector";
import type {
  EditorDecisionType,
  SubmissionStage,
  SubmissionFile,
  SubmissionReviewRound,
} from "../../types";
import {
  SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS,
  SUBMISSION_EDITOR_DECISION_RESUBMIT,
  SUBMISSION_EDITOR_DECISION_DECLINE,
  SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE,
} from "../../types";

type Props = {
  open: boolean;
  onClose: () => void;
  submissionId: string;
  stage: SubmissionStage;
  decision: EditorDecisionType;
  reviewRoundId?: string;
  authorName?: string;
  files?: SubmissionFile[];
  reviewRounds?: SubmissionReviewRound[];
  onSubmit: (data: {
    submissionId: string;
    stage: SubmissionStage;
    decision: EditorDecisionType;
    reviewRoundId?: string;
    decisionType: "pendingRevisions" | "resubmit" | "decline";
    skipEmail: boolean;
    personalMessage?: string;
    selectedFiles?: string[];
    reviewAttachments?: string[];
  }) => Promise<void>;
};

/**
 * Send Reviews Form
 * Based on OJS PKP 3.3 SendReviewsForm.inc.php
 * Used for: Request Revisions, Resubmit for Review, Decline
 */
export function SendReviewsForm({
  open,
  onClose,
  submissionId,
  stage,
  decision,
  reviewRoundId,
  authorName,
  files = [],
  reviewRounds = [],
  onSubmit,
}: Props) {
  const [decisionType, setDecisionType] = useState<"pendingRevisions" | "resubmit" | "decline">(
    decision === SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS
      ? "pendingRevisions"
      : decision === SUBMISSION_EDITOR_DECISION_RESUBMIT
      ? "resubmit"
      : "decline"
  );
  const [skipEmail, setSkipEmail] = useState(false);
  const [personalMessage, setPersonalMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [reviewAttachments, setReviewAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if we can choose between Pending Revisions and Resubmit
  const canChooseDecision =
    decision === SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS ||
    decision === SUBMISSION_EDITOR_DECISION_RESUBMIT;

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        submissionId,
        stage,
        decision,
        reviewRoundId,
        decisionType,
        skipEmail,
        personalMessage: personalMessage.trim() || undefined,
        selectedFiles: selectedFiles.length > 0 ? selectedFiles : undefined,
        reviewAttachments: reviewAttachments.length > 0 ? reviewAttachments : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record decision");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    if (decision === SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE) {
      return "Decline Submission";
    }
    if (decision === SUBMISSION_EDITOR_DECISION_DECLINE) {
      return "Decline Submission";
    }
    if (canChooseDecision) {
      return decisionType === "pendingRevisions" ? "Request Revisions" : "Resubmit for Review";
    }
    return "Send Reviews";
  };

  return (
    <EditorDecisionModal
      open={open}
      onClose={onClose}
      submissionId={submissionId}
      stage={stage}
      decision={decision}
      reviewRoundId={reviewRoundId}
      title={getTitle()}
    >
      {/* Decision Type Selection (if applicable) - OJS 3.3 Style */}
      {canChooseDecision && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            New Review Round
          </label>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
            <PkpRadio
              name="decision"
              value={SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS}
              checked={decisionType === "pendingRevisions"}
              onChange={() => setDecisionType("pendingRevisions")}
              label="Request Revisions (no new review round)"
            />
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
            <PkpRadio
              name="decision"
              value={SUBMISSION_EDITOR_DECISION_RESUBMIT}
              checked={decisionType === "resubmit"}
              onChange={() => setDecisionType("resubmit")}
              label="Resubmit for Review (new review round)"
            />
            </label>
          </div>
        </div>
      )}

      {/* Email Options - OJS 3.3 Style */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#002C40",
          }}
        >
          Send Email
        </label>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <PkpRadio
              name="skipEmail"
              value="0"
              checked={!skipEmail}
              onChange={() => setSkipEmail(false)}
              label={
                authorName
                  ? `Send email to ${authorName}`
                  : "Send email to author"
              }
            />
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <PkpRadio
              name="skipEmail"
              value="1"
              checked={skipEmail}
              onChange={() => setSkipEmail(true)}
              label="Skip email"
            />
          </label>
        </div>
      </div>

      {/* Personal Message - OJS 3.3 Style */}
      {!skipEmail && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <label
            htmlFor="personalMessage"
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Personal Message
          </label>
          <PkpTextarea
            id="personalMessage"
            name="personalMessage"
            rows={8}
            value={personalMessage}
            onChange={(e) => setPersonalMessage(e.target.value)}
            placeholder="Enter your message to the author..."
          />
        </div>
      )}

      {/* Review Attachments (if review rounds exist) */}
      {reviewRounds.length > 0 && (
        <ReviewAttachmentsSelector
          files={files}
          reviewRounds={reviewRounds}
          selectedAttachments={reviewAttachments}
          onSelectionChange={setReviewAttachments}
          reviewRoundId={reviewRoundId}
          label="Review Attachments"
        />
      )}

      {/* Files to Send - OJS 3.3 Style */}
      {files.length > 0 && (
        <FileSelectionGrid
          files={files}
          selectedFiles={selectedFiles}
          onSelectionChange={setSelectedFiles}
          stage={stage}
          multiple={true}
          label="Files to Send"
        />
      )}
      {files.length === 0 && reviewRounds.length === 0 && (
        <div
          style={{
            padding: "1.5rem",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            backgroundColor: "#f8f9fa",
            borderRadius: "0.25rem",
            border: "1px solid #e5e5e5",
          }}
        >
          No files available for selection.
        </div>
      )}

      {error && (
        <div style={{ marginTop: "0.5rem" }}>
          <FormMessage tone="error">{error}</FormMessage>
        </div>
      )}

      {/* Form Footer - OJS 3.3 Style */}
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
          Record Decision
        </PkpButton>
      </div>
    </EditorDecisionModal>
  );
}
