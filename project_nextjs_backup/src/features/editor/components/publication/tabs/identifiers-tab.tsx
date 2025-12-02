"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SubmissionDetail, SubmissionVersion } from "../../../types";
import { FormMessage } from "@/components/ui/form-message";

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  version?: SubmissionVersion;
  isPublished: boolean;
};

type IdentifierState = {
  doi: string;
  isbn: string;
  issn: string;
};

function extractIdentifiers(source?: Record<string, unknown>): IdentifierState {
  if (!source) {
    return { doi: "", isbn: "", issn: "" };
  }
  const identifiersRaw = (source as { identifiers?: Record<string, unknown> }).identifiers;
  if (!identifiersRaw) {
    return { doi: "", isbn: "", issn: "" };
  }
  return {
    doi: typeof identifiersRaw.doi === "string" ? identifiersRaw.doi : "",
    isbn: typeof identifiersRaw.isbn === "string" ? identifiersRaw.isbn : "",
    issn: typeof identifiersRaw.issn === "string" ? identifiersRaw.issn : "",
  };
}

export function IdentifiersTab({ submissionId, detail, version, isPublished }: Props) {
  const router = useRouter();
  const initialIdentifiers = useMemo(() => {
    if (version) {
      const versionIdentifiers = extractIdentifiers(version.metadata);
      if (versionIdentifiers.doi || versionIdentifiers.isbn || versionIdentifiers.issn) {
        return versionIdentifiers;
      }
    }
    return extractIdentifiers(detail.metadata);
  }, [detail.metadata, version]);

  const [doi, setDoi] = useState<string>(initialIdentifiers.doi);
  const [isbn, setIsbn] = useState<string>(initialIdentifiers.isbn);
  const [issn, setIssn] = useState<string>(initialIdentifiers.issn);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setDoi(initialIdentifiers.doi);
    setIsbn(initialIdentifiers.isbn);
    setIssn(initialIdentifiers.issn);
  }, [initialIdentifiers]);

  if (!version) {
    return (
      <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-sm text-[var(--muted)]">
        Belum ada versi publikasi yang dapat diedit. Silakan buat versi baru terlebih dahulu.
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/editor/submissions/${submissionId}/publications/${version.id}/metadata`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifiers: {
            doi: doi.trim() || "",
            isbn: isbn.trim() || "",
            issn: issn.trim() || "",
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "Gagal menyimpan identifier publikasi.");
      }
      setFeedback({ tone: "success", message: "Identifier publikasi berhasil diperbarui." });
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan identifier.",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
        Identifiers
      </h2>

      {feedback && <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>}

      <form
        onSubmit={handleSave}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
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
            marginBottom: "0.5rem",
          }}
        >
          Manage identifiers such as DOI, ISBN, ISSN for this publication.
        </p>

        {/* DOI */}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            DOI (Digital Object Identifier)
          </span>
          <input
            type="text"
            value={doi}
            onChange={(e) => setDoi(e.target.value)}
            placeholder="10.1234/example"
            disabled={isPublished}
            style={{
              height: "2.75rem",
              padding: "0 0.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "text",
            }}
          />
          <span
            style={{
              fontSize: "0.75rem",
              color: "rgba(0, 0, 0, 0.54)",
            }}
          >
            Enter the DOI for this publication (e.g., 10.1234/example)
          </span>
        </label>

        {/* ISBN */}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            ISBN (International Standard Book Number)
          </span>
          <input
            type="text"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder="978-0-123456-78-9"
            disabled={isPublished}
            style={{
              height: "2.75rem",
              padding: "0 0.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "text",
            }}
          />
        </label>

        {/* ISSN */}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            ISSN (International Standard Serial Number)
          </span>
          <input
            type="text"
            value={issn}
            onChange={(e) => setIssn(e.target.value)}
            placeholder="1234-5678"
            disabled={isPublished}
            style={{
              height: "2.75rem",
              padding: "0 0.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "text",
            }}
          />
        </label>

        {/* Save Button */}
        {!isPublished && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "0.5rem",
            }}
          >
            <button
              type="submit"
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
              {isSaving ? "Saving..." : "Save Identifiers"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

