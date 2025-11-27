"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PkpButton } from "@/components/ui/pkp-button";
import { FormMessage } from "@/components/ui/form-message";
import { useAuth } from "@/contexts/AuthContext";
import { getStageDecisions } from "./editor-decisions/decision-constants";
import { SendReviewsForm } from "./editor-decision-forms/send-reviews-form";
import { PromoteForm } from "./editor-decision-forms/promote-form";
import { InitiateExternalReviewForm } from "./editor-decision-forms/initiate-external-review-form";
import { RevertDeclineForm } from "./editor-decision-forms/revert-decline-form";
import { NewReviewRoundForm } from "./editor-decision-forms/new-review-round-form";
import { saveEditorDecision } from "../actions/editor-decisions";
import type {
  SubmissionStage,
  SubmissionStatus,
  EditorDecisionType,
  SubmissionFile,
  SubmissionReviewRound,
  SubmissionParticipant,
} from "../types";
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
} from "../types";

type Props = {
  submissionId: string;
  currentStage: SubmissionStage;
  status: SubmissionStatus;
  authorName?: string;
  reviewRoundId?: string;
  files?: SubmissionFile[];
  reviewRounds?: SubmissionReviewRound[];
  participants?: SubmissionParticipant[];
};

export function WorkflowStageActions({
  submissionId,
  currentStage,
  status,
  authorName,
  reviewRoundId,
  files = [],
  reviewRounds = [],
  participants = [],
}: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [openModal, setOpenModal] = useState<{
    type: string;
    decision: EditorDecisionType;
  } | null>(null);

  const currentUserId = user?.id ?? "";

  const relevantAssignments = useMemo(() => {
    return participants.filter(
      (participant) =>
        participant.stage === currentStage || participant.stage === "submission"
    );
  }, [participants, currentStage]);

  const hasAssignment = useMemo(() => {
    if (!currentUserId) {
      return false;
    }
    return relevantAssignments.some((assignment) => assignment.userId === currentUserId);
  }, [relevantAssignments, currentUserId]);

  const canDecide = useMemo(() => {
    if (!currentUserId) {
      return false;
    }
    return relevantAssignments.some(
      (assignment) =>
        assignment.userId === currentUserId &&
        ["editor", "section_editor", "manager"].includes(assignment.role)
    );
  }, [relevantAssignments, currentUserId]);

  // Get available decisions for this stage
  const availableDecisions = useMemo(() => {
    return getStageDecisions(currentStage, status, canDecide);
  }, [currentStage, status, canDecide]);

  const handleDecisionClick = (decision: EditorDecisionType) => {
    // Permission check before opening modal
    if (!hasAssignment) {
      setFeedback({
        tone: "error",
        message: "Anda tidak memiliki akses untuk melakukan keputusan editorial ini.",
      });
      return;
    }

    if (!canDecide) {
      setFeedback({
        tone: "error",
        message: "Anda hanya dapat merekomendasikan, tidak dapat membuat keputusan final.",
      });
      return;
    }

    setOpenModal({ type: getDecisionFormName(decision), decision });
  };

  type DecisionFormData = {
    decision: EditorDecisionType;
    reviewRoundId?: string;
    skipEmail?: boolean;
    personalMessage?: string;
    selectedFiles?: string[];
    reviewAttachments?: string[];
    decisionType?: "pendingRevisions" | "resubmit" | "decline";
  };

  const handleModalSubmit = async (data: DecisionFormData) => {
    setFeedback(null);
    try {
      const result = await saveEditorDecision({
        submissionId,
        stage: currentStage,
        decision: data.decision,
        reviewRoundId: data.reviewRoundId || reviewRoundId,
        skipEmail: data.skipEmail,
        personalMessage: data.personalMessage,
        selectedFiles: data.selectedFiles,
        reviewAttachments: data.reviewAttachments,
        decisionType: data.decisionType,
      });

      if (!result.ok) {
        setFeedback({ tone: "error", message: result.error ?? "Failed to save decision" });
        return;
      }

      setFeedback({ tone: "success", message: result.message ?? "Decision saved successfully" });
      setOpenModal(null);
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to save decision",
      });
    }
  };

  const handleWorkflowAction = async (action: string) => {
    if (!hasAssignment) {
      setFeedback({
        tone: "error",
        message: "Anda tidak memiliki akses untuk melakukan tindakan ini.",
      });
      return;
    }

    if (!canDecide) {
      setFeedback({
        tone: "error",
        message: "Anda hanya dapat merekomendasikan, tidak dapat membuat keputusan final.",
      });
      return;
    }

    setFeedback(null);
    try {
      const response = await fetch(`/api/editor/submissions/${submissionId}/workflow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          stage: currentStage,
        }),
      });
      const result = await response.json();

      if (!result.ok) {
        setFeedback({
          tone: "error",
          message: result.message ?? "Failed to run workflow action",
        });
        return;
      }

      setFeedback({
        tone: "success",
        message: result.message ?? "Workflow action completed",
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to run workflow action",
      });
    }
  };

  const getDecisionFormName = (decision: EditorDecisionType): string => {
    switch (decision) {
      case SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW:
        return "InitiateExternalReview";
      case SUBMISSION_EDITOR_DECISION_ACCEPT:
      case SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION:
        return "Promote";
      case SUBMISSION_EDITOR_DECISION_DECLINE:
      case SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE:
      case SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS:
      case SUBMISSION_EDITOR_DECISION_RESUBMIT:
        return "SendReviews";
      case SUBMISSION_EDITOR_DECISION_REVERT_DECLINE:
        return "RevertDecline";
      case SUBMISSION_EDITOR_DECISION_NEW_ROUND:
        return "NewReviewRound";
      default:
        return "EditorDecision";
    }
  };

  // Render decision buttons - OJS 3.3 Style
  const renderDecisionButton = (decision: ReturnType<typeof getStageDecisions>[0]) => {
    const getButtonStyle = (name: string) => {
      const isDanger = name === "decline" || name === "revert";
      const isPrimary = name === "accept" || name === "sendToProduction" || name === "externalReview";
      
      if (isDanger) {
        return {
          backgroundColor: "#dc3545",
          borderColor: "#dc3545",
          color: "#ffffff",
          hoverBackgroundColor: "#c82333",
        };
      }
      if (isPrimary) {
        return {
          backgroundColor: "#006798",
          borderColor: "#006798",
          color: "#ffffff",
          hoverBackgroundColor: "#005a82",
        };
      }
      return {
        backgroundColor: "transparent",
        borderColor: "#006798",
        color: "#006798",
        hoverBackgroundColor: "#f8f9fa",
      };
    };

    const buttonStyle = getButtonStyle(decision.name);
    const isDisabled = !hasAssignment || !canDecide;

    return (
      <div
        key={decision.name}
        style={{
          borderRadius: "0.25rem",
          border: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
          padding: "0.75rem",
          transition: "background-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = "#f8f9fa";
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = "#ffffff";
          }
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#002C40",
                marginBottom: decision.toStage ? "0.25rem" : 0,
              }}
            >
              {decision.title}
            </div>
            {decision.toStage && (
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.25rem",
                }}
              >
                To: {decision.toStage.replace("submission.", "")}
              </div>
            )}
          </div>
          <PkpButton
            onClick={() => handleDecisionClick(decision.decision as EditorDecisionType)}
            disabled={isDisabled}
            title={
              !hasAssignment
                ? "Anda tidak memiliki akses untuk keputusan ini"
                : !canDecide
                ? "Anda hanya dapat merekomendasikan"
                : undefined
            }
            variant={
              buttonStyle.backgroundColor === "#dc3545" 
                ? "warnable"
                : buttonStyle.backgroundColor === "#006798"
                ? "primary"
                : "onclick"
            }
            size="sm"
            style={{
              whiteSpace: "nowrap",
              height: "2rem",
            }}
          >
            {decision.name === "externalReview" ? "Send to Review" :
             decision.name === "accept" ? "Accept" :
             decision.name === "decline" ? "Decline" :
             decision.name === "pendingRevisions" ? "Request Revisions" :
             decision.name === "resubmit" ? "Resubmit" :
             decision.name === "sendToProduction" ? "Send to Production" :
             decision.name === "revert" ? "Revert Decline" :
             decision.name === "newReviewRound" ? "New Round" :
             decision.title}
          </PkpButton>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        style={{
          borderRadius: "0",
          border: "none",
          backgroundColor: "#ffffff",
          padding: "1rem",
          boxShadow: "none",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <h3
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
              marginBottom: "0.75rem",
            }}
          >
            Editorial Decisions - {currentStage.charAt(0).toUpperCase() + currentStage.slice(1)} Stage
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {availableDecisions.map(renderDecisionButton)}
          </div>
          {currentStage === "copyediting" && (
            <div
              style={{
                marginTop: "1rem",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  borderRadius: "0.25rem",
                  border: "1px solid #e5e5e5",
                  backgroundColor: "#ffffff",
                  padding: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#002C40",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Request Author Copyediting
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(0, 0, 0, 0.54)",
                        marginTop: "0.25rem",
                      }}
                    >
                      Kirim permintaan kepada author untuk meninjau hasil copyediting sebelum
                      produksi.
                    </div>
                  </div>
                  <PkpButton
                    onClick={() => handleWorkflowAction("request_author_copyedit")}
                    disabled={!hasAssignment || !canDecide}
                    variant="onclick"
                    size="sm"
                    style={{
                      whiteSpace: "nowrap",
                      height: "2rem",
                    }}
                  >
                    Request Copyediting
                  </PkpButton>
                </div>
              </div>
            </div>
          )}
          {currentStage === "production" && (
            <div
              style={{
                marginTop: "1rem",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  borderRadius: "0.25rem",
                  border: "1px solid #e5e5e5",
                  backgroundColor: "#ffffff",
                  padding: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#002C40",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Mark as Scheduled (Send to Issue)
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(0, 0, 0, 0.54)",
                        marginTop: "0.25rem",
                      }}
                    >
                      Pastikan issue sudah dipilih di tab Publication → Issue sebelum menandai
                      submission sebagai terjadwal.
                    </div>
                  </div>
                  <PkpButton
                    onClick={() => handleWorkflowAction("send_to_issue")}
                    disabled={!hasAssignment || !canDecide}
                    variant="onclick"
                    size="sm"
                    style={{
                      whiteSpace: "nowrap",
                      height: "2rem",
                    }}
                  >
                    Send to Issue
                  </PkpButton>
                </div>
              </div>
            </div>
          )}
          {availableDecisions.length === 0 && (
            <div
              style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
                textAlign: "center",
                padding: "1rem",
              }}
            >
              {!hasAssignment
                ? "Anda tidak memiliki akses untuk membuat keputusan editorial pada stage ini."
                : "No editorial decisions available for this stage."}
            </div>
          )}
        </div>

        {feedback && (
          <div style={{ marginTop: "1rem" }}>
            <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
          </div>
        )}
      </div>

      {/* Decision Modals */}
      {openModal?.type === "InitiateExternalReview" && (
        <InitiateExternalReviewForm
          open={true}
          onClose={() => setOpenModal(null)}
          submissionId={submissionId}
          stage={currentStage}
          onSubmit={handleModalSubmit}
        />
      )}

      {openModal?.type === "Promote" && openModal.decision && (
        <PromoteForm
          open={true}
          onClose={() => setOpenModal(null)}
          submissionId={submissionId}
          stage={currentStage}
          decision={openModal.decision}
          reviewRoundId={reviewRoundId}
          authorName={authorName}
          files={files}
          reviewRounds={reviewRounds}
          onSubmit={handleModalSubmit}
        />
      )}

      {openModal?.type === "SendReviews" && openModal.decision && (
        <SendReviewsForm
          open={true}
          onClose={() => setOpenModal(null)}
          submissionId={submissionId}
          stage={currentStage}
          decision={openModal.decision}
          reviewRoundId={reviewRoundId}
          authorName={authorName}
          files={files}
          reviewRounds={reviewRounds}
          onSubmit={handleModalSubmit}
        />
      )}

      {openModal?.type === "RevertDecline" && (
        <RevertDeclineForm
          open={true}
          onClose={() => setOpenModal(null)}
          submissionId={submissionId}
          stage={currentStage}
          reviewRoundId={reviewRoundId}
          onSubmit={handleModalSubmit}
        />
      )}

      {openModal?.type === "NewReviewRound" && (
        <NewReviewRoundForm
          open={true}
          onClose={() => setOpenModal(null)}
          submissionId={submissionId}
          stage={currentStage}
          reviewRoundId={reviewRoundId}
          onSubmit={handleModalSubmit}
        />
      )}
    </>
  );
}

