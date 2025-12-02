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

export function MetadataTab({ submissionId, detail, version, isPublished }: Props) {
  const router = useRouter();
  const versionMeta = (version?.metadata as Record<string, unknown> | undefined) ?? {};
  const fallbackMeta = detail.metadata as Record<string, unknown>;
  const initialKeywords = Array.isArray(versionMeta.keywords)
    ? (versionMeta.keywords as string[])
    : Array.isArray(fallbackMeta.keywords)
    ? (fallbackMeta.keywords as string[])
    : [];
  const initialCategories = Array.isArray(versionMeta.categories)
    ? (versionMeta.categories as string[])
    : Array.isArray(fallbackMeta.categories)
    ? (fallbackMeta.categories as string[])
    : [];

  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [keywordInput, setKeywordInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    setKeywords([...keywords, keywordInput.trim()]);
    setKeywordInput("");
  };

  const handleAddCategory = () => {
    if (!categoryInput.trim()) return;
    setCategories([...categories, categoryInput.trim()]);
    setCategoryInput("");
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
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
          body: JSON.stringify({
            keywords,
            categories,
          }),
        },
      );
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "Gagal menyimpan metadata tambahan.");
      }
      setFeedback({ tone: "success", message: "Metadata berhasil disimpan." });
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
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-[#002C40]">Metadata</h2>

      <div className="rounded border border-[var(--border)] bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm text-[rgba(0,0,0,0.84)]">
          Additional metadata for this publication.
        </p>

        {/* Keywords */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-[var(--foreground)]">Keywords</label>
          {!isPublished && (
            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                className="flex-1 rounded border border-[var(--border)] px-3 py-2 text-sm"
                placeholder="Tambahkan keyword"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                disabled={!keywordInput.trim()}
                className="rounded bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white disabled:bg-[var(--border)] disabled:text-[var(--muted)]"
              >
                Add
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {keywords.length === 0 ? (
              <span className="text-sm text-[var(--muted)]">No keywords</span>
            ) : (
              keywords.map((keyword, index) => (
                <span
                  key={`${keyword}-${index}`}
                  className="inline-flex items-center rounded-full bg-[#f0f7fa] px-3 py-1 text-xs font-semibold text-[#006798]"
                >
                  {keyword}
                  {!isPublished && (
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(index)}
                      className="ml-2 text-[#d32f2f]"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-[var(--foreground)]">Categories</label>
          {!isPublished && (
            <div className="flex gap-2">
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="flex-1 rounded border border-[var(--border)] px-3 py-2 text-sm"
                placeholder="Tambahkan category"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!categoryInput.trim()}
                className="rounded bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white disabled:bg-[var(--border)] disabled:text-[var(--muted)]"
              >
                Add
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {categories.length === 0 ? (
              <span className="text-sm text-[var(--muted)]">No categories</span>
            ) : (
              categories.map((category, index) => (
                <span
                  key={`${category}-${index}`}
                  className="inline-flex items-center rounded-full bg-[#f0f7fa] px-3 py-1 text-xs font-semibold text-[#006798]"
                >
                  {category}
                  {!isPublished && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(index)}
                      className="ml-2 text-[#d32f2f]"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {!isPublished && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:bg-[var(--border)] disabled:text-[var(--muted)]"
          >
            {isSaving ? "Saving..." : "Save Metadata"}
          </button>
        </div>
      )}
    </div>
  );
}



