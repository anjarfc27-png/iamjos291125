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

type PublicationMetadata = {
  title?: string;
  prefix?: string;
  subtitle?: string;
  abstract?: string;
};

export function TitleAbstractTab({ submissionId, detail, version, isPublished }: Props) {
  const router = useRouter();
  const initialMeta = (version?.metadata as PublicationMetadata | undefined) ?? {};

  const [title, setTitle] = useState(initialMeta.title ?? detail.summary.title ?? "");
  const [abstract, setAbstract] = useState(initialMeta.abstract ?? "");
  const [prefix, setPrefix] = useState(initialMeta.prefix ?? "");
  const [subtitle, setSubtitle] = useState(initialMeta.subtitle ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          body: JSON.stringify({
            title: title.trim(),
            prefix: prefix.trim() || null,
            subtitle: subtitle.trim() || null,
            abstract: abstract.trim() || null,
          }),
        },
      );

      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "Gagal menyimpan metadata publikasi.");
      }
      setFeedback({ tone: "success", message: "Metadata publikasi berhasil disimpan." });
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Gagal menyimpan metadata.",
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
        Title & Abstract
      </h2>

      {feedback && <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Prefix */}
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
            Prefix
          </span>
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            disabled={isPublished}
            style={{
              height: "2.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              padding: "0 0.75rem",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "text",
            }}
          />
        </label>

        {/* Title */}
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
            Title <span style={{ color: "#dc3545" }}>*</span>
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPublished}
            required
            style={{
              height: "2.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              padding: "0 0.75rem",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "text",
            }}
          />
        </label>

        {/* Subtitle */}
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
            Subtitle
          </span>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            disabled={isPublished}
            style={{
              height: "2.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              padding: "0 0.75rem",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "text",
            }}
          />
        </label>

        {/* Abstract */}
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
            Abstract
          </span>
          <textarea
            rows={10}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            disabled={isPublished}
            style={{
              width: "100%",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              padding: "0.5rem 0.75rem",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              resize: "vertical",
              cursor: isPublished ? "not-allowed" : "text",
            }}
          />
        </label>

        {!isPublished && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            <button
              type="submit"
              disabled={isSaving}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.25rem",
                border: "1px solid #006798",
                backgroundColor: "#006798",
                color: "#ffffff",
                height: "2rem",
                paddingLeft: "0.75rem",
                paddingRight: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: isSaving ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = "#005a82";
                  e.currentTarget.style.borderColor = "#005a82";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = "#006798";
                  e.currentTarget.style.borderColor = "#006798";
                }
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}



