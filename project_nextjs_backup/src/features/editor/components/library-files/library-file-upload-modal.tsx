"use client";

import { useState } from "react";
import { FormMessage } from "@/components/ui/form-message";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpModal } from "@/components/ui/pkp-modal";
import { PkpSelect } from "@/components/ui/pkp-select";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import { LIBRARY_FILE_STAGE_OPTIONS } from "./library-files-panel";

type LibraryFileUploadModalProps = {
  isOpen: boolean;
  journalId: string | null;
  onClose: () => void;
  onUploaded: () => void;
};

type UploadMode = "upload" | "remote";

export function LibraryFileUploadModal({ isOpen, journalId, onClose, onUploaded }: LibraryFileUploadModalProps) {
  const [label, setLabel] = useState("");
  const [stage, setStage] = useState<string>(LIBRARY_FILE_STAGE_OPTIONS[0]?.value ?? "general");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<UploadMode>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [remoteUrl, setRemoteUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setLabel("");
    setStage(LIBRARY_FILE_STAGE_OPTIONS[0]?.value ?? "general");
    setDescription("");
    setMode("upload");
    setFile(null);
    setRemoteUrl("");
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!journalId) {
      setError("Journal context is not resolved. Please reload and try again.");
      return;
    }

    if (!label.trim()) {
      setError("File label is required.");
      return;
    }

    if (mode === "upload" && !file) {
      setError("Please choose a file to upload.");
      return;
    }

    if (mode === "remote" && !remoteUrl.trim()) {
      setError("Remote URL is required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("journalId", journalId);
      formData.append("label", label.trim());
      formData.append("stage", stage);
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      if (mode === "upload" && file) {
        formData.append("file", file);
      }
      if (mode === "remote") {
        formData.append("remoteUrl", remoteUrl.trim());
      }

      const response = await fetch("/api/editor/library-files", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Failed to upload library file.");
      }

      onUploaded();
      resetForm();
      onClose();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload library file.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PkpModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Library File"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label
            htmlFor="libraryLabel"
            style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#002C40", marginBottom: "0.35rem" }}
          >
            File Label *
          </label>
          <PkpInput
            id="libraryLabel"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="e.g., Author Guidelines"
            maxLength={120}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 12rem" }}>
            <label
              htmlFor="libraryStage"
              style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#002C40", marginBottom: "0.35rem" }}
            >
              Stage
            </label>
            <PkpSelect
              id="libraryStage"
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
          <div style={{ flex: "1 1 12rem" }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#002C40", marginBottom: "0.35rem" }}>
              Source
            </label>
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", height: "2.5rem" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="librarySource"
                  value="upload"
                  checked={mode === "upload"}
                  onChange={() => setMode("upload")}
                />
                Upload File
              </label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="librarySource"
                  value="remote"
                  checked={mode === "remote"}
                  onChange={() => setMode("remote")}
                />
                Remote URL
              </label>
            </div>
          </div>
        </div>

        {mode === "upload" ? (
          <div>
            <label
              htmlFor="libraryFileInput"
              style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#002C40", marginBottom: "0.35rem" }}
            >
              Select File *
            </label>
            <input
              id="libraryFileInput"
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              style={{ width: "100%" }}
            />
            <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)" }}>
              Files are stored privately in Supabase storage.
            </p>
          </div>
        ) : (
          <div>
            <label
              htmlFor="libraryRemoteUrl"
              style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#002C40", marginBottom: "0.35rem" }}
            >
              Remote URL *
            </label>
            <PkpInput
              id="libraryRemoteUrl"
              type="url"
              placeholder="https://example.com/resource.pdf"
              value={remoteUrl}
              onChange={(event) => setRemoteUrl(event.target.value)}
            />
          </div>
        )}

        <div>
          <label
            htmlFor="libraryDescription"
            style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#002C40", marginBottom: "0.35rem" }}
          >
            Description
          </label>
          <PkpTextarea
            id="libraryDescription"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Provide short description or usage notes…"
          />
        </div>

        {error && <FormMessage tone="error">{error}</FormMessage>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
          <PkpButton variant="onclick" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </PkpButton>
          <PkpButton onClick={handleSubmit} loading={isSubmitting} disabled={isSubmitting}>
            Upload
          </PkpButton>
        </div>
      </div>
    </PkpModal>
  );
}




