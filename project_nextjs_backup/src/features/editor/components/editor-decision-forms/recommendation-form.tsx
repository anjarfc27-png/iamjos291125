"use client";

import { useState } from "react";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpSelect } from "@/components/ui/pkp-select";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import { PkpRadio } from "@/components/ui/pkp-radio";
import { FormMessage } from "@/components/ui/form-message";
import { EditorDecisionModal } from "../editor-decisions/editor-decision-modal";
import { getRecommendationOptions } from "../editor-decisions/decision-constants";
import type { SubmissionStage, EditorRecommendationType } from "../../types";

type Props = {
  open: boolean;
  onClose: () => void;
  submissionId: string;
  stage: SubmissionStage;
  reviewRoundId: string;
  editorNames?: string;
  onSubmit: (data: {
    submissionId: string;
    stage: SubmissionStage;
    reviewRoundId: string;
    recommendation: EditorRecommendationType;
    skipEmail: boolean;
    skipDiscussion: boolean;
    personalMessage?: string;
  }) => Promise<void>;
};

/**
 * Recommendation Form
 * Based on OJS PKP 3.3 RecommendationForm.inc.php
 * Used for: Editor Recommendations (Recommend Only role)
 */
export function RecommendationForm({
  open,
  onClose,
  submissionId,
  stage,
  reviewRoundId,
  editorNames,
  onSubmit,
}: Props) {
  const [recommendation, setRecommendation] = useState<EditorRecommendationType | "">("");
  const [skipEmail, setSkipEmail] = useState(false);
  const [skipDiscussion, setSkipDiscussion] = useState(false);
  const [personalMessage, setPersonalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recommendationOptions = getRecommendationOptions();

  // Get default recommendation for modal decision prop (use first option if recommendation is empty)
  const defaultRecommendation: EditorRecommendationType = recommendationOptions[0]?.value || 11; // 11 = SUBMISSION_EDITOR_RECOMMEND_ACCEPT
  const modalDecision: EditorRecommendationType = recommendation || defaultRecommendation;

  const handleSubmit = async () => {
    if (!recommendation) {
      setError("Please select a recommendation");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        submissionId,
        stage,
        reviewRoundId,
        recommendation,
        skipEmail,
        skipDiscussion,
        personalMessage: personalMessage.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record recommendation");
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
      decision={modalDecision}
      reviewRoundId={reviewRoundId}
      title="Record Recommendation"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Recommendation Selection */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <label
            htmlFor="recommendation"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Recommendation *
          </label>
          <PkpSelect
            id="recommendation"
            name="recommendation"
            title="Recommendation Type"
            value={recommendation ? recommendation.toString() : ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                setRecommendation(Number(value) as EditorRecommendationType);
              } else {
                setRecommendation("");
              }
            }}
            required
          >
            <option value="">Select a recommendation...</option>
            {recommendationOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </PkpSelect>
          <p
            style={{
              fontSize: "0.75rem",
              color: "rgba(0, 0, 0, 0.54)",
            }}
          >
            Select your recommendation for this submission.
          </p>
        </div>

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
            Notify Editors
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
                editorNames
                  ? `Send email to ${editorNames}`
                  : "Send email to editors"
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

        {/* Discussion Options */}
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
            Discussion
          </label>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <PkpRadio
              name="skipDiscussion"
              value="0"
              checked={!skipDiscussion}
              onChange={() => setSkipDiscussion(false)}
              label="Create discussion"
            />
            <PkpRadio
              name="skipDiscussion"
              value="1"
              checked={skipDiscussion}
              onChange={() => setSkipDiscussion(true)}
              label="Skip discussion"
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
              rows={6}
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              placeholder="Enter your message to the editors..."
            />
          </div>
        )}

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
            disabled={isSubmitting || !recommendation}
          >
            Record Recommendation
          </PkpButton>
        </div>
      </div>
    </EditorDecisionModal>
  );
}
