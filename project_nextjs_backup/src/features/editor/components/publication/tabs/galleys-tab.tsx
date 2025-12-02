"use client";

import { useMemo, useState } from "react";

import type { SubmissionDetail } from "../../../types";
import { GalleyGrid } from "@/features/editor/components/production-files/galley-grid";

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  isPublished: boolean;
};

export function GalleysTab({ submissionId, detail, isPublished }: Props) {
  const versions = detail.versions ?? [];
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(versions[0]?.id ?? null);
  const selectedVersion = useMemo(
    () => versions.find((version) => version.id === selectedVersionId) ?? versions[0],
    [versions, selectedVersionId],
  );

  return (
    <div
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
          gap: "1rem",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Galleys
          </h2>
          <p className="text-xs text-[var(--muted)]">Kelola galley untuk setiap versi terbitan.</p>
        </div>
        {versions.length > 1 && (
          <select
            value={selectedVersion?.id}
            onChange={(e) => setSelectedVersionId(e.target.value)}
            className="flex h-10 rounded border border-[var(--border)] bg-white px-3 py-2 text-sm"
          >
            {versions.map((version) => (
              <option key={version.id} value={version.id}>
                Versi {version.version} · {version.status}
              </option>
            ))}
          </select>
        )}
      </div>

      {!selectedVersion || (selectedVersion.galleys?.length ?? 0) === 0 ? (
        <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-center text-sm text-[var(--muted)]">
          Belum ada galley untuk versi ini.
        </div>
      ) : (
        <GalleyGrid
          submissionId={submissionId}
          stage="production"
          galleys={selectedVersion.galleys}
        />
      )}

      {!isPublished && (
        <p className="text-xs text-[var(--muted)]">
          Penambahan atau pengubahan galley dapat dilakukan dari tab Production ketika workflow berada di tahap produksi.
        </p>
      )}
    </div>
  );
}
