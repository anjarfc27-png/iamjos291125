/**
 * Editor Decision Constants and Helpers
 * Based on OJS PKP 3.3 EditorDecisionActionsManager
 */

import type {
  EditorDecision,
  EditorDecisionType,
  EditorRecommendationType,
  SubmissionStage,
  SubmissionStatus,
} from "../../types";
import {
  SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW,
  SUBMISSION_EDITOR_DECISION_ACCEPT,
  SUBMISSION_EDITOR_DECISION_DECLINE,
  SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE,
  SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS,
  SUBMISSION_EDITOR_DECISION_RESUBMIT,
  SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION,
  SUBMISSION_EDITOR_DECISION_REVERT_DECLINE,
  SUBMISSION_EDITOR_DECISION_NEW_ROUND,
  SUBMISSION_EDITOR_RECOMMEND_ACCEPT,
  SUBMISSION_EDITOR_RECOMMEND_PENDING_REVISIONS,
  SUBMISSION_EDITOR_RECOMMEND_RESUBMIT,
  SUBMISSION_EDITOR_RECOMMEND_DECLINE,
} from "../../types";

/**
 * Get available decisions for a workflow stage
 * Based on OJS PKP 3.3 _submissionStageDecisions, _externalReviewStageDecisions, _editorialStageDecisions
 */
export function getStageDecisions(
  stage: SubmissionStage,
  status: SubmissionStatus,
  makeDecision: boolean = true
): EditorDecision[] {
  const decisions: EditorDecision[] = [];

  switch (stage) {
    case "submission":
      // All users can send to external review
      decisions.push({
        decision: SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW,
        name: "externalReview",
        operation: "externalReview",
        title: "editor.submission.decision.sendExternalReview",
        toStage: "editor.review",
      });

      if (makeDecision) {
        // Skip review / Accept
        decisions.push({
          decision: SUBMISSION_EDITOR_DECISION_ACCEPT,
          name: "accept",
          operation: "promote",
          title: "editor.submission.decision.skipReview",
          toStage: "submission.copyediting",
        });

        // Decline (if status is QUEUED)
        if (status === "queued") {
          decisions.push({
            decision: SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE,
            name: "decline",
            operation: "sendReviews",
            title: "editor.submission.decision.decline",
          });
        }

        // Revert Decline (if status is DECLINED)
        if (status === "declined") {
          decisions.push({
            decision: SUBMISSION_EDITOR_DECISION_REVERT_DECLINE,
            name: "revert",
            operation: "revertDecline",
            title: "editor.submission.decision.revertDecline",
          });
        }
      }
      break;

    case "review":
      // External review stage decisions
      if (makeDecision) {
        decisions.push({
          decision: SUBMISSION_EDITOR_DECISION_ACCEPT,
          name: "accept",
          operation: "promote",
          title: "editor.submission.decision.accept",
          toStage: "submission.copyediting",
        });

        decisions.push({
          decision: SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS,
          name: "pendingRevisions",
          operation: "sendReviews",
          title: "editor.submission.decision.requestRevisions",
        });

        decisions.push({
          decision: SUBMISSION_EDITOR_DECISION_RESUBMIT,
          name: "resubmit",
          operation: "sendReviews",
          title: "editor.submission.decision.resubmit",
        });

        decisions.push({
          decision: SUBMISSION_EDITOR_DECISION_DECLINE,
          name: "decline",
          operation: "sendReviews",
          title: "editor.submission.decision.decline",
        });
      }

      // New review round
      decisions.push({
        decision: SUBMISSION_EDITOR_DECISION_NEW_ROUND,
        name: "newReviewRound",
        operation: "newReviewRound",
        title: "editor.submission.decision.newReviewRound",
      });
      break;

    case "copyediting":
      // Editorial stage decisions
      decisions.push({
        decision: SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION,
        name: "sendToProduction",
        operation: "promote",
        title: "editor.submission.decision.sendToProduction",
        toStage: "submission.production",
      });
      break;

    case "production":
      // No editor decisions in production stage
      break;
  }

  return decisions;
}

/**
 * Get recommendation options for a stage
 * Based on OJS PKP 3.3 getRecommendationOptions
 */
export function getRecommendationOptions(): Array<{
  value: EditorRecommendationType | "";
  label: string;
}> {
  return [
    { value: "", label: "common.chooseOne" },
    {
      value: SUBMISSION_EDITOR_RECOMMEND_PENDING_REVISIONS,
      label: "editor.submission.decision.requestRevisions",
    },
    {
      value: SUBMISSION_EDITOR_RECOMMEND_RESUBMIT,
      label: "editor.submission.decision.resubmit",
    },
    {
      value: SUBMISSION_EDITOR_RECOMMEND_ACCEPT,
      label: "editor.submission.decision.accept",
    },
    {
      value: SUBMISSION_EDITOR_RECOMMEND_DECLINE,
      label: "editor.submission.decision.decline",
    },
  ];
}

/**
 * Check if a decision requires review round
 */
export function requiresReviewRound(decision: EditorDecisionType | EditorRecommendationType): boolean {
  return [
    SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS,
    SUBMISSION_EDITOR_DECISION_RESUBMIT,
    SUBMISSION_EDITOR_DECISION_DECLINE,
    SUBMISSION_EDITOR_DECISION_ACCEPT,
    SUBMISSION_EDITOR_DECISION_NEW_ROUND,
    SUBMISSION_EDITOR_RECOMMEND_ACCEPT,
    SUBMISSION_EDITOR_RECOMMEND_PENDING_REVISIONS,
    SUBMISSION_EDITOR_RECOMMEND_RESUBMIT,
    SUBMISSION_EDITOR_RECOMMEND_DECLINE,
  ].includes(decision as number);
}

/**
 * Get the form component name for a decision
 */
export function getDecisionFormName(decision: EditorDecisionType | EditorRecommendationType): string {
  switch (decision) {
    case SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW:
      return "InitiateExternalReviewForm";
    case SUBMISSION_EDITOR_DECISION_ACCEPT:
    case SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION:
      return "PromoteForm";
    case SUBMISSION_EDITOR_DECISION_DECLINE:
    case SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE:
    case SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS:
    case SUBMISSION_EDITOR_DECISION_RESUBMIT:
      return "SendReviewsForm";
    case SUBMISSION_EDITOR_DECISION_REVERT_DECLINE:
      return "RevertDeclineForm";
    case SUBMISSION_EDITOR_DECISION_NEW_ROUND:
      return "NewReviewRoundForm";
    default:
      return "EditorDecisionForm";
  }
}

/**
 * Check if decision is a recommendation (recommend only)
 */
export function isRecommendation(decision: EditorDecisionType | EditorRecommendationType): boolean {
  return [
    SUBMISSION_EDITOR_RECOMMEND_ACCEPT,
    SUBMISSION_EDITOR_RECOMMEND_PENDING_REVISIONS,
    SUBMISSION_EDITOR_RECOMMEND_RESUBMIT,
    SUBMISSION_EDITOR_RECOMMEND_DECLINE,
  ].includes(decision as number);
}
