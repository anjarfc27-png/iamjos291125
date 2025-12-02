"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { SubmissionDetail, SubmissionVersion } from "../../../types";
import { FormMessage } from "@/components/ui/form-message";

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  version?: SubmissionVersion;
  isPublished: boolean;
};

export function CitationsTab({ submissionId, detail, version, isPublished }: Props) {
  const router = useRouter();
  const versionMeta = (version?.metadata as Record<string, unknown> | undefined) ?? {};
  const fallbackMeta = detail.metadata as Record<string, unknown>;
  const citations = Array.isArray(versionMeta.citations)
    ? (versionMeta.citations as string[])
    : Array.isArray(fallbackMeta.citations)
    ? (fallbackMeta.citations as string[])
    : [];

  const [citationList, setCitationList] = useState<string[]>(citations);
  const [newCitation, setNewCitation] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const handleAddCitation = () => {
    if (newCitation.trim()) {
      setCitationList([...citationList, newCitation.trim()]);
      setNewCitation("");
    }
  };

  const handleRemoveCitation = (index: number) => {
    setCitationList(citationList.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!version) {
      setFeedback({ tone: "error", message: "Belum ada versi publikasi untuk diperbarui." });
      return;
    }
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(
        `/api/editor/submissions/${submissionId}/publications/${version.id}/metadata`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ citations: citationList }),
        },
      );
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "Gagal menyimpan citations.");
      }
      setFeedback({ tone: "success", message: "Citations berhasil disimpan." });
      router.refresh();
    } catch (error) {
      console.error("Error saving citations:", error);
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Gagal menyimpan citations.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!version) {
    return (
      <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-sm text-[var(--muted)]">
        Belum ada versi publikasi yang dapat diedit. Silakan buat versi baru terlebih dahulu.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <h2
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "#002C40",
          marginBottom: "0.5rem",
        }}
      >
        Citations
      </h2>

      {feedback && <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>}

      <div
        style={{
          borderRadius: "0.25rem",
          border: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
          padding: "1.5rem",
        }}
      >
        <p
          style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.84)",
            marginBottom: "1.5rem",
          }}
        >
          Manage references and citations for this publication. Citations can be entered in any format (e.g., APA, MLA, Chicago).
        </p>

        {/* Add Citation Form */}
        {!isPublished && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginBottom: "1.5rem",
              padding: "1rem",
              backgroundColor: "#f8f9fa",
              borderRadius: "0.25rem",
            }}
          >
            <label
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#002C40",
              }}
            >
              Add Citation
            </label>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
              }}
            >
              <textarea
                value={newCitation}
                onChange={(e) => setNewCitation(e.target.value)}
                placeholder="Enter citation (e.g., Author, A. (2024). Title. Journal, 1(1), 1-10.)"
                style={{
                  flex: 1,
                  minHeight: "4rem",
                  padding: "0.75rem",
                  borderRadius: "0.25rem",
                  border: "1px solid #e5e5e5",
                  backgroundColor: "#ffffff",
                  fontSize: "0.875rem",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                onClick={handleAddCitation}
                disabled={!newCitation.trim()}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.25rem",
                  border: "none",
                  backgroundColor: newCitation.trim() ? "#006798" : "#e5e5e5",
                  color: newCitation.trim() ? "#ffffff" : "rgba(0, 0, 0, 0.54)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: newCitation.trim() ? "pointer" : "not-allowed",
                  alignSelf: "flex-start",
                }}
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Citations List */}
        {citationList.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.54)",
              backgroundColor: "#f8f9fa",
              borderRadius: "0.25rem",
            }}
          >
            No citations added yet.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {citationList.map((citation, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  padding: "1rem",
                  borderRadius: "0.25rem",
                  border: "1px solid #e5e5e5",
                  backgroundColor: "#ffffff",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontSize: "0.875rem",
                    color: "rgba(0, 0, 0, 0.84)",
                    lineHeight: "1.5",
                  }}
                >
                  {citation}
                </span>
                {!isPublished && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCitation(index)}
                    style={{
                      padding: "0.5rem",
                      borderRadius: "0.25rem",
                      border: "1px solid #e5e5e5",
                      backgroundColor: "transparent",
                      color: "#d32f2f",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Save Button */}
        {!isPublished && citationList.length > 0 && (
          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "0.25rem",
                border: "none",
                backgroundColor: isSaving ? "#e5e5e5" : "#006798",
                color: isSaving ? "rgba(0, 0, 0, 0.54)" : "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: isSaving ? "not-allowed" : "pointer",
              }}
            >
              {isSaving ? "Saving..." : "Save Citations"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

