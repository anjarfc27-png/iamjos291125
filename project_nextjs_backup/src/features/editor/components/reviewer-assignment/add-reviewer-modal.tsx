"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/ui/form-message";
import { Modal } from "@/components/ui/modal";
import type { SubmissionStage } from "../../types";

type Props = {
  open: boolean;
  onClose: () => void;
  submissionId: string;
  stage: SubmissionStage;
  reviewRoundId: string;
  journalId: string;
  onSubmit: (data: {
    submissionId: string;
    stage: SubmissionStage;
    reviewRoundId: string;
    reviewerId: string;
    dueDate?: string;
    responseDueDate?: string;
    reviewMethod: "anonymous" | "doubleAnonymous" | "open";
    personalMessage?: string;
  }) => Promise<void>;
};

type Reviewer = {
  id: string;
  name: string;
  email: string;
  expertise?: string[];
};

/**
 * Add Reviewer Modal
 * Based on OJS PKP 3.3 reviewer assignment
 * Used for: Assign reviewer to a review round
 */
export function AddReviewerModal({
  open,
  onClose,
  submissionId,
  stage,
  reviewRoundId,
  journalId,
  onSubmit,
}: Props) {
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [responseDueDate, setResponseDueDate] = useState("");
  const [reviewMethod, setReviewMethod] = useState<"anonymous" | "doubleAnonymous" | "open">("anonymous");
  const [personalMessage, setPersonalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available reviewers
  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    fetch(`/api/editor/journals/${journalId}/reviewers`)
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.reviewers) {
          setReviewers(json.reviewers);
        }
      })
      .catch(() => {
        setError("Failed to load reviewers");
      })
      .finally(() => setIsLoading(false));
  }, [open, journalId]);

  const handleSubmit = async () => {
    if (!selectedReviewerId) {
      setError("Please select a reviewer");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        submissionId,
        stage,
        reviewRoundId,
        reviewerId: selectedReviewerId,
        dueDate: dueDate || undefined,
        responseDueDate: responseDueDate || undefined,
        reviewMethod,
        personalMessage: personalMessage.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign reviewer");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate default dates (due date: 4 weeks, response due date: 1 week)
  useEffect(() => {
    if (open && !dueDate) {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 28); // 4 weeks
      setDueDate(defaultDueDate.toISOString().split("T")[0]);
    }
    if (open && !responseDueDate) {
      const defaultResponseDueDate = new Date();
      defaultResponseDueDate.setDate(defaultResponseDueDate.getDate() + 7); // 1 week
      setResponseDueDate(defaultResponseDueDate.toISOString().split("T")[0]);
    }
  }, [open, dueDate, responseDueDate]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Reviewer"
      widthClassName="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Reviewer Selection */}
        <div className="space-y-2">
          <Label htmlFor="reviewer">Reviewer *</Label>
          {isLoading ? (
            <div className="text-sm text-[var(--muted)]">Loading reviewers...</div>
          ) : (
            <select
              id="reviewer"
              name="reviewer"
              title="Select Reviewer"
              value={selectedReviewerId}
              onChange={(e) => setSelectedReviewerId(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a reviewer...</option>
              {reviewers.map((reviewer) => (
                <option key={reviewer.id} value={reviewer.id}>
                  {reviewer.name} ({reviewer.email})
                  {reviewer.expertise && reviewer.expertise.length > 0 && ` - ${reviewer.expertise.join(", ")}`}
                </option>
              ))}
            </select>
          )}
          <p className="text-xs text-[var(--muted)]">
            Select a reviewer to assign to this review round.
          </p>
        </div>

        {/* Review Method */}
        <div className="space-y-2">
          <Label>Review Method</Label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="reviewMethod"
                value="anonymous"
                checked={reviewMethod === "anonymous"}
                onChange={() => setReviewMethod("anonymous")}
                className="h-4 w-4"
              />
              <span className="text-sm">Anonymous (reviewer identity hidden from author)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="reviewMethod"
                value="doubleAnonymous"
                checked={reviewMethod === "doubleAnonymous"}
                onChange={() => setReviewMethod("doubleAnonymous")}
                className="h-4 w-4"
              />
              <span className="text-sm">Double Anonymous (both identities hidden)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="reviewMethod"
                value="open"
                checked={reviewMethod === "open"}
                onChange={() => setReviewMethod("open")}
                className="h-4 w-4"
              />
              <span className="text-sm">Open (identities visible)</span>
            </label>
          </div>
        </div>

        {/* Due Dates */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="responseDueDate">Response Due Date</Label>
            <Input
              id="responseDueDate"
              type="date"
              value={responseDueDate}
              onChange={(e) => setResponseDueDate(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-[var(--muted)]">
              Date by which reviewer must respond to the request
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Review Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-[var(--muted)]">
              Date by which review must be submitted
            </p>
          </div>
        </div>

        {/* Personal Message */}
        <div className="space-y-2">
          <Label htmlFor="personalMessage">Personal Message (Optional)</Label>
          <Textarea
            id="personalMessage"
            name="personalMessage"
            rows={4}
            value={personalMessage}
            onChange={(e) => setPersonalMessage(e.target.value)}
            placeholder="Add a personal message for the reviewer..."
            className="w-full"
          />
        </div>

        {error && (
          <FormMessage tone="error">{error}</FormMessage>
        )}

        {/* Form Footer */}
        <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || !selectedReviewerId}
          >
            Assign Reviewer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
