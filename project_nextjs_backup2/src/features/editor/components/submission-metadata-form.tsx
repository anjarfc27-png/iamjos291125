"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";

type Props = {
  submissionId: string;
  initialTitle: string;
  initialAbstract?: string | null;
  initialKeywords?: string[] | null;
};

export function SubmissionMetadataForm({ submissionId, initialTitle, initialAbstract, initialKeywords }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle ?? "");
  const [abstract, setAbstract] = useState(initialAbstract ?? "");
  const [keywordsText, setKeywordsText] = useState(Array.isArray(initialKeywords) ? initialKeywords.join(", ") : "");
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTitle(initialTitle ?? "");
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [initialTitle]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      setFeedback(null);
      const keywords = keywordsText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      try {
        const res = await fetch(`/api/editor/submissions/${submissionId}/metadata`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, abstract: abstract || null, keywords }),
        });
        const json = await res.json();
        if (!json.ok) {
          setFeedback({ tone: "error", message: json.message ?? "Tidak dapat menyimpan metadata." });
          return;
        }
        setFeedback({ tone: "success", message: "Metadata disimpan." });
        router.refresh();
      } catch {
        setFeedback({ tone: "error", message: "Kesalahan jaringan saat menyimpan metadata." });
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block text-sm text-[var(--foreground)]">
        <span className="mb-2 block font-semibold">Judul</span>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="block text-sm text-[var(--foreground)]">
        <span className="mb-2 block font-semibold">Abstrak</span>
        <textarea
          rows={4}
          value={abstract ?? ""}
          onChange={(e) => setAbstract(e.target.value)}
          className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
        />
      </label>
      <label className="block text-sm text-[var(--foreground)]">
        <span className="mb-2 block font-semibold">Kata Kunci (pisahkan dengan koma)</span>
        <Input
          placeholder="contoh: ekonomi, kebijakan publik, analisis data"
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
        />
      </label>
      {feedback && <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>}
      <div className="flex justify-end">
        <Button type="submit" loading={isPending} disabled={isPending}>
          Simpan Metadata
        </Button>
      </div>
    </form>
  );
}