"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import type { SubmissionFile, SubmissionStage } from "../types";
import { SUBMISSION_STAGES } from "../types";

type Props = {
  submissionId: string;
  files: SubmissionFile[];
};

const FILE_KINDS = [
  { value: "manuscript", label: "Manuscript" },
  { value: "review", label: "Review Document" },
  { value: "copyedit", label: "Copyedit" },
  { value: "layout", label: "Layout" },
  { value: "galley", label: "Galley" },
  { value: "supplemental", label: "Supplemental" },
];

export function SubmissionFilesPanel({ submissionId, files }: Props) {
  const router = useRouter();
  const [stage, setStage] = useState<SubmissionStage>("submission");
  const [file, setFile] = useState<File | null>(null);
  const [fileKind, setFileKind] = useState(FILE_KINDS[0].value);
  const [versionLabel, setVersionLabel] = useState("");
  const [visible, setVisible] = useState(false);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const stageFiles = useMemo(() => files.filter((item) => item.stage === stage), [files, stage]);

  const handleUpload = (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setFeedback({ tone: "error", message: "Pilih file yang akan diunggah." });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("stage", stage);
    formData.append("fileKind", fileKind);
    formData.append("versionLabel", versionLabel);
    formData.append("visible", visible ? "true" : "false");
    formData.append("round", String(round));

    startTransition(async () => {
      setFeedback(null);
      try {
        const res = await fetch(`/api/editor/submissions/${submissionId}/files`, {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (!json.ok) {
          setFeedback({ tone: "error", message: json.message ?? "Gagal mengunggah file." });
          return;
        }
        setFeedback({ tone: "success", message: "File berhasil diunggah." });
        setFile(null);
        setVersionLabel("");
        setVisible(false);
        router.refresh();
      } catch {
        setFeedback({ tone: "error", message: "Kesalahan jaringan saat mengunggah file." });
      }
    });
  };

  const handleDelete = (fileId: string) => {
    setRemovingId(fileId);
    fetch(`/api/editor/submissions/${submissionId}/files`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.ok) {
          setFeedback({ tone: "error", message: json.message ?? "Gagal menghapus file." });
          return;
        }
        setFeedback({ tone: "success", message: "File dihapus." });
        router.refresh();
      })
      .catch(() => {
        setFeedback({ tone: "error", message: "Kesalahan jaringan saat menghapus file." });
      })
      .finally(() => setRemovingId(null));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SUBMISSION_STAGES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStage(value)}
            className={`rounded-md px-3 py-1 text-sm font-semibold ${
              stage === value ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-muted)] text-[var(--foreground)]"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <form className="rounded-md border border-[var(--border)] bg-white p-4 shadow-sm" onSubmit={handleUpload}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-[var(--foreground)]">
            File
            <input
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-[var(--foreground)]">
            Jenis File
            <select
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
              value={fileKind}
              onChange={(event) => setFileKind(event.target.value)}
            >
              {FILE_KINDS.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-[var(--foreground)]">
            Label Versi
            <Input className="mt-2" value={versionLabel} onChange={(event) => setVersionLabel(event.target.value)} />
          </label>
          <label className="text-sm font-semibold text-[var(--foreground)]">
            Putaran
            <Input
              type="number"
              min={1}
              className="mt-2"
              value={round}
              onChange={(event) => setRound(Number(event.target.value) || 1)}
            />
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          <input type="checkbox" checked={visible} onChange={(event) => setVisible(event.target.checked)} />
          Tampilkan untuk author
        </label>
        {feedback && <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>}
        <div className="mt-4 flex justify-end">
          <Button type="submit" loading={isPending} disabled={isPending}>
            Unggah
          </Button>
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Catatan: bucket Supabase <code>submission-files</code> harus dibuat dan diizinkan untuk upload.
        </p>
      </form>

      <div className="overflow-hidden rounded-md border border-[var(--border)] bg-white shadow-sm">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-[var(--surface-muted)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Nama File</th>
              <th className="px-4 py-2 text-left font-semibold">Jenis</th>
              <th className="px-4 py-2 text-left font-semibold">Versi</th>
              <th className="px-4 py-2 text-left font-semibold">Ukuran</th>
              <th className="px-4 py-2 text-left font-semibold">Putaran</th>
              <th className="px-4 py-2 text-left font-semibold">Publik</th>
              <th className="px-4 py-2 text-left font-semibold">Diunggah</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {stageFiles.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-[var(--muted)]">
                  Belum ada file pada tahap ini.
                </td>
              </tr>
            ) : (
              stageFiles.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{item.label}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{item.kind}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{item.versionLabel ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{formatSize(item.size)}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{item.round}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{item.isVisibleToAuthors ? "Ya" : "Tidak"}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{formatDate(item.uploadedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)} disabled={removingId === item.id}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatSize(value: number) {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let idx = 0;
  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024;
    idx += 1;
  }
  return `${size.toFixed(1)} ${units[idx]}`;
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}

