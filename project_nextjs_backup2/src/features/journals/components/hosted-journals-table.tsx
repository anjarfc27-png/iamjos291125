"use client";

import { Globe2, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";

// import { deleteJournalAction } from "@/app/(admin)/admin/site-management/hosted-journals/actions";
import type { HostedJournal } from "@/features/journals/types";
import { JournalEditForm } from "@/features/journals/components/journal-edit-form";
// import { JournalSettingsWizard } from "@/features/journals/components/journal-settings-wizard";
import { JournalUsersPanel } from "@/features/journals/components/journal-users-panel";

type ModalState =
  | { type: "edit"; journal?: HostedJournal; mode: "create" | "edit" }
  | { type: "settings"; journal: HostedJournal }
  | { type: "users"; journal: HostedJournal }
  | null;

type Props = {
  journals: HostedJournal[];
};

export function HostedJournalsTable({ journals }: Props) {
  const router = useRouter();
  const [modalState, setModalState] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<HostedJournal | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const closeAll = () => {
    setModalState(null);
    setDeleteTarget(null);
    setFeedback(null);
  };

  const handleSuccess = (message: string) => {
    setFeedback({ tone: "success", message });
    setModalState(null);
    router.refresh();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startDelete(async () => {
      // const result = await deleteJournalAction(deleteTarget.id);
      const result = { success: true, message: "Deleted (mock)" }; // Mock for debugging
      if (!result.success) {
        // setFeedback({ tone: "error", message: result.message ?? "Gagal menghapus jurnal." });
        return;
      }
      setFeedback({ tone: "success", message: "Jurnal berhasil dihapus." });
      setDeleteTarget(null);
      router.refresh();
    });
  };

  const renderOverlay = (content: ReactNode) =>
    typeof document !== "undefined"
      ? createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={closeAll}
        >
          <div
            style={{
              width: "100%",
              maxWidth: modalState?.type === "settings" ? "70rem" : modalState?.type === "edit" ? "64rem" : "48rem",
              maxHeight: "95vh",
              backgroundColor: "#fff",
              borderRadius: "4px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {content}
          </div>
        </div>,
        document.body,
      )
      : null;

  return (
    <div style={{ border: "1px solid #cfd4da", backgroundColor: "#fff" }}>
      <div
        style={{
          padding: "0.75rem 1rem",
          borderBottom: "1px solid #cfd4da",
          backgroundColor: "#f1f3f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontWeight: 600, color: "#002C40" }}>Hosted Journals</span>
        <button
          type="button"
          onClick={() => setModalState({ type: "edit", mode: "create" })}
          style={{
            backgroundColor: "#006798",
            color: "#fff",
            border: "none",
            borderRadius: "3px",
            padding: "0.4rem 0.9rem",
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          Create Journal
        </button>
      </div>

      {feedback && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderBottom: "1px solid #cfd4da",
            fontSize: "0.875rem",
            color: feedback.tone === "success" ? "#0f5132" : "#842029",
            backgroundColor: feedback.tone === "success" ? "#d1e7dd" : "#f8d7da",
          }}
        >
          {feedback.message}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.9rem",
            color: "#1f2937",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f9fafb", color: "#4b5563", textTransform: "uppercase", fontSize: "0.75rem" }}>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", width: "3rem" }}>No.</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Journal</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", width: "180px" }}>Path</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", width: "160px" }}>Visibility</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", width: "260px" }}>Options</th>
            </tr>
          </thead>
          <tbody>
            {journals.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
                  Belum ada jurnal terdaftar. Gunakan tombol “Create Journal”.
                </td>
              </tr>
            ) : (
              journals.map((journal, index) => (
                <tr key={journal.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>{index + 1}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div style={{ fontWeight: 600 }}>{journal.name || "(No title)"}</div>
                    {journal.description && (
                      <p style={{ margin: "0.35rem 0 0", color: "#6b7280", fontSize: "0.8125rem" }}>{journal.description}</p>
                    )}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#111827" }}>{journal.path || "—"}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        borderRadius: "999px",
                        padding: "0.15rem 0.65rem",
                        backgroundColor: "#e5f0fb",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#0369a1",
                        textTransform: "uppercase",
                      }}
                    >
                      {journal.isPublic ? (
                        <>
                          <Globe2 size={13} /> Public
                        </>
                      ) : (
                        <>
                          <Lock size={13} /> Private
                        </>
                      )}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      <button
                        type="button"
                        onClick={() => setModalState({ type: "edit", journal, mode: "edit" })}
                        style={actionButtonStyle()}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalState({ type: "users", journal })}
                        style={actionButtonStyle()}
                      >
                        Users
                      </button>
                      <Link href={`/admin/journals/${journal.id}/settings/wizard`} style={actionButtonStyle(true)}>
                        Settings Wizard
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(journal)}
                        style={{ ...actionButtonStyle(), color: "#b91c1c" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit & Create Modal */}
      {modalState?.type === "edit" &&
        renderOverlay(
          <>
            <HeaderBar
              title={modalState.mode === "create" ? "Create Journal" : "Edit Journal"}
              description={
                modalState.mode === "create"
                  ? null
                  : "Perbarui informasi dasar jurnal."
              }
              onClose={closeAll}
            />
            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
              <JournalEditForm
                journal={modalState.journal}
                mode={modalState.mode}
                onCancel={closeAll}
                onSuccess={() =>
                  handleSuccess(
                    modalState.mode === "create"
                      ? "Jurnal baru berhasil dibuat."
                      : "Perubahan jurnal berhasil disimpan.",
                  )
                }
              />
            </div>
          </>,
        )}

      {/* Settings Wizard Modal */}
      {modalState?.type === "settings" &&
        modalState.journal &&
        renderOverlay(
          <>
            <HeaderBar title="Settings Wizard" description={modalState.journal.name} onClose={closeAll} />
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
              <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
                {/* <JournalSettingsWizard
                journalId={modalState.journal.id}
                initialData={{
                  id: modalState.journal.id,
                  name: modalState.journal.name,
                  path: modalState.journal.path,
                  description: modalState.journal.description,
                  settings: [],
                }}
              /> */}
              </div>
            </div>
          </>,
        )}

      {/* Users Modal */}
      {modalState?.type === "users" &&
        modalState.journal &&
        renderOverlay(
          <>
            <HeaderBar title="Journal Users" description={modalState.journal.name} onClose={closeAll} />
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
              <JournalUsersPanel journal={modalState.journal} />
            </div>
          </>,
        )}

      {/* Delete Confirmation */}
      {deleteTarget &&
        renderOverlay(
          <>
            <HeaderBar
              title="Hapus Jurnal"
              description="Tindakan ini akan menghapus semua konten jurnal."
              onClose={closeAll}
            />
            <div style={{ padding: "1.5rem", flex: 1 }}>
              <p style={{ fontSize: "0.95rem", color: "#1f2937" }}>
                Apakah Anda yakin ingin menghapus jurnal <strong>{deleteTarget.name}</strong>?
              </p>
            </div>
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                padding: "1rem 1.5rem",
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
              }}
            >
              <button type="button" onClick={closeAll} style={actionButtonStyle(true)}>
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                style={{ ...actionButtonStyle(), backgroundColor: "#b91c1c", color: "#fff" }}
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </>,
        )}
    </div>
  );
}

function actionButtonStyle(outlined = false): React.CSSProperties {
  return outlined
    ? {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0.35rem 0.75rem",
      borderRadius: "3px",
      border: "1px solid #d1d5db",
      color: "#006798",
      textDecoration: "none",
      fontSize: "0.8rem",
      fontWeight: 600,
      backgroundColor: "#fff",
      cursor: "pointer",
    }
    : {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0.35rem 0.75rem",
      borderRadius: "3px",
      border: "1px solid transparent",
      backgroundColor: "#f5f6f7",
      color: "#006798",
      textDecoration: "none",
      fontSize: "0.8rem",
      fontWeight: 600,
      cursor: "pointer",
    };
}

type HeaderProps = {
  title: string;
  description?: string | null;
  onClose: () => void;
};

function HeaderBar({ title, description, onClose }: HeaderProps) {
  return (
    <div
      style={{
        borderBottom: "1px solid #e5e7eb",
        padding: "1.25rem 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "1rem",
      }}
    >
      <div>
        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#002C40" }}>{title}</h3>
        {description && (
          <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem", color: "#6b7280" }}>{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        style={{
          backgroundColor: "transparent",
          border: "none",
          fontSize: "1.5rem",
          color: "#6b7280",
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}
