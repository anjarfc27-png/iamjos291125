"use client";

import { useMemo, useState } from "react";
import { AddReviewerModal } from "./add-reviewer-modal";
import type { SubmissionReview, SubmissionStage } from "../../types";
import {
  PkpTable,
  PkpTableHeader,
  PkpTableRow,
  PkpTableHead,
  PkpTableCell,
} from "@/components/ui/pkp-table";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpSelect } from "@/components/ui/pkp-select";

type Props = {
  submissionId: string;
  stage: SubmissionStage;
  reviewRoundId: string;
  journalId: string;
  reviews: SubmissionReview[];
  onAddReviewer?: (data: {
    submissionId: string;
    stage: SubmissionStage;
    reviewRoundId: string;
    reviewerId: string;
    dueDate?: string;
    responseDueDate?: string;
    reviewMethod: "anonymous" | "doubleAnonymous" | "open";
    personalMessage?: string;
  }) => Promise<void>;
  onViewReview?: (reviewId: string) => void;
  onEditReview?: (reviewId: string) => void;
  onRemoveReview?: (reviewId: string) => Promise<void>;
};

/**
 * Reviewer Assignment List
 * Displays all reviewer assignments for a review round
 * Based on OJS PKP 3.3 reviewer grid
 */
export function ReviewerAssignmentList({
  submissionId,
  stage,
  reviewRoundId,
  journalId,
  reviews,
  onAddReviewer,
  onViewReview,
  onEditReview,
  onRemoveReview,
}: Props) {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");

  const handleRemove = async (reviewId: string) => {
    if (!onRemoveReview) return;
    
    setIsRemoving(reviewId);
    try {
      await onRemoveReview(reviewId);
    } catch (error) {
      console.error("Failed to remove reviewer:", error);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleAddReviewer = async (data: any) => {
    if (!onAddReviewer) return;
    
    try {
      await onAddReviewer(data);
      setOpenAddModal(false);
    } catch (error) {
      console.error("Failed to add reviewer:", error);
      throw error;
    }
  };

  const filteredReviews = useMemo(() => {
    if (statusFilter === "all") return reviews;
    if (statusFilter === "completed") {
      return reviews.filter((review) => review.status === "completed" || review.recommendation);
    }
    return reviews.filter((review) => review.status !== "completed");
  }, [reviews, statusFilter]);

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    try {
      return new Intl.DateTimeFormat("id", { dateStyle: "medium" }).format(new Date(value));
    } catch {
      return value;
    }
  };

  const getStatusLabel = (review: SubmissionReview) => {
    if (review.status === "completed") return "Completed";
    if (review.status === "declined") return "Declined";
    if (review.status === "overdue") return "Overdue";
    return "Pending";
  };

  const isOverdue = (review: SubmissionReview) => {
    if (!review.dueDate || review.status === "completed") return false;
    const due = new Date(review.dueDate).getTime();
    return due < Date.now();
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Reviewers ({filteredReviews.length}/{reviews.length})
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Round {reviewRoundId.slice(0, 4).toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PkpSelect
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              style={{ minWidth: "10rem" }}
            >
              <option value="all">Semua status</option>
              <option value="pending">Belum selesai</option>
              <option value="completed">Selesai</option>
            </PkpSelect>
            {onAddReviewer && (
              <PkpButton size="sm" variant="onclick" onClick={() => setOpenAddModal(true)}>
                Add Reviewer
              </PkpButton>
            )}
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-center text-sm text-[var(--muted)]">
            No reviewers assigned to this review round.
          </div>
        ) : (
          <div className="overflow-x-auto rounded border border-[var(--border)]">
            <PkpTable>
              <PkpTableHeader>
                <PkpTableRow isHeader>
                  <PkpTableHead>Reviewer</PkpTableHead>
                  <PkpTableHead>Tanggal</PkpTableHead>
                  <PkpTableHead>Rekomendasi</PkpTableHead>
                  <PkpTableHead>Status</PkpTableHead>
                  <PkpTableHead style={{ textAlign: "right" }}>Aksi</PkpTableHead>
                </PkpTableRow>
              </PkpTableHeader>
              <tbody>
                {filteredReviews.map((review) => (
                  <PkpTableRow key={review.id}>
                    <PkpTableCell>
                      <div className="font-semibold text-[var(--foreground)]">
                        Reviewer #{review.reviewerId.slice(0, 6)}
                      </div>
                      {review.responseDueDate && (
                        <div className="text-xs text-[var(--muted)]">
                          Response due: {formatDate(review.responseDueDate)}
                        </div>
                      )}
                    </PkpTableCell>
                    <PkpTableCell>
                      <div className="text-sm text-[var(--foreground)]">
                        Due: {formatDate(review.dueDate)}
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        Assigned: {formatDate(review.assignmentDate)}
                      </div>
                    </PkpTableCell>
                    <PkpTableCell>
                      {review.recommendation ?? (
                        <span className="text-xs text-[var(--muted)]">—</span>
                      )}
                    </PkpTableCell>
                    <PkpTableCell>
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: isOverdue(review)
                            ? "rgba(244, 67, 54, 0.12)"
                            : review.status === "completed"
                            ? "rgba(0, 105, 152, 0.12)"
                            : "rgba(0, 0, 0, 0.08)",
                          color: isOverdue(review)
                            ? "#d32f2f"
                            : review.status === "completed"
                            ? "#006798"
                            : "rgba(0, 0, 0, 0.7)",
                        }}
                      >
                        {isOverdue(review) ? "Overdue" : getStatusLabel(review)}
                      </span>
                    </PkpTableCell>
                    <PkpTableCell style={{ textAlign: "right" }}>
                      <div className="flex flex-wrap justify-end gap-2">
                        {onViewReview && (
                          <PkpButton
                            size="sm"
                            variant="link"
                            onClick={() => onViewReview(review.id)}
                          >
                            View
                          </PkpButton>
                        )}
                        {onEditReview && (
                          <PkpButton
                            size="sm"
                            variant="link"
                            onClick={() => onEditReview(review.id)}
                          >
                            Edit
                          </PkpButton>
                        )}
                        {onRemoveReview && (
                          <PkpButton
                            size="sm"
                            variant="onclick"
                            onClick={() => handleRemove(review.id)}
                            disabled={isRemoving === review.id}
                            loading={isRemoving === review.id}
                          >
                            Remove
                          </PkpButton>
                        )}
                      </div>
                    </PkpTableCell>
                  </PkpTableRow>
                ))}
              </tbody>
            </PkpTable>
          </div>
        )}
      </div>

      {/* Add Reviewer Modal */}
      {openAddModal && onAddReviewer && (
        <AddReviewerModal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          submissionId={submissionId}
          stage={stage}
          reviewRoundId={reviewRoundId}
          journalId={journalId}
          onSubmit={handleAddReviewer}
        />
      )}
    </>
  );
}
