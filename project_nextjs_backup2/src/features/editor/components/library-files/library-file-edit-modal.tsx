"use client";

import { useEffect, useState } from "react";
import { FormMessage } from "@/components/ui/form-message";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpModal } from "@/components/ui/pkp-modal";
import { PkpSelect } from "@/components/ui/pkp-select";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import type { LibraryFile } from "@/features/editor/types";
import { LIBRARY_FILE_STAGE_OPTIONS } from "./library-files-panel";

type LibraryFileEditModalProps = {
  isOpen: boolean;
  file: LibraryFile | null;
  journalId: string | null;
  onClose: () => void;
  onUpdated: () => void;
};

export function LibraryFileEditModal({ isOpen, file, journalId, onClose, onUpdated }: LibraryFileEditModalProps) {
  const [label, setLabel] = useState("");
  const [stage, setStage] = useState<string>(LIBRARY_FILE_STAGE_OPTIONS[0]?.value ?? "general");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (file) {
      setLabel(file.fileName);
      setStage(file.stage || "general");
      setDescription(file.description ?? "");
      setError(null);
      setIsSubmitting(false);
    }
  }, [file]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    onClose();
  };

  const handleSubmit = async () => {
    if (!journalId || !file) {
      setError("Missing journal context. Please reload and try again.");
      return;
    }
    if (!label.trim()) {
      setError("File label is required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/editor/library-files/${file.id}?journalId=${journalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: label.trim(),
          stage,
          description: description.trim() ? description.trim() : null,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Failed to update library file.");
      }
      onUpdated();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update library file.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PkpModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Library File"
    >
      {file ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label
              htmlFor="editLibraryLabel"
              style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#002C40", marginBottom: "0.35rem" }}
            >
              File Label *
            </label>
            <PkpInput
              id="editLibraryLabel"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              maxLength={120}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 12rem" }}>
              <label
                htmlFor="editLibraryStage"
                style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#002C40", marginBottom: "0.35rem" }}
              >
                Stage
              </label>
              <PkpSelect
                id="editLibraryStage"
                value={stage}
                onChange={(event) => setStage(event.target.value)}
              >
                {LIBRARY_FILE_STAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </PkpSelect>
            </div>
            <div style={{ flex: "1 1 12rem", fontSize: "0.85rem", color: "rgba(0, 0, 0, 0.54)" }}>
              <div style={{ fontWeight: 600, color: "#002C40", marginBottom: "0.25rem" }}>Source</div>
              <div>{file.source === "remote" || file.remoteUrl ? "Remote resource" : "Uploaded file"}</div>
              {file.remoteUrl && (
                <a
                  href={file.remoteUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#006798", textDecoration: "underline" }}
                >
                  {file.remoteUrl}
                </a>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="editLibraryDescription"
              style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#002C40", marginBottom: "0.35rem" }}
            >
              Description
            </label>
            <PkpTextarea
              id="editLibraryDescription"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
            />
          </div>

          {error && <FormMessage tone="error">{error}</FormMessage>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <PkpButton variant="onclick" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </PkpButton>
            <PkpButton onClick={handleSubmit} loading={isSubmitting} disabled={isSubmitting}>
              Save Changes
            </PkpButton>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.54)" }}>
          Unable to load file details. Please close the modal and try again.
        </p>
      )}
    </PkpModal>
  );
}




