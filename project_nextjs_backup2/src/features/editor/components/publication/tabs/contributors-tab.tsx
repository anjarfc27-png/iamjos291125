"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { SubmissionDetail, SubmissionVersion } from "../../../types";
import { FormMessage } from "@/components/ui/form-message";
import { PkpTable, PkpTableCell, PkpTableHead, PkpTableHeader, PkpTableRow } from "@/components/ui/pkp-table";

type Contributor = {
  givenName: string;
  familyName: string;
  email: string;
  affiliation?: string;
  orcid?: string;
};

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  version?: SubmissionVersion;
  isPublished: boolean;
};

const EMPTY_CONTRIBUTOR: Contributor = {
  givenName: "",
  familyName: "",
  email: "",
  affiliation: "",
  orcid: "",
};

function normalizeContributors(source?: Record<string, unknown>): Contributor[] {
  if (!source) return [];
  const authors = (source as { authors?: unknown })?.authors;
  if (!Array.isArray(authors)) {
    return [];
  }

  return authors.map((author) => {
    const obj = typeof author === "object" && author !== null ? (author as Record<string, unknown>) : {};
    return {
      givenName: typeof obj.givenName === "string" ? obj.givenName : "",
      familyName: typeof obj.familyName === "string" ? obj.familyName : "",
      email: typeof obj.email === "string" ? obj.email : "",
      affiliation: typeof obj.affiliation === "string" ? obj.affiliation : "",
      orcid: typeof obj.orcid === "string" ? obj.orcid : "",
    };
  });
}

export function ContributorsTab({ submissionId, detail, version, isPublished }: Props) {
  const router = useRouter();
  const initialContributors = useMemo(() => {
    if (version) {
      const normalized = normalizeContributors(version.metadata);
      if (normalized.length > 0) {
        return normalized;
      }
    }
    return normalizeContributors(detail.metadata);
  }, [detail.metadata, version]);

  const [contributors, setContributors] = useState<Contributor[]>(
    initialContributors.length ? initialContributors : [{ ...EMPTY_CONTRIBUTOR }],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setContributors(initialContributors.length ? initialContributors : [{ ...EMPTY_CONTRIBUTOR }]);
  }, [initialContributors]);

  if (!version) {
    return (
      <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-sm text-[var(--muted)]">
        Belum ada versi publikasi yang dapat diedit. Silakan buat versi baru terlebih dahulu.
      </div>
    );
  }

  const handleChange = (index: number, field: keyof Contributor, value: string) => {
    setContributors((prev) => prev.map((contributor, i) => (i === index ? { ...contributor, [field]: value } : contributor)));
  };

  const handleAddContributor = () => {
    setContributors((prev) => [...prev, { ...EMPTY_CONTRIBUTOR }]);
  };

  const handleRemoveContributor = (index: number) => {
    setContributors((prev) => {
      if (prev.length === 1) {
        return [{ ...EMPTY_CONTRIBUTOR }];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    const cleanedContributors = contributors
      .map((contributor) => ({
        givenName: contributor.givenName.trim(),
        familyName: contributor.familyName.trim(),
        email: contributor.email.trim(),
        affiliation: contributor.affiliation?.trim() ?? "",
        orcid: contributor.orcid?.trim() ?? "",
      }))
      .filter((contributor) => contributor.givenName || contributor.familyName || contributor.email);

    if (cleanedContributors.length === 0) {
      setFeedback({ tone: "error", message: "Tambahkan minimal satu kontributor dengan nama dan email." });
      return;
    }

    const hasInvalid = cleanedContributors.some((contributor) => !contributor.givenName || !contributor.email);
    if (hasInvalid) {
      setFeedback({ tone: "error", message: "Setiap kontributor wajib memiliki nama depan dan email." });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/editor/submissions/${submissionId}/publications/${version.id}/metadata`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authors: cleanedContributors }),
      });

      const json = await response.json();
      if (!response.ok || !json?.ok) {
        throw new Error(json?.error ?? "Gagal menyimpan kontributor.");
      }

      setFeedback({ tone: "success", message: "Kontributor berhasil diperbarui." });
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan kontributor.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "#002C40",
          }}
        >
          Contributors
        </h2>
        {!isPublished && (
          <button
            type="button"
            onClick={handleAddContributor}
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
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = "#005a82";
              event.currentTarget.style.borderColor = "#005a82";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = "#006798";
              event.currentTarget.style.borderColor = "#006798";
            }}
            disabled={isPublished}
          >
            Add Contributor
          </button>
        )}
      </div>

      {feedback && <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>}

      <div
        style={{
          borderRadius: "0.25rem",
          border: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
          overflow: "hidden",
        }}
      >
        <PkpTable>
          <PkpTableHeader>
            <PkpTableRow isHeader>
              <PkpTableHead style={{ width: "32%" }}>Name</PkpTableHead>
              <PkpTableHead style={{ width: "24%" }}>Email</PkpTableHead>
              <PkpTableHead style={{ width: "24%" }}>Affiliation</PkpTableHead>
              <PkpTableHead style={{ width: "16%" }}>ORCID</PkpTableHead>
              <PkpTableHead style={{ width: "4%", textAlign: "right" }}>Actions</PkpTableHead>
            </PkpTableRow>
          </PkpTableHeader>
          <tbody>
            {contributors.map((contributor, index) => (
              <PkpTableRow key={index}>
                <PkpTableCell>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Given name"
                        value={contributor.givenName}
                        disabled={isPublished}
                        onChange={(event) => handleChange(index, "givenName", event.target.value)}
                        className="h-10 flex-1 rounded border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[#006798]"
                      />
                      <input
                        type="text"
                        placeholder="Family name"
                        value={contributor.familyName}
                        disabled={isPublished}
                        onChange={(event) => handleChange(index, "familyName", event.target.value)}
                        className="h-10 flex-1 rounded border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[#006798]"
                      />
                    </div>
                    <span className="text-xs text-[var(--muted)]">Urutan tampil akan mengikuti susunan di daftar ini.</span>
                  </div>
                </PkpTableCell>
                <PkpTableCell>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={contributor.email}
                    disabled={isPublished}
                    onChange={(event) => handleChange(index, "email", event.target.value)}
                    className="h-10 w-full rounded border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[#006798]"
                  />
                </PkpTableCell>
                <PkpTableCell>
                  <input
                    type="text"
                    placeholder="Affiliation / Institution"
                    value={contributor.affiliation}
                    disabled={isPublished}
                    onChange={(event) => handleChange(index, "affiliation", event.target.value)}
                    className="h-10 w-full rounded border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[#006798]"
                  />
                </PkpTableCell>
                <PkpTableCell>
                  <input
                    type="text"
                    placeholder="0000-0000-0000-0000"
                    value={contributor.orcid}
                    disabled={isPublished}
                    onChange={(event) => handleChange(index, "orcid", event.target.value)}
                    className="h-10 w-full rounded border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[#006798]"
                  />
                </PkpTableCell>
                <PkpTableCell style={{ textAlign: "right" }}>
                  {!isPublished && (
                    <button
                      type="button"
                      onClick={() => handleRemoveContributor(index)}
                      className="text-sm font-semibold text-[#c92a2a] hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </PkpTableCell>
              </PkpTableRow>
            ))}
          </tbody>
        </PkpTable>
      </div>

      <p
        style={{
          fontSize: "0.75rem",
          color: "rgba(0, 0, 0, 0.54)",
          marginTop: "-0.5rem",
        }}
      >
        Kontributor akan muncul pada metadata publikasi dan daftar penulis. Gunakan tombol di atas untuk menambah, mengubah, ataupun menghapus
        susunan penulis sesuai OJS 3.3.
      </p>

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
            onMouseEnter={(event) => {
              if (!isSaving) {
                event.currentTarget.style.backgroundColor = "#005a82";
                event.currentTarget.style.borderColor = "#005a82";
              }
            }}
            onMouseLeave={(event) => {
              if (!isSaving) {
                event.currentTarget.style.backgroundColor = "#006798";
                event.currentTarget.style.borderColor = "#006798";
              }
            }}
          >
            {isSaving ? "Saving..." : "Save Contributors"}
          </button>
        </div>
      )}
    </form>
  );
}
