"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SubmissionFile, SubmissionStage } from "../../types";
import { PkpModal } from "@/components/ui/pkp-modal";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpCheckbox } from "@/components/ui/pkp-checkbox";
import { FormMessage } from "@/components/ui/form-message";

type Props = {
  open: boolean;
  onClose: () => void;
  submissionId: string;
  targetStage: SubmissionStage;
  availableFiles: SubmissionFile[]; // Files from other stages
  onFileCopied: () => void;
};

/**
 * File Copy Modal
 * Modal for copying files from other stages to the current stage
 * Based on OJS 3.3 file copying functionality
 */
export function FileCopyModal({
  open,
  onClose,
  submissionId,
  targetStage,
  availableFiles,
  onFileCopied,
}: Props) {
  const router = useRouter();
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter out files that are already in the target stage
  const filesToCopy = availableFiles.filter((file) => file.stage !== targetStage);

  // Group files by stage
  const filesByStage = filesToCopy.reduce(
    (acc, file) => {
      if (!acc[file.stage]) {
        acc[file.stage] = [];
      }
      acc[file.stage].push(file);
      return acc;
    },
    {} as Record<SubmissionStage, SubmissionFile[]>
  );

  const handleToggleFile = (fileId: string) => {
    if (selectedFileIds.includes(fileId)) {
      setSelectedFileIds(selectedFileIds.filter((id) => id !== fileId));
    } else {
      setSelectedFileIds([...selectedFileIds, fileId]);
    }
  };

  const handleCopyFiles = async () => {
    if (selectedFileIds.length === 0) {
      setError("Please select at least one file to copy");
      return;
    }

    setIsCopying(true);
    setError(null);

    try {
      const res = await fetch(`/api/editor/submissions/${submissionId}/files/copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileIds: selectedFileIds,
          targetStage,
        }),
      });

      const json = await res.json();

      if (!json.ok) {
        setError(json.message ?? "Failed to copy files");
        return;
      }

      setSelectedFileIds([]);
      onFileCopied();
      startTransition(() => {
        router.refresh();
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to copy files");
    } finally {
      setIsCopying(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <PkpModal
      isOpen={open}
      onClose={onClose}
      title={`Copy Files to ${targetStage.charAt(0).toUpperCase() + targetStage.slice(1)} Stage`}
      size="large"
      footer={
        <>
          <PkpButton
            variant="onclick"
            onClick={onClose}
            disabled={isCopying}
          >
            Cancel
          </PkpButton>
          <PkpButton
            variant="primary"
            onClick={handleCopyFiles}
            disabled={isCopying || selectedFileIds.length === 0}
            loading={isCopying}
          >
            Copy Files ({selectedFileIds.length})
          </PkpButton>
        </>
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
          {filesToCopy.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
                backgroundColor: "#f8f9fa",
                borderRadius: "0.25rem",
                border: "1px solid #e5e5e5",
              }}
            >
              No files available to copy from other stages.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {(Object.keys(filesByStage) as SubmissionStage[]).map((stage) => (
                <div key={stage}>
                  <h3
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#002C40",
                      marginBottom: "0.75rem",
                      textTransform: "capitalize",
                    }}
                  >
                    {stage} Files ({filesByStage[stage].length})
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      borderRadius: "0.25rem",
                      border: "1px solid #e5e5e5",
                      backgroundColor: "#f8f9fa",
                      padding: "0.75rem",
                    }}
                  >
                    {filesByStage[stage].map((file) => (
                      <label
                        key={file.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.5rem",
                          borderRadius: "0.25rem",
                          backgroundColor: selectedFileIds.includes(file.id) ? "#e3f2fd" : "transparent",
                          cursor: "pointer",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedFileIds.includes(file.id)) {
                            e.currentTarget.style.backgroundColor = "#ffffff";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedFileIds.includes(file.id)) {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }
                        }}
                      >
                        <PkpCheckbox
                          checked={selectedFileIds.includes(file.id)}
                          onChange={() => handleToggleFile(file.id)}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 500,
                              color: "#002C40",
                            }}
                          >
                            {file.label}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "rgba(0, 0, 0, 0.54)",
                              marginTop: "0.25rem",
                            }}
                          >
                            {file.storagePath} • {formatFileSize(file.size)} • {file.kind}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{ marginTop: "1rem" }}>
              <FormMessage tone="error">{error}</FormMessage>
            </div>
          )}
        </div>
    </PkpModal>
  );
}


