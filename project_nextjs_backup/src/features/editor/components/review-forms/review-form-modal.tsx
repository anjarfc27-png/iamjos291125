"use client";

import { useEffect, useState } from "react";
import { FormMessage } from "@/components/ui/form-message";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpCheckbox } from "@/components/ui/pkp-checkbox";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpModal } from "@/components/ui/pkp-modal";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import type { ReviewForm } from "@/features/editor/types";

type ReviewFormModalProps = {
  isOpen: boolean;
  journalId: string | null;
  form?: ReviewForm | null;
  onClose: () => void;
  onCompleted: () => void;
};

export function ReviewFormModal({ isOpen, journalId, form, onClose, onCompleted }: ReviewFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(form);

  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description ?? "");
      setIsActive(form.isActive);
      setQuestions(form.questions != null ? String(form.questions) : "");
    } else {
      resetForm();
    }
    setError(null);
    setIsSubmitting(false);
  }, [form, isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setIsActive(true);
    setQuestions("");
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    if (!form) {
      resetForm();
    }
    onClose();
  };

  const handleSubmit = async () => {
    if (!journalId) {
      setError("Journal context is missing.");
      return;
    }
    if (!title.trim()) {
      setError("Form title is required.");
      return;
    }

    const parsedQuestions = questions.trim() ? Number(questions) : null;
    if (parsedQuestions != null && (Number.isNaN(parsedQuestions) || parsedQuestions < 0)) {
      setError("Questions value must be a positive number.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      if (isEditMode && form) {
        const response = await fetch(`/api/editor/review-forms/${form.id}?journalId=${journalId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || "",
            isActive,
            questions: parsedQuestions ?? 0,
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.ok) {
          throw new Error(data.message || "Failed to update review form.");
        }
      } else {
        const response = await fetch(`/api/editor/review-forms?journalId=${journalId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            journalId,
            title: title.trim(),
            description: description.trim() || "",
            isActive,
            questions: parsedQuestions ?? 0,
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.ok) {
          throw new Error(data.message || "Failed to create review form.");
        }
      }

      if (!form) {
        resetForm();
      }
      onCompleted();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save review form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PkpModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Edit Review Form" : "Create Review Form"}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label
            htmlFor="reviewFormTitle"
            style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.3rem" }}
          >
            Title *
          </label>
          <PkpInput
            id="reviewFormTitle"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g., Default Reviewer Checklist"
          />
        </div>

        <div>
          <label
            htmlFor="reviewFormDescription"
            style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.3rem" }}
          >
            Description
          </label>
          <PkpTextarea
            id="reviewFormDescription"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe when this form should be used…"
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 10rem" }}>
            <label
              htmlFor="reviewFormQuestions"
              style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.3rem" }}
            >
              Questions
            </label>
            <PkpInput
              id="reviewFormQuestions"
              type="number"
              min={0}
              value={questions}
              onChange={(event) => setQuestions(event.target.value)}
            />
            <p style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginTop: "0.2rem" }}>
              Approximate count of questions or elements in this form.
            </p>
          </div>
          <div style={{ flex: "1 1 10rem", display: "flex", alignItems: "center", marginTop: "0.75rem" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <PkpCheckbox checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
              <span style={{ fontSize: "0.875rem", color: "#002C40" }}>Active</span>
            </label>
          </div>
        </div>

        {error && <FormMessage tone="error">{error}</FormMessage>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <PkpButton variant="onclick" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </PkpButton>
          <PkpButton onClick={handleSubmit} loading={isSubmitting} disabled={isSubmitting}>
            {isEditMode ? "Save Changes" : "Create Form"}
          </PkpButton>
        </div>
      </div>
    </PkpModal>
  );
}


