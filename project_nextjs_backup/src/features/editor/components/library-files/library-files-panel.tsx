"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PkpButton,
} from "@/components/ui/pkp-button";
import {
  PkpInput,
} from "@/components/ui/pkp-input";
import {
  PkpSelect,
} from "@/components/ui/pkp-select";
import {
  PkpTable,
  PkpTableCell,
  PkpTableHead,
  PkpTableHeader,
  PkpTableRow,
} from "@/components/ui/pkp-table";
import { useAuth } from "@/contexts/AuthContext";
import type { LibraryFile } from "@/features/editor/types";
import { LibraryFileEditModal } from "./library-file-edit-modal";
import { LibraryFileUploadModal } from "./library-file-upload-modal";

export const LIBRARY_FILE_STAGE_OPTIONS = [
  { value: "general", label: "General Repository" },
  { value: "submission", label: "Submission" },
  { value: "review", label: "Review" },
  { value: "copyediting", label: "Copyediting" },
  { value: "production", label: "Production" },
  { value: "marketing", label: "Marketing/Promotion" },
] as const;

export type LibraryFileStage = (typeof LIBRARY_FILE_STAGE_OPTIONS)[number]["value"];

type Feedback = { tone: "success" | "error"; message: string } | null;

export function LibraryFilesPanel() {
  const { user } = useAuth();
  const journalId = useMemo(() => user?.roles.find((role) => role.context_id)?.context_id ?? null, [user]);

  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [searchInput, setSearchInput] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingFile, setEditingFile] = useState<LibraryFile | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const appliedSearchRef = useRef("");

  const fetchFiles = useCallback(
    async (options: { search?: string; silent?: boolean } = {}) => {
      if (!journalId) {
        return;
      }
      const query = (options.search ?? appliedSearchRef.current).trim();
      const isSilent = options.silent ?? false;
      if (isSilent) {
        setReloading(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams({ journalId });
        if (query) {
          params.append("search", query);
        }
        const response = await fetch(`/api/editor/library-files?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok || !data.ok) {
          throw new Error(data.message || "Failed to load library files.");
        }
        setFiles(data.files);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load library files.");
      } finally {
        if (isSilent) {
          setReloading(false);
        } else {
          setLoading(false);
        }
      }
    },
    [journalId],
  );

  useEffect(() => {
    if (!journalId) {
      setLoading(false);
      setFiles([]);
      return;
    }
    fetchFiles({ search: appliedSearchRef.current });
  }, [journalId, fetchFiles]);

  useEffect(() => {
    if (!feedback) {
      return;
    }
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const filteredFiles = useMemo(() => {
    if (stageFilter === "all") {
      return files;
    }
    return files.filter((file) => file.stage === stageFilter);
  }, [files, stageFilter]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = searchInput.trim();
    appliedSearchRef.current = trimmed;
    fetchFiles({ search: trimmed });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setStageFilter("all");
    appliedSearchRef.current = "";
    fetchFiles({ search: "" });
  };

  const handleRefresh = () => {
    fetchFiles({ silent: true });
  };

  const handleDownload = async (file: LibraryFile) => {
    if (!journalId) {
      setFeedback({ tone: "error", message: "Journal context not resolved." });
      return;
    }
    try {
      const response = await fetch(`/api/editor/library-files/${file.id}/download?journalId=${journalId}`);
      const data = await response.json();
      if (!response.ok || !data.ok || !data.url) {
        throw new Error(data.message || "Unable to generate download link.");
      }
      window.open(data.url, "_blank", "noopener");
    } catch (downloadError) {
      setFeedback({
        tone: "error",
        message: downloadError instanceof Error ? downloadError.message : "Failed to download library file.",
      });
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!journalId) {
      setFeedback({ tone: "error", message: "Journal context not resolved." });
      return;
    }
    const confirmed = window.confirm("Are you sure you want to permanently delete this library file?");
    if (!confirmed) {
      return;
    }

    setDeletingId(fileId);
    try {
      const response = await fetch(`/api/editor/library-files/${fileId}?journalId=${journalId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Failed to delete library file.");
      }
      setFeedback({ tone: "success", message: "Library file deleted." });
      fetchFiles({ silent: true });
    } catch (deleteError) {
      setFeedback({
        tone: "error",
        message: deleteError instanceof Error ? deleteError.message : "Failed to delete library file.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleUploadComplete = () => {
    setShowUploadModal(false);
    setFeedback({ tone: "success", message: "Library file uploaded successfully." });
    fetchFiles({ silent: true });
  };

  const handleEditComplete = () => {
    setEditingFile(null);
    setFeedback({ tone: "success", message: "Library file updated." });
    fetchFiles({ silent: true });
  };

  if (!journalId) {
    return (
      <div
        style={{
          border: "1px dashed #e5e5e5",
          borderRadius: "0.25rem",
          backgroundColor: "#fff",
          padding: "1.5rem",
          color: "rgba(0, 0, 0, 0.6)",
          fontSize: "0.9rem",
        }}
      >
        Unable to load library files because your account is not associated with a journal context.
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: "0.25rem",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end" }}>
            <form
              onSubmit={handleSearch}
              style={{ flex: "1 1 16rem", display: "flex", gap: "0.5rem" }}
            >
              <PkpInput
                type="search"
                placeholder="Search file name or description…"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <PkpButton type="submit" variant="onclick" style={{ whiteSpace: "nowrap" }}>
                Search
              </PkpButton>
            </form>
            <div style={{ width: "14rem" }}>
              <PkpSelect value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}>
                <option value="all">All Stages</option>
                {LIBRARY_FILE_STAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </PkpSelect>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}>
              <PkpButton variant="onclick" onClick={handleClearFilters} disabled={loading || reloading}>
                Clear Filters
              </PkpButton>
              <PkpButton variant="onclick" onClick={handleRefresh} loading={reloading}>
                Refresh
              </PkpButton>
              <PkpButton onClick={() => setShowUploadModal(true)}>Upload File</PkpButton>
            </div>
          </div>

          {(feedback || error) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {feedback && (
                <div
                  style={{
                    borderRadius: "0.25rem",
                    border: `1px solid ${feedback.tone === "error" ? "#f44336" : "#4caf50"}`,
                    backgroundColor: feedback.tone === "error" ? "rgba(244, 67, 54, 0.08)" : "rgba(76, 175, 80, 0.08)",
                    padding: "0.75rem 1rem",
                    color: feedback.tone === "error" ? "#b71c1c" : "#1b5e20",
                    fontSize: "0.875rem",
                  }}
                >
                  {feedback.message}
                </div>
              )}
              {error && (
                <div
                  style={{
                    borderRadius: "0.25rem",
                    border: "1px solid #f44336",
                    backgroundColor: "rgba(244, 67, 54, 0.08)",
                    padding: "0.75rem 1rem",
                    color: "#b71c1c",
                    fontSize: "0.875rem",
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          )}

          <div style={{ fontSize: "0.8125rem", color: "rgba(0, 0, 0, 0.54)" }}>
            Showing {filteredFiles.length} of {files.length} files
            {appliedSearchRef.current ? ` for “${appliedSearchRef.current}”` : ""}.
          </div>

          <div style={{ border: "1px solid #e5e5e5", borderRadius: "0.25rem", overflowX: "auto" }}>
            <PkpTable>
              <PkpTableHeader>
                <PkpTableRow isHeader>
                  <PkpTableHead style={{ minWidth: "16rem" }}>File</PkpTableHead>
                  <PkpTableHead style={{ width: "10rem" }}>Stage</PkpTableHead>
                  <PkpTableHead style={{ width: "10rem" }}>Size / Type</PkpTableHead>
                  <PkpTableHead style={{ width: "12rem" }}>Uploaded</PkpTableHead>
                  <PkpTableHead style={{ width: "12rem", textAlign: "center" }}>Actions</PkpTableHead>
                </PkpTableRow>
              </PkpTableHeader>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)" }}>
                      Loading library files…
                    </td>
                  </tr>
                ) : filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)" }}>
                      No library files found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((file) => (
                    <PkpTableRow key={file.id}>
                      <PkpTableCell>
                        <div style={{ fontWeight: 600, color: "#002C40" }}>{file.fileName}</div>
                        {file.description && (
                          <div style={{ fontSize: "0.8125rem", color: "rgba(0, 0, 0, 0.6)" }}>{file.description}</div>
                        )}
                        {file.remoteUrl && (
                          <div style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                            <span style={{ color: "rgba(0, 0, 0, 0.54)" }}>Remote:</span>{" "}
                            <a href={file.remoteUrl} target="_blank" rel="noreferrer" style={{ color: "#006798" }}>
                              {truncateUrl(file.remoteUrl)}
                            </a>
                          </div>
                        )}
                      </PkpTableCell>
                      <PkpTableCell style={{ width: "10rem" }}>
                        {getStageLabel(file.stage)}
                      </PkpTableCell>
                      <PkpTableCell style={{ width: "10rem" }}>
                        <div>{file.displaySize}</div>
                        <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)" }}>{file.fileType}</div>
                      </PkpTableCell>
                      <PkpTableCell style={{ width: "12rem" }}>
                        <div>{formatDate(file.createdAt)}</div>
                        <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)" }}>
                          Updated {formatDate(file.updatedAt)}
                        </div>
                      </PkpTableCell>
                      <PkpTableCell style={{ width: "12rem" }}>
                        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                          <PkpButton
                            variant="onclick"
                            size="sm"
                            onClick={() => handleDownload(file)}
                          >
                            Download
                          </PkpButton>
                          <PkpButton
                            variant="onclick"
                            size="sm"
                            onClick={() => setEditingFile(file)}
                          >
                            Edit
                          </PkpButton>
                          <PkpButton
                            variant="onclick"
                            size="sm"
                            onClick={() => handleDelete(file.id)}
                            disabled={deletingId === file.id}
                            loading={deletingId === file.id}
                          >
                            Delete
                          </PkpButton>
                        </div>
                      </PkpTableCell>
                    </PkpTableRow>
                  ))
                )}
              </tbody>
            </PkpTable>
          </div>
        </div>
      </div>

      <LibraryFileUploadModal
        isOpen={showUploadModal}
        journalId={journalId}
        onClose={() => setShowUploadModal(false)}
        onUploaded={handleUploadComplete}
      />

      <LibraryFileEditModal
        isOpen={Boolean(editingFile)}
        file={editingFile}
        journalId={journalId}
        onClose={() => setEditingFile(null)}
        onUpdated={handleEditComplete}
      />
    </>
  );
}

function getStageLabel(stage: string) {
  const match = LIBRARY_FILE_STAGE_OPTIONS.find((option) => option.value === stage);
  return match ? match.label : stage;
}

function truncateUrl(url: string) {
  if (url.length <= 48) {
    return url;
  }
  return `${url.slice(0, 32)}…${url.slice(-12)}`;
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}




