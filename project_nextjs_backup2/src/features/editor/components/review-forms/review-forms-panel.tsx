"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpInput } from "@/components/ui/pkp-input";
import {
  PkpTable,
  PkpTableCell,
  PkpTableHead,
  PkpTableHeader,
  PkpTableRow,
} from "@/components/ui/pkp-table";
import { useAuth } from "@/contexts/AuthContext";
import type { ReviewForm } from "@/features/editor/types";
import { ReviewFormModal } from "./review-form-modal";

type Feedback = { tone: "success" | "error"; message: string } | null;

export function ReviewFormsPanel() {
  const { user } = useAuth();
  const journalId = useMemo(() => user?.roles.find((role) => role.context_id)?.context_id ?? null, [user]);

  const [forms, setForms] = useState<ReviewForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState<ReviewForm | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchForms = useCallback(async () => {
    if (!journalId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/editor/review-forms?journalId=${journalId}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Failed to load review forms.");
      }
      setForms(data.forms);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load review forms.");
    } finally {
      setLoading(false);
    }
  }, [journalId]);

  useEffect(() => {
    if (!journalId) {
      setLoading(false);
      setForms([]);
      return;
    }
    fetchForms();
  }, [journalId, fetchForms]);

  useEffect(() => {
    if (!feedback) {
      return;
    }
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const filteredForms = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return forms;
    }
    return forms.filter((form) => form.title.toLowerCase().includes(keyword) || (form.description ?? "").toLowerCase().includes(keyword));
  }, [forms, searchTerm]);

  const openCreateModal = () => {
    setModalForm(null);
    setModalOpen(true);
  };

  const openEditModal = (form: ReviewForm) => {
    setModalForm(form);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleModalCompleted = () => {
    const wasEdit = Boolean(modalForm);
    setModalOpen(false);
    setModalForm(null);
    setFeedback({ tone: "success", message: wasEdit ? "Review form updated." : "Review form created." });
    fetchForms();
  };

  const handleDelete = async (form: ReviewForm) => {
    if (!journalId) {
      setFeedback({ tone: "error", message: "Journal context not resolved." });
      return;
    }
    if (!window.confirm(`Delete review form “${form.title}”? This action cannot be undone.`)) {
      return;
    }
    setProcessingId(form.id);
    try {
      const response = await fetch(`/api/editor/review-forms/${form.id}?journalId=${journalId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Failed to delete review form.");
      }
      setFeedback({ tone: "success", message: "Review form deleted." });
      fetchForms();
    } catch (deleteError) {
      setFeedback({
        tone: "error",
        message: deleteError instanceof Error ? deleteError.message : "Failed to delete review form.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleActive = async (form: ReviewForm) => {
    if (!journalId) {
      setFeedback({ tone: "error", message: "Journal context not resolved." });
      return;
    }
    setProcessingId(form.id);
    try {
      const response = await fetch(`/api/editor/review-forms/${form.id}?journalId=${journalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !form.isActive }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Failed to update review form.");
      }
      setFeedback({ tone: "success", message: form.isActive ? "Form deactivated." : "Form activated." });
      fetchForms();
    } catch (updateError) {
      setFeedback({
        tone: "error",
        message: updateError instanceof Error ? updateError.message : "Failed to update review form.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (!journalId) {
    return (
      <div
        style={{
          border: "1px dashed #e5e5e5",
          borderRadius: "0.25rem",
          padding: "1.5rem",
          backgroundColor: "#fff",
          color: "rgba(0, 0, 0, 0.6)",
        }}
      >
        Unable to load review forms because your account is not linked to a journal context.
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
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
              }}
              style={{ flex: "1 1 16rem", display: "flex", gap: "0.5rem" }}
            >
              <PkpInput
                type="search"
                placeholder="Search by title or description…"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <PkpButton variant="onclick" onClick={() => setSearchTerm("")}>
                Clear
              </PkpButton>
            </form>
            <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}>
              <PkpButton variant="onclick" onClick={fetchForms} disabled={loading}>
                Refresh
              </PkpButton>
              <PkpButton onClick={openCreateModal}>
                Add Review Form
              </PkpButton>
            </div>
          </div>

          {(feedback || error) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
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

          <div style={{ border: "1px solid #e5e5e5", borderRadius: "0.25rem", overflowX: "auto" }}>
            <PkpTable>
              <PkpTableHeader>
                <PkpTableRow isHeader>
                  <PkpTableHead style={{ minWidth: "18rem" }}>Review Form</PkpTableHead>
                  <PkpTableHead style={{ width: "8rem" }}>Active</PkpTableHead>
                  <PkpTableHead style={{ width: "8rem" }}>Questions</PkpTableHead>
                  <PkpTableHead style={{ width: "12rem" }}>Updated</PkpTableHead>
                  <PkpTableHead style={{ width: "14rem", textAlign: "center" }}>Actions</PkpTableHead>
                </PkpTableRow>
              </PkpTableHeader>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)" }}>
                      Loading review forms…
                    </td>
                  </tr>
                ) : filteredForms.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)" }}>
                      No review forms found.
                    </td>
                  </tr>
                ) : (
                  filteredForms.map((form) => (
                    <PkpTableRow key={form.id}>
                      <PkpTableCell>
                        <div style={{ fontWeight: 600, color: "#002C40" }}>{form.title}</div>
                        {form.description && (
                          <div style={{ fontSize: "0.8125rem", color: "rgba(0, 0, 0, 0.6)" }}>{form.description}</div>
                        )}
                      </PkpTableCell>
                      <PkpTableCell style={{ width: "8rem" }}>
                        {form.isActive ? (
                          <span style={{ color: "#2e7d32", fontWeight: 600 }}>Active</span>
                        ) : (
                          <span style={{ color: "rgba(0, 0, 0, 0.54)" }}>Inactive</span>
                        )}
                      </PkpTableCell>
                      <PkpTableCell style={{ width: "8rem" }}>
                        {form.questions != null ? form.questions : "—"}
                      </PkpTableCell>
                      <PkpTableCell style={{ width: "12rem" }}>
                        {formatDate(form.updatedAt)}
                      </PkpTableCell>
                      <PkpTableCell style={{ width: "14rem" }}>
                        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                          <PkpButton
                            variant="onclick"
                            size="sm"
                            onClick={() => openEditModal(form)}
                          >
                            Edit
                          </PkpButton>
                          <PkpButton
                            variant="onclick"
                            size="sm"
                            onClick={() => handleToggleActive(form)}
                            disabled={processingId === form.id}
                          >
                            {form.isActive ? "Deactivate" : "Activate"}
                          </PkpButton>
                          <PkpButton
                            variant="onclick"
                            size="sm"
                            onClick={() => handleDelete(form)}
                            disabled={processingId === form.id}
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

      <ReviewFormModal
        isOpen={modalOpen}
        journalId={journalId}
        form={modalForm}
        onClose={closeModal}
        onCompleted={handleModalCompleted}
      />
    </>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}




