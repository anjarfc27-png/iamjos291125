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
 * Add Copyeditor Modal
 * Based on OJS PKP 3.3 copyeditor assignment - OJS 3.3 Exact Layout
 * Used for: Assign copyeditor to a submission stage
 */
export function AddCopyeditorModal({
  open,
  onClose,
  submissionId,
  stage,
  journalId,
  onSubmit,
}: Props) {
  const [copyeditors, setCopyeditors] = useState<JournalUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available copyeditors
  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    fetch(`/api/editor/journals/${journalId}/users?role=copyeditor,assistant`)
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.users) {
          setCopyeditors(json.users);
        }
      })
      .catch(() => {
        setError("Failed to load copyeditors");
      })
      .finally(() => setIsLoading(false));
  }, [open, journalId]);

  const handleSubmit = async () => {
    if (!selectedUserId) {
      setError("Please select a copyeditor");
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
      setError(err instanceof Error ? err.message : "Failed to assign copyeditor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PkpModal
      isOpen={open}
      onClose={onClose}
      title="Assign Copyeditor"
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
            Assign Copyeditor
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
        {/* Copyeditor Selection */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <label
            htmlFor="copyeditor"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Copyeditor *
          </label>
          {isLoading ? (
            <div
              style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
              }}
            >
              Loading copyeditors...
            </div>
          ) : (
            <PkpSelect
              id="copyeditor"
              name="copyeditor"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
            >
              <option value="">Select a copyeditor...</option>
              {copyeditors.map((copyeditor) => (
                <option key={copyeditor.id} value={copyeditor.id}>
                  {copyeditor.name} ({copyeditor.email})
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
            Select a copyeditor to assign to this stage.
          </p>
        </div>

        {error && <FormMessage tone="error">{error}</FormMessage>}
      </div>
    </PkpModal>
  );
}
