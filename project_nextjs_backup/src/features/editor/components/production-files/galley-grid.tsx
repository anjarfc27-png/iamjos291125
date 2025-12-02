"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicationGalley, SubmissionStage } from "../../types";
import {
  PkpTable,
  PkpTableHeader,
  PkpTableRow,
  PkpTableHead,
  PkpTableCell,
} from "@/components/ui/pkp-table";
import { PkpButton } from "@/components/ui/pkp-button";

type Props = {
  submissionId: string;
  stage: SubmissionStage;
  galleys: PublicationGalley[];
  onEdit?: (galleyId: string) => void;
  onDelete?: (galleyId: string) => Promise<void>;
};

/**
 * Galley Grid
 * Displays all galleys for a submission in production stage
 * Based on OJS PKP 3.3 galley grid
 */
export function GalleyGrid({
  submissionId: _submissionId,
  stage: _stage,
  galleys,
  onEdit,
  onDelete,
}: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (galleyId: string) => {
    if (!onDelete) return;

    setDeletingId(galleyId);
    try {
      await onDelete(galleyId);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete galley:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (galleys.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-center text-sm text-[var(--muted)]">
        No galleys created yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-[var(--border)] bg-white">
      <PkpTable>
        <PkpTableHeader>
          <PkpTableRow isHeader>
            <PkpTableHead>Label</PkpTableHead>
            <PkpTableHead>Locale</PkpTableHead>
            <PkpTableHead>Source</PkpTableHead>
            <PkpTableHead>Status</PkpTableHead>
            <PkpTableHead>Dibuat</PkpTableHead>
            <PkpTableHead style={{ textAlign: "right" }}>Aksi</PkpTableHead>
          </PkpTableRow>
        </PkpTableHeader>
        <tbody>
          {galleys.map((galley) => (
            <PkpTableRow key={galley.id}>
              <PkpTableCell>
                <div className="font-semibold text-[var(--foreground)]">{galley.label}</div>
                {galley.remoteUrl && (
                  <a
                    href={galley.remoteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[var(--primary)] underline"
                  >
                    {galley.remoteUrl}
                  </a>
                )}
              </PkpTableCell>
              <PkpTableCell>{galley.locale?.toUpperCase()}</PkpTableCell>
              <PkpTableCell>
                {galley.remoteUrl
                  ? "Remote URL"
                  : galley.submissionFileId
                  ? "Submission File"
                  : "—"}
              </PkpTableCell>
              <PkpTableCell>
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: galley.isApproved ? "rgba(0, 105, 152, 0.12)" : "rgba(0, 0, 0, 0.08)",
                    color: galley.isApproved ? "#006798" : "rgba(0, 0, 0, 0.7)",
                  }}
                >
                  {galley.isApproved ? "Approved" : "Draft"}
                </span>
              </PkpTableCell>
              <PkpTableCell>
                <div className="text-sm text-[var(--foreground)]">{formatDate(galley.createdAt)}</div>
                <div className="text-xs text-[var(--muted)]">Updated {formatDate(galley.updatedAt)}</div>
              </PkpTableCell>
              <PkpTableCell style={{ textAlign: "right" }}>
                <div className="flex justify-end gap-2">
                  {onEdit && (
                    <PkpButton variant="link" size="sm" onClick={() => onEdit(galley.id)}>
                      Edit
                    </PkpButton>
                  )}
                  {onDelete && (
                    <PkpButton
                      variant="onclick"
                      size="sm"
                      onClick={() => handleDelete(galley.id)}
                      disabled={deletingId === galley.id}
                      loading={deletingId === galley.id}
                    >
                      Delete
                    </PkpButton>
                  )}
                </div>
              </PkpTableCell>
            </PkpTableRow>
          ))}
        </tbody>
      </PkpTable>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("id", {
      dateStyle: "medium",
    }).format(new Date(value));
  } catch {
    return value ?? "";
  }
}
