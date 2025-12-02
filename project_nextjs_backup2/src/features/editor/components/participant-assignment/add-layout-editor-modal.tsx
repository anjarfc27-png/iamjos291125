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
 * Add Layout Editor Modal
 * Based on OJS PKP 3.3 layout editor assignment - OJS 3.3 Exact Layout
 * Used for: Assign layout editor to production stage
 */
export function AddLayoutEditorModal({
  open,
  onClose,
  submissionId,
  stage,
  journalId,
  onSubmit,
}: Props) {
  const [layoutEditors, setLayoutEditors] = useState<JournalUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available layout editors
  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    fetch(`/api/editor/journals/${journalId}/users?role=layout_editor,assistant`)
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.users) {
          setLayoutEditors(json.users);
        }
      })
      .catch(() => {
        setError("Failed to load layout editors");
      })
      .finally(() => setIsLoading(false));
  }, [open, journalId]);

  const handleSubmit = async () => {
    if (!selectedUserId) {
      setError("Please select a layout editor");
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
      setError(err instanceof Error ? err.message : "Failed to assign layout editor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PkpModal
      isOpen={open}
      onClose={onClose}
      title="Assign Layout Editor"
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
            Assign Layout Editor
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
        {/* Layout Editor Selection */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <label
            htmlFor="layoutEditor"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Layout Editor *
          </label>
          {isLoading ? (
            <div
              style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
              }}
            >
              Loading layout editors...
            </div>
          ) : (
            <PkpSelect
              id="layoutEditor"
              name="layoutEditor"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
            >
              <option value="">Select a layout editor...</option>
              {layoutEditors.map((editor) => (
                <option key={editor.id} value={editor.id}>
                  {editor.name} ({editor.email})
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
            Select a layout editor to assign to the production stage.
          </p>
        </div>

        {error && <FormMessage tone="error">{error}</FormMessage>}
      </div>
    </PkpModal>
  );
}
