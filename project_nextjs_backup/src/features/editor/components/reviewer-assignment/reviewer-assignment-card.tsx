"use client";

import { Button } from "@/components/ui/button";
import type { SubmissionReview } from "../../types";

type Props = {
  review: SubmissionReview;
  reviewRoundId: string;
  onView?: (reviewId: string) => void;
  onEdit?: (reviewId: string) => void;
  onRemove?: (reviewId: string) => void;
};

/**
 * Reviewer Assignment Card
 * Displays a single reviewer assignment in a review round
 * Based on OJS PKP 3.3 reviewer grid
 */
export function ReviewerAssignmentCard({
  review,
  reviewRoundId,
  onView,
  onEdit,
  onRemove,
}: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
      case "complete":
        return "text-green-600";
      case "declined":
      case "cancelled":
        return "text-red-600";
      case "accepted":
        return "text-blue-600";
      case "overdue":
        return "text-orange-600";
      default:
        return "text-[var(--muted)]";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "awaiting_response":
        return "Awaiting Response";
      case "declined":
        return "Declined";
      case "response_overdue":
        return "Response Overdue";
      case "accepted":
        return "Accepted";
      case "review_overdue":
        return "Review Overdue";
      case "received":
        return "Review Received";
      case "complete":
        return "Complete";
      case "thanked":
        return "Thanked";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    try {
      return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
      }).format(new Date(date));
    } catch {
      return date;
    }
  };

  const isOverdue = (dueDate?: string | null) => {
    if (!dueDate) return false;
    try {
      return new Date(dueDate) < new Date() && review.status !== "complete" && review.status !== "received";
    } catch {
      return false;
    }
  };

  return (
    <div className="rounded-md border border-[var(--border)] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[var(--foreground)]">
              Reviewer: {review.reviewerId}
            </span>
            <span
              className={`text-xs font-medium ${getStatusColor(review.status)}`}
            >
              {getStatusLabel(review.status)}
            </span>
            {isOverdue(review.dueDate) && (
              <span className="text-xs font-medium text-orange-600">(Overdue)</span>
            )}
          </div>

          <div className="mt-2 space-y-1 text-xs text-[var(--muted)]">
            <div>
              <span className="font-medium">Assigned:</span> {formatDate(review.assignmentDate)}
            </div>
            {review.dueDate && (
              <div>
                <span className="font-medium">Review Due:</span> {formatDate(review.dueDate)}
                {isOverdue(review.dueDate) && " (Overdue)"}
              </div>
            )}
            {review.responseDueDate && (
              <div>
                <span className="font-medium">Response Due:</span> {formatDate(review.responseDueDate)}
              </div>
            )}
            {review.submittedAt && (
              <div>
                <span className="font-medium">Submitted:</span> {formatDate(review.submittedAt)}
              </div>
            )}
            {review.recommendation && (
              <div className="mt-2 rounded bg-[var(--surface-muted)] px-2 py-1">
                <span className="font-medium">Recommendation:</span> {review.recommendation}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {onView && review.status === "received" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(review.id)}
            >
              View
            </Button>
          )}
          {onEdit && (review.status === "awaiting_response" || review.status === "accepted") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(review.id)}
            >
              Edit
            </Button>
          )}
          {onRemove && review.status !== "complete" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(review.id)}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
