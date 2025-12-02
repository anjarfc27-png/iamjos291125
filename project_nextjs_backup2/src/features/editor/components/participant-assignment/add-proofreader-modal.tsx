"use client";

import { useState, useEffect } from "react";
import { PkpModal } from "@/components/ui/pkp-modal";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpSelect } from "@/components/ui/pkp-select";
import { FormMessage } from "@/components/ui/form-message";
import type { SubmissionStage } from "../../types";

type Props = {
  open: boolean;
  onClose: () => void;
  submissionId: string;
  stage: SubmissionStage;
  journalId: string;
  onSubmit: (data: {
    submissionId: string;
    stage: SubmissionStage;
    userId: string;
  }) => Promise<void>;
};

type JournalUser = {
  id: string;
  name: string;
  email: string;
};

/**
 * Add Proofreader Modal
 * Based on OJS PKP 3.3 proofreader assignment - OJS 3.3 Exact Layout
 * Used for: Assign proofreader to production stage
 */
export function AddProofreaderModal({
  open,
  onClose,
  submissionId,
  stage,
  journalId,
  onSubmit,
}: Props) {
  const [proofreaders, setProofreaders] = useState<JournalUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available proofreaders
  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    fetch(`/api/editor/journals/${journalId}/users?role=proofreader,assistant`)
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.users) {
          setProofreaders(json.users);
        }
      })
      .catch(() => {
        setError("Failed to load proofreaders");
      })
      .finally(() => setIsLoading(false));
  }, [open, journalId]);

  const handleSubmit = async () => {
    if (!selectedUserId) {
      setError("Please select a proofreader");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        submissionId,
        stage,
        userId: selectedUserId,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign proofreader");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PkpModal
      isOpen={open}
      onClose={onClose}
      title="Assign Proofreader"
      size="large"
      footer={
        <>
          <PkpButton
            variant="onclick"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </PkpButton>
          <PkpButton
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedUserId}
            loading={isSubmitting}
          >
            Assign Proofreader
          </PkpButton>
        </>
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Proofreader Selection */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <label
            htmlFor="proofreader"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Proofreader *
          </label>
          {isLoading ? (
            <div
              style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
              }}
            >
              Loading proofreaders...
            </div>
          ) : (
            <PkpSelect
              id="proofreader"
              name="proofreader"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
            >
              <option value="">Select a proofreader...</option>
              {proofreaders.map((proofreader) => (
                <option key={proofreader.id} value={proofreader.id}>
                  {proofreader.name} ({proofreader.email})
                </option>
              ))}
            </PkpSelect>
          )}
          <p
            style={{
              fontSize: "0.75rem",
              color: "rgba(0, 0, 0, 0.54)",
            }}
          >
            Select a proofreader to assign to the production stage.
          </p>
        </div>

        {error && <FormMessage tone="error">{error}</FormMessage>}
      </div>
    </PkpModal>
  );
}
