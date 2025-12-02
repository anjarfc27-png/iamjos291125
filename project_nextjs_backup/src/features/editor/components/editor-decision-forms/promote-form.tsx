"use client";

import { useState } from "react";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import { PkpRadio } from "@/components/ui/pkp-radio";
import { PkpCheckbox } from "@/components/ui/pkp-checkbox";
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
  SUBMISSION_EDITOR_DECISION_ACCEPT,
  SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION,
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
    skipEmail: boolean;
    personalMessage?: string;
    selectedFiles?: string[];
    reviewAttachments?: string[];
  }) => Promise<void>;
};

/**
 * Promote Form
 * Based on OJS PKP 3.3 PromoteForm.inc.php
 * Used for: Accept, Send to Production
 */
export function PromoteForm({
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
  const [skipEmail, setSkipEmail] = useState(false);
  const [personalMessage, setPersonalMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [reviewAttachments, setReviewAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"email" | "files">("email");

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        submissionId,
        stage,
        decision,
        reviewRoundId,
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
    if (decision === SUBMISSION_EDITOR_DECISION_ACCEPT) {
      return "Accept Submission";
    }
    if (decision === SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION) {
      return "Send to Production";
    }
    return "Promote Submission";
  };

  const getHelpText = () => {
    if (decision === SUBMISSION_EDITOR_DECISION_ACCEPT) {
      return "Accept this submission and send it to the copyediting stage.";
    }
    if (decision === SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION) {
      return "Send this submission to the production stage.";
    }
    return null;
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
      {getHelpText() && (
        <p
          style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginBottom: "1rem",
          }}
        >
          {getHelpText()}
        </p>
      )}

      {step === "email" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {/* Email Options */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <label
              style={{
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
                gap: "0.75rem",
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
              <PkpRadio
                name="skipEmail"
                value="1"
                checked={skipEmail}
                onChange={() => setSkipEmail(true)}
                label="Skip email"
              />
            </div>
          </div>

          {/* Personal Message */}
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
              {/* TODO: Add "Add Reviews" button to import peer reviews */}
            </div>
          )}

          {/* Review Attachments (if review rounds exist) */}
          {reviewRounds.length > 0 && (
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
                Review Attachments
              </label>
              <ReviewAttachmentsSelector
                files={files}
                reviewRounds={reviewRounds}
                selectedAttachments={reviewAttachments}
                onSelectionChange={setReviewAttachments}
                reviewRoundId={reviewRoundId}
                label="Select review attachments to include"
              />
            </div>
          )}

          {/* Library File Attachments */}
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
              Library Files
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
                Library file attachments selection will be implemented here
              </p>
              {/* TODO: Add library files grid */}
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
              onClick={() => setStep("files")}
              disabled={isSubmitting}
            >
              Next: Select Files
            </PkpButton>
          </div>
        </div>
      )}

      {step === "files" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <p
            style={{
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.54)",
            }}
          >
            Select files to promote to the next stage.
          </p>

          {/* Files Selection Grid */}
          {files.length > 0 && (
            <FileSelectionGrid
              files={files}
              selectedFiles={selectedFiles}
              onSelectionChange={setSelectedFiles}
              stage={stage}
              multiple={true}
              label="Files to Promote"
            />
          )}
          {files.length === 0 && (
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
              onClick={() => setStep("email")}
              disabled={isSubmitting}
            >
              Previous: Author Notification
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
        </div>
      )}
    </EditorDecisionModal>
  );
}
