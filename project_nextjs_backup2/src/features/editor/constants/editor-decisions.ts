/**
 * Editor Decision Constants - OJS PKP 3.3
 * Based on lib/pkp/classes/workflow/PKPEditorDecisionActionsManager.inc.php
 */

// Editor Decision Constants - OJS PKP 3.3
// Reference: classes/workflow/EditorDecisionActionsManager.inc.php
// Reference: lib/pkp/classes/workflow/PKPEditorDecisionActionsManager.inc.php
export const SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW = 8; // Submission stage decision
export const SUBMISSION_EDITOR_DECISION_ACCEPT = 1; // Submission and review stages decision
export const SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE = 9; // PKP base decision
export const SUBMISSION_EDITOR_DECISION_DECLINE = 4; // Submission and review stages decision
export const SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS = 2; // Review stage decision
export const SUBMISSION_EDITOR_DECISION_RESUBMIT = 3; // Review stage decision
export const SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION = 7; // Editorial stage decision
export const SUBMISSION_EDITOR_DECISION_REVERT_DECLINE = 17; // PKP base decision
export const SUBMISSION_EDITOR_DECISION_NEW_ROUND = 16; // Review stage decision

// Recommendation Constants (for Recommend Only role)
export const SUBMISSION_EDITOR_RECOMMEND_ACCEPT = 11;
export const SUBMISSION_EDITOR_RECOMMEND_PENDING_REVISIONS = 12;
export const SUBMISSION_EDITOR_RECOMMEND_RESUBMIT = 13;
export const SUBMISSION_EDITOR_RECOMMEND_DECLINE = 14;

/**
 * Decision type - whether it's a decision or recommendation
 */
export type DecisionType = "decision" | "recommendation";

/**
 * Decision operation - the operation type for the decision
 */
export type DecisionOperation = 
  | "externalReview"
  | "promote"
  | "sendReviews"
  | "revertDecline"
  | "newReviewRound"
  | "recommendation";

/**
 * Decision metadata based on OJS 3.3 structure
 */
export interface DecisionMetadata {
  decision: number;
  name: string;
  operation: DecisionOperation;
  title: string;
  toStage?: string;
  help?: string;
  paymentType?: string;
  requestPaymentText?: string;
  waivePaymentText?: string;
}

/**
 * Get available decisions per stage based on OJS 3.3 logic
 */
export function getStageDecisions(
  stageId: number,
  submissionStatus: string,
  canMakeDecision: boolean
): Record<number, DecisionMetadata> {
  const decisions: Record<number, DecisionMetadata> = {};

  switch (stageId) {
    case 1: // WORKFLOW_STAGE_ID_SUBMISSION
      // Always available: Send to External Review
      decisions[SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW] = {
        decision: SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW,
        name: "externalReview",
        operation: "externalReview",
        title: "editor.submission.decision.sendExternalReview",
        toStage: "editor.review",
      };

      if (canMakeDecision) {
        // Skip Review / Accept
        decisions[SUBMISSION_EDITOR_DECISION_ACCEPT] = {
          decision: SUBMISSION_EDITOR_DECISION_ACCEPT,
          name: "accept",
          operation: "promote",
          title: "editor.submission.decision.skipReview",
          toStage: "submission.copyediting",
        };

        // Decline (if status is QUEUED)
        if (submissionStatus === "queued") {
          decisions[SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE] = {
            decision: SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE,
            name: "decline",
            operation: "sendReviews",
            title: "editor.submission.decision.decline",
          };
        }

        // Revert Decline (if status is DECLINED)
        if (submissionStatus === "declined") {
          decisions[SUBMISSION_EDITOR_DECISION_REVERT_DECLINE] = {
            decision: SUBMISSION_EDITOR_DECISION_REVERT_DECLINE,
            name: "revert",
            operation: "revertDecline",
            title: "editor.submission.decision.revertDecline",
          };
        }
      }
      break;

    case 3: // WORKFLOW_STAGE_ID_EXTERNAL_REVIEW
      // External review decisions handled separately
      // This will be populated by _externalReviewStageDecisions
      break;

    case 4: // WORKFLOW_STAGE_ID_EDITING
      // Send to Production
      decisions[SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION] = {
        decision: SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION,
        name: "sendToProduction",
        operation: "promote",
        title: "editor.submission.decision.sendToProduction",
        toStage: "submission.production",
      };
      break;
  }

  return decisions;
}

/**
 * Get recommendation options for Recommend Only role
 */
export function getRecommendationOptions(): Record<number, string> {
  return {
    [SUBMISSION_EDITOR_RECOMMEND_ACCEPT]: "editor.submission.decision.accept",
    [SUBMISSION_EDITOR_RECOMMEND_PENDING_REVISIONS]: "editor.submission.decision.requestRevisions",
    [SUBMISSION_EDITOR_RECOMMEND_RESUBMIT]: "editor.submission.decision.resubmit",
    [SUBMISSION_EDITOR_RECOMMEND_DECLINE]: "editor.submission.decision.decline",
  };
}

/**
 * Get decision label from decision constant
 */
export function getDecisionLabel(decision: number): string {
  const labels: Record<number, string> = {
    [SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW]: "Send to External Review",
    [SUBMISSION_EDITOR_DECISION_ACCEPT]: "Accept Submission",
    [SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE]: "Decline Submission",
    [SUBMISSION_EDITOR_DECISION_DECLINE]: "Decline Submission",
    [SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS]: "Request Revisions",
    [SUBMISSION_EDITOR_DECISION_RESUBMIT]: "Resubmit for Review",
    [SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION]: "Send to Production",
    [SUBMISSION_EDITOR_DECISION_REVERT_DECLINE]: "Revert Decline",
    [SUBMISSION_EDITOR_RECOMMEND_ACCEPT]: "Recommend Accept",
    [SUBMISSION_EDITOR_RECOMMEND_PENDING_REVISIONS]: "Recommend Request Revisions",
    [SUBMISSION_EDITOR_RECOMMEND_RESUBMIT]: "Recommend Resubmit",
    [SUBMISSION_EDITOR_RECOMMEND_DECLINE]: "Recommend Decline",
  };

  return labels[decision] || "Unknown Decision";
}

