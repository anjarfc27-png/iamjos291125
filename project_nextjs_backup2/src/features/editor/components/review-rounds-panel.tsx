"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { PkpButton } from "@/components/ui/pkp-button";
import { FormMessage } from "@/components/ui/form-message";
import { NewReviewRoundForm } from "./editor-decision-forms/new-review-round-form";
import { ReviewerAssignmentList } from "./reviewer-assignment/reviewer-assignment-list";
import { saveEditorDecision } from "../actions/editor-decisions";
import { assignReviewer, removeReviewerAssignment } from "../actions/reviewer-assignment";
import type { SubmissionReviewRound, SubmissionStage } from "../types";
import { SUBMISSION_EDITOR_DECISION_NEW_ROUND } from "../types";
import { SUBMISSION_STAGES } from "../types";
import {
  PkpTable,
  PkpTableHeader,
  PkpTableRow,
  PkpTableHead,
  PkpTableCell,
} from "@/components/ui/pkp-table";
import { PkpSelect } from "@/components/ui/pkp-select";

type Props = {
  submissionId: string;
  rounds: SubmissionReviewRound[];
  journalId: string;
};

export function ReviewRoundsPanel({ submissionId, rounds, journalId }: Props) {
  const router = useRouter();
  const [openNewRoundModal, setOpenNewRoundModal] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [stageFilter, setStageFilter] = useState<SubmissionStage | "all">("all");
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(rounds.at(-1)?.id ?? null);

  const handleCreateRound = async (data: {
    submissionId: string;
    stage: SubmissionStage;
    decision: typeof SUBMISSION_EDITOR_DECISION_NEW_ROUND;
    reviewRoundId?: string;
    selectedFiles?: string[];
  }) => {
    setFeedback(null);
    try {
      const result = await saveEditorDecision({
        submissionId: data.submissionId,
        stage: data.stage,
        decision: data.decision,
        reviewRoundId: data.reviewRoundId,
        selectedFiles: data.selectedFiles,
      });

      if (!result.ok) {
        setFeedback({ tone: "error", message: result.error ?? "Failed to create review round" });
        return;
      }

      setFeedback({ tone: "success", message: result.message ?? "Review round created successfully" });
      setOpenNewRoundModal(false);
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to create review round",
      });
    }
  };

  const handleAddReviewer = async (data: {
    submissionId: string;
    stage: SubmissionStage;
    reviewRoundId: string;
    reviewerId: string;
    dueDate?: string;
    responseDueDate?: string;
    reviewMethod: "anonymous" | "doubleAnonymous" | "open";
    personalMessage?: string;
  }) => {
    setFeedback(null);
    try {
      const result = await assignReviewer(data);
      if (!result.ok) {
        setFeedback({ tone: "error", message: result.error ?? "Failed to assign reviewer" });
        return;
      }
      setFeedback({ tone: "success", message: result.message ?? "Reviewer assigned successfully" });
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to assign reviewer",
      });
      throw error;
    }
  };

  const handleRemoveReviewer = async (reviewId: string) => {
    setFeedback(null);
    try {
      const result = await removeReviewerAssignment(reviewId);
      if (!result.ok) {
        setFeedback({ tone: "error", message: result.error ?? "Failed to remove reviewer" });
        return;
      }
      setFeedback({ tone: "success", message: result.message ?? "Reviewer removed successfully" });
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to remove reviewer",
      });
    }
  };

  const filteredRounds = useMemo(() => {
    if (stageFilter === "all") {
      return rounds;
    }
    return rounds.filter((round) => round.stage === stageFilter);
  }, [rounds, stageFilter]);

  useEffect(() => {
    if (!selectedRoundId && filteredRounds.length > 0) {
      setSelectedRoundId(filteredRounds[filteredRounds.length - 1].id);
    } else if (filteredRounds.every((round) => round.id !== selectedRoundId)) {
      setSelectedRoundId(filteredRounds[filteredRounds.length - 1]?.id ?? null);
    }
  }, [filteredRounds, selectedRoundId]);

  const selectedRound = filteredRounds.find((round) => round.id === selectedRoundId) ?? filteredRounds.at(-1);
  const currentReviewRound = rounds.length > 0 ? rounds[rounds.length - 1] : undefined;

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    try {
      return new Intl.DateTimeFormat("id", { dateStyle: "medium" }).format(new Date(value));
    } catch {
      return value;
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Header - OJS 3.3 Style */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#002C40",
              }}
            >
              Review Rounds ({filteredRounds.length}/{rounds.length})
            </h3>
            <p style={{ fontSize: "0.75rem", color: "rgba(0,0,0,0.54)" }}>
              Stage filter: {stageFilter === "all" ? "All" : stageFilter}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <PkpSelect
              value={stageFilter}
              onChange={(event) => setStageFilter(event.target.value as SubmissionStage | "all")}
              style={{ minWidth: "12rem" }}
            >
              <option value="all">All stages</option>
              {SUBMISSION_STAGES.map((stageValue) => (
                <option key={stageValue} value={stageValue}>
                  {stageValue}
                </option>
              ))}
            </PkpSelect>
            <PkpButton variant="primary" size="sm" onClick={() => setOpenNewRoundModal(true)}>
              New Review Round
            </PkpButton>
          </div>
        </div>

        {feedback && (
          <div style={{ marginTop: "0.5rem" }}>
            <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
          </div>
        )}

        {/* Review Rounds List - OJS 3.3 Style */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {rounds.length === 0 ? (
            <div
              style={{
                borderRadius: "0.25rem",
                border: "1px dashed #e5e5e5",
                backgroundColor: "#f8f9fa",
                padding: "1.5rem",
                textAlign: "center",
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
              }}
            >
              Belum ada review round.
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <PkpTable>
                  <PkpTableHeader>
                    <PkpTableRow isHeader>
                      <PkpTableHead>Stage</PkpTableHead>
                      <PkpTableHead>Round</PkpTableHead>
                      <PkpTableHead>Status</PkpTableHead>
                      <PkpTableHead>Reviewers</PkpTableHead>
                      <PkpTableHead>Tanggal</PkpTableHead>
                      <PkpTableHead style={{ textAlign: "right" }}>Actions</PkpTableHead>
                    </PkpTableRow>
                  </PkpTableHeader>
                  <tbody>
                    {filteredRounds.map((round) => (
                      <PkpTableRow key={round.id}>
                        <PkpTableCell>{round.stage}</PkpTableCell>
                        <PkpTableCell>{round.round}</PkpTableCell>
                        <PkpTableCell>
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                            style={{
                              backgroundColor:
                                round.status === "completed"
                                  ? "rgba(0, 105, 152, 0.12)"
                                  : round.status === "active"
                                  ? "rgba(0, 178, 78, 0.12)"
                                  : "rgba(0, 0, 0, 0.08)",
                              color:
                                round.status === "completed"
                                  ? "#006798"
                                  : round.status === "active"
                                  ? "#00834e"
                                  : "rgba(0, 0, 0, 0.7)",
                            }}
                          >
                            {round.status}
                          </span>
                        </PkpTableCell>
                        <PkpTableCell>{round.reviews.length}</PkpTableCell>
                        <PkpTableCell>
                          <div className="text-sm text-[var(--foreground)]">
                            Mulai: {formatDate(round.startedAt)}
                          </div>
                          <div className="text-xs text-[var(--muted)]">
                            Ditutup: {formatDate(round.closedAt)}
                          </div>
                        </PkpTableCell>
                        <PkpTableCell style={{ textAlign: "right" }}>
                          <PkpButton
                            size="sm"
                            variant={selectedRoundId === round.id ? "primary" : "onclick"}
                            onClick={() => setSelectedRoundId(round.id)}
                          >
                            {selectedRoundId === round.id ? "Terpilih" : "Lihat"}
                          </PkpButton>
                        </PkpTableCell>
                      </PkpTableRow>
                    ))}
                  </tbody>
                </PkpTable>
              </div>

              {selectedRound ? (
                <div
                  key={selectedRound.id}
                  style={{
                    borderRadius: "0.25rem",
                    border: "1px solid #e5e5e5",
                    backgroundColor: "#ffffff",
                    padding: "1rem",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      marginBottom: "0.75rem",
                      paddingBottom: "0.75rem",
                      borderBottom: "1px solid #e5e5e5",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "#002C40",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {selectedRound.stage} · Round {selectedRound.round}
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                        }}
                      >
                        Status: {selectedRound.status}
                      </p>
                    </div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(0, 0, 0, 0.54)",
                      }}
                    >
                      {formatDate(selectedRound.startedAt)}
                      {selectedRound.closedAt && ` · Closed ${formatDate(selectedRound.closedAt)}`}
                    </p>
                  </div>

                  {selectedRound.notes && (
                    <p
                      style={{
                        marginTop: "0.5rem",
                        marginBottom: "0.75rem",
                        fontSize: "0.875rem",
                        color: "rgba(0, 0, 0, 0.84)",
                        lineHeight: "1.5",
                      }}
                    >
                      {selectedRound.notes}
                    </p>
                  )}

                  <div style={{ marginTop: "1rem" }}>
                    <ReviewerAssignmentList
                      submissionId={submissionId}
                      stage={selectedRound.stage}
                      reviewRoundId={selectedRound.id}
                      journalId={journalId}
                      reviews={selectedRound.reviews}
                      onAddReviewer={handleAddReviewer}
                      onRemoveReview={handleRemoveReviewer}
                    />
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* New Review Round Modal */}
      {openNewRoundModal && (
        <NewReviewRoundForm
          open={openNewRoundModal}
          onClose={() => setOpenNewRoundModal(false)}
          submissionId={submissionId}
          stage="review"
          reviewRoundId={currentReviewRound?.id}
          onSubmit={handleCreateRound}
        />
      )}
    </>
  );
}
