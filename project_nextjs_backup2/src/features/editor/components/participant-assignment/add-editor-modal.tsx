"use client";

import { useState, useEffect } from "react";
import { PkpModal } from "@/components/ui/pkp-modal";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpSelect } from "@/components/ui/pkp-select";
import { PkpCheckbox } from "@/components/ui/pkp-checkbox";
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
    recommendOnly?: boolean;
    canChangeMetadata?: boolean;
  }) => Promise<void>;
};

type JournalUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

/**
 * Add Editor Modal
 * Based on OJS PKP 3.3 editor assignment
 * Used for: Assign editor to a submission stage
 */
export function AddEditorModal({
  open,
  onClose,
  submissionId,
  stage,
  journalId,
  onSubmit,
}: Props) {
  const [editors, setEditors] = useState<JournalUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [recommendOnly, setRecommendOnly] = useState(false);
  const [canChangeMetadata, setCanChangeMetadata] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available editors
  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    fetch(`/api/editor/journals/${journalId}/users?role=editor,section_editor,manager`)
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.users) {
          setEditors(json.users);
        }
      })
      .catch(() => {
        setError("Failed to load editors");
      })
      .finally(() => setIsLoading(false));
  }, [open, journalId]);

  const handleSubmit = async () => {
    if (!selectedUserId) {
      setError("Please select an editor");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        submissionId,
        stage,
        userId: selectedUserId,
        recommendOnly,
        canChangeMetadata,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign editor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PkpModal
      isOpen={open}
      onClose={onClose}
      title="Assign Editor"
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
            Assign Editor
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
        {/* Editor Selection */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <label
            htmlFor="editor"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Editor *
          </label>
          {isLoading ? (
            <div
              style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
              }}
            >
              Loading editors...
            </div>
          ) : (
            <PkpSelect
              id="editor"
              name="editor"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
            >
              <option value="">Select an editor...</option>
              {editors.map((editor) => (
                <option key={editor.id} value={editor.id}>
                  {editor.name} ({editor.email})
                  {editor.role && ` - ${editor.role}`}
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
            Select an editor to assign to this stage.
          </p>
        </div>

        {/* Permissions */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <label
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Permissions
          </label>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <PkpCheckbox
                checked={recommendOnly}
                onChange={(e) => setRecommendOnly(e.target.checked)}
              />
              <span>Recommend Only (cannot make final decisions)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <PkpCheckbox
                checked={canChangeMetadata}
                onChange={(e) => setCanChangeMetadata(e.target.checked)}
              />
              <span>Can Change Metadata</span>
            </label>
          </div>
        </div>

        {error && <FormMessage tone="error">{error}</FormMessage>}
      </div>
    </PkpModal>
  );
}
