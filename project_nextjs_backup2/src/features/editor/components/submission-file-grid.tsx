"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { PkpButton } from "@/components/ui/pkp-button";
import { FormMessage } from "@/components/ui/form-message";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpSelect } from "@/components/ui/pkp-select";
import { PkpCheckbox } from "@/components/ui/pkp-checkbox";
import { useSupabase } from "@/providers/supabase-provider";
import { FileCopyModal } from "./file-copy/file-copy-modal";

import type { SubmissionFile, SubmissionStage } from "../types";

type Props = {
  submissionId: string;
  stage: SubmissionStage;
  files: SubmissionFile[];
  allFiles?: SubmissionFile[]; // All files from all stages (for copying)
};

const KIND_OPTIONS = [
  { value: "manuscript", label: "Manuscript" },
  { value: "review", label: "Review File" },
  { value: "copyedit", label: "Copyediting" },
  { value: "production", label: "Production" },
  { value: "supplemental", label: "Supplemental" },
];

export function SubmissionFileGrid({ submissionId, stage, files, allFiles }: Props) {
  const router = useRouter();
  const supabase = useSupabase();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [form, setForm] = useState({
    label: "",
    file: null as File | null,
    storagePath: "", // For manual entry (fallback)
    size: "",
    versionLabel: "",
    kind: "manuscript",
    round: "1",
    isVisibleToAuthors: false,
  });
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setForm((prev) => ({
      ...prev,
      file: selectedFile,
      size: selectedFile ? String(selectedFile.size) : "",
      label: selectedFile?.name ?? prev.label,
    }));
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id ?? null));
  }, [supabase]);

  const stageFiles = useMemo(() => files.filter((file) => file.stage === stage), [files, stage]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUserId) {
      setFeedback({ tone: "error", message: "User belum terautentikasi." });
      return;
    }
    if (!form.label.trim() || !form.storagePath.trim()) {
      setFeedback({ tone: "error", message: "Label dan storage path wajib diisi." });
      return;
    }
    startTransition(async () => {
      setFeedback(null);
      try {
        const res = await fetch(`/api/editor/submissions/${submissionId}/files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: form.label.trim(),
            storagePath: form.storagePath.trim(),
            stage,
            kind: form.kind,
            size: Number(form.size) || 0,
            versionLabel: form.versionLabel.trim() || null,
            round: Number(form.round) || 1,
            isVisibleToAuthors: form.isVisibleToAuthors,
            uploadedBy: currentUserId,
          }),
        });
        const json = await res.json();
        if (!json.ok) {
          setFeedback({ tone: "error", message: json.message ?? "Gagal menambahkan file." });
          return;
        }
        setForm({
          label: "",
          file: null,
          storagePath: "",
          size: "",
          versionLabel: "",
          kind: "manuscript",
          round: "1",
          isVisibleToAuthors: false,
        });
        setFeedback({ tone: "success", message: "File ditambahkan." });
        router.refresh();
      } catch {
        setFeedback({ tone: "error", message: "Kesalahan jaringan saat menambahkan file." });
      }
    });
  };

  const handleDelete = (fileId: string) => {
    setDeletingId(fileId);
    fetch(`/api/editor/submissions/${submissionId}/files`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.ok) {
          setFeedback({ tone: "error", message: json.message ?? "Tidak dapat menghapus file." });
          return;
        }
        setFeedback({ tone: "success", message: "File dihapus." });
        router.refresh();
      })
      .catch(() => {
        setFeedback({ tone: "error", message: "Kesalahan jaringan saat menghapus file." });
      })
      .finally(() => setDeletingId(null));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "100%",
        maxWidth: "100%",
      }}
    >
      {/* Action Buttons */}
      {allFiles && allFiles.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
          }}
        >
          <button
            type="button"
            onClick={() => setIsCopyModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "0.25rem",
              border: "1px solid #006798",
              backgroundColor: "transparent",
              color: "#006798",
              height: "2.25rem",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f8ff";
              e.currentTarget.style.borderColor = "#005a82";
              e.currentTarget.style.color = "#005a82";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "#006798";
              e.currentTarget.style.color = "#006798";
            }}
          >
            Copy Files from Other Stages
          </button>
        </div>
      )}

      {/* File Upload Form - OJS 3.3 Style */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "0.75rem",
          borderRadius: "0.25rem",
          border: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
          padding: "1rem",
          boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.05)",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#002C40",
          }}
        >
          Label
          <PkpInput
            type="text"
            value={form.label}
            onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
            required
            style={{ marginTop: "0.25rem" }}
          />
        </label>
        <label
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#002C40",
          }}
        >
          File
          <input
            type="file"
            onChange={handleFileChange}
            style={{
              width: "100%",
              marginTop: "0.25rem",
              height: "2.5rem",
              fontSize: "0.875rem",
            }}
          />
        </label>
        <label
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#002C40",
          }}
        >
          File size (bytes)
          <PkpInput
            type="number"
            value={form.size}
            onChange={(event) => setForm((prev) => ({ ...prev, size: event.target.value }))}
            readOnly
            style={{ marginTop: "0.25rem" }}
          />
        </label>
        <label
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#002C40",
          }}
        >
          Version label
          <PkpInput
            type="text"
            value={form.versionLabel}
            onChange={(event) => setForm((prev) => ({ ...prev, versionLabel: event.target.value }))}
            style={{ marginTop: "0.25rem" }}
          />
        </label>
        <label
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#002C40",
          }}
        >
          File kind
          <PkpSelect
            value={form.kind}
            onChange={(event) => setForm((prev) => ({ ...prev, kind: event.target.value }))}
            style={{ marginTop: "0.25rem" }}
          >
            {KIND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </PkpSelect>
        </label>
        <label
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#002C40",
          }}
        >
          Round
          <PkpInput
            type="text"
            value={form.round}
            onChange={(event) => setForm((prev) => ({ ...prev, round: event.target.value }))}
            style={{ marginTop: "0.25rem" }}
          />
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            color: "#002C40",
          }}
        >
          <PkpCheckbox
            checked={form.isVisibleToAuthors}
            onChange={(event) => setForm((prev) => ({ ...prev, isVisibleToAuthors: event.target.checked }))}
          />
          Visible to authors
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
          }}
        >
          <PkpButton
            type="submit"
            variant="primary"
            disabled={isPending}
            loading={isPending}
          >
            {isPending ? "Menambahkan..." : "Tambah File"}
          </PkpButton>
        </div>
      </form>

      {feedback && (
        <div style={{ marginTop: "0.5rem" }}>
          <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
        </div>
      )}

      {/* Files Table - OJS 3.3 Style with Modern Spacing */}
      <div
        style={{
          width: '100%',
          maxWidth: '100%',
          overflowX: 'auto',
          overflowY: 'visible',
          borderRadius: "0.25rem",
          border: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
        }}
      >
        {stageFiles.length === 0 ? (
          <div
            style={{
              padding: "1.5rem",
              textAlign: "center",
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.54)",
            }}
          >
            Belum ada file pada tahap ini.
          </div>
        ) : (
          <table
            className="pkpTable"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "rgba(0, 0, 0, 0.54)",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
                  Label
                </th>
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "rgba(0, 0, 0, 0.54)",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
                  Kind
                </th>
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "rgba(0, 0, 0, 0.54)",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
                  Round
                </th>
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "rgba(0, 0, 0, 0.54)",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
                  Size
                </th>
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "rgba(0, 0, 0, 0.54)",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
                  Uploaded
                </th>
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "right",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "rgba(0, 0, 0, 0.54)",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                />
              </tr>
            </thead>
            <tbody>
              {stageFiles.map((file, index) => (
                <tr
                  key={file.id}
                  style={{
                    borderTop: index > 0 ? "1px solid #e5e5e5" : "none",
                    backgroundColor: "transparent",
                  }}
                >
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      fontSize: "0.875rem",
                      color: "#002C40",
                    }}
                  >
                    <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>{file.label}</div>
                    {file.versionLabel && (
                      <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginBottom: "0.25rem" }}>
                        Version: {file.versionLabel}
                      </div>
                    )}
                    <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", wordBreak: "break-all" }}>
                      {file.storagePath}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.84)",
                      textTransform: "capitalize",
                    }}
                  >
                    {file.kind}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.84)",
                    }}
                  >
                    {file.round}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.54)",
                    }}
                  >
                    {formatSize(file.size)}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.54)",
                    }}
                  >
                    {formatDate(file.uploadedAt)}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "right",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: "0.5rem",
                      }}
                    >
                      {/* Download Button */}
                      <a
                        href={`/api/editor/submissions/${submissionId}/files/${file.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "0.25rem",
                          border: "1px solid #e5e5e5",
                          backgroundColor: "transparent",
                          color: "#006798",
                          height: "2rem",
                          paddingLeft: "0.75rem",
                          paddingRight: "0.75rem",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          textDecoration: "none",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f8f9fa";
                          e.currentTarget.style.borderColor = "#d0d0d0";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.borderColor = "#e5e5e5";
                        }}
                      >
                        Download
                      </a>
                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(file.id)}
                        disabled={deletingId === file.id}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "0.25rem",
                          border: "1px solid #e5e5e5",
                          backgroundColor: "transparent",
                          color: deletingId === file.id ? "rgba(0, 0, 0, 0.54)" : "#006798",
                          height: "2rem",
                          paddingLeft: "0.75rem",
                          paddingRight: "0.75rem",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          cursor: deletingId === file.id ? "not-allowed" : "pointer",
                          transition: "all 0.2s ease",
                          opacity: deletingId === file.id ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!deletingId) {
                            e.currentTarget.style.backgroundColor = "#f8f9fa";
                            e.currentTarget.style.borderColor = "#d0d0d0";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!deletingId) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.borderColor = "#e5e5e5";
                          }
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* File Copy Modal */}
      {isCopyModalOpen && allFiles && (
        <FileCopyModal
          open={isCopyModalOpen}
          onClose={() => setIsCopyModalOpen(false)}
          submissionId={submissionId}
          targetStage={stage}
          availableFiles={allFiles}
          onFileCopied={() => {
            setIsCopyModalOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatSize(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let idx = 0;
  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024;
    idx += 1;
  }
  return `${size.toFixed(1)} ${units[idx]}`;
}

