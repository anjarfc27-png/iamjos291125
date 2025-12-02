"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { PkpButton } from "@/components/ui/pkp-button";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import { FormMessage } from "@/components/ui/form-message";

type Props = {
  submissionId: string;
};

export function SubmissionActivityForm({ submissionId }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) {
      setFeedback({ tone: "error", message: "Catatan tidak boleh kosong." });
      return;
    }
    startTransition(async () => {
      setFeedback(null);
      try {
        const res = await fetch(`/api/editor/submissions/${submissionId}/activity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
        const json = await res.json();
        if (!json.ok) {
          setFeedback({ tone: "error", message: json.message ?? "Tidak dapat menambahkan catatan." });
          return;
        }
        setMessage("");
        setFeedback({ tone: "success", message: "Catatan ditambahkan." });
        router.refresh();
      } catch {
        setFeedback({ tone: "error", message: "Kesalahan jaringan saat menambahkan catatan." });
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        marginTop: "1rem",
        borderTop: "1px solid #e5e5e5",
        paddingTop: "1rem",
      }}
    >
      <label
        style={{
          display: "block",
          fontSize: "0.875rem",
          color: "#002C40",
        }}
      >
        <span
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: 600,
          }}
        >
          Tambahkan Catatan
        </span>
        <PkpTextarea
          rows={3}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
        />
      </label>
      {feedback && (
        <div style={{ marginTop: "0.25rem" }}>
          <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <PkpButton
          type="submit"
          variant="primary"
          disabled={isPending}
          loading={isPending}
        >
          {isPending ? "Menyimpan..." : "Simpan Catatan"}
        </PkpButton>
      </div>
    </form>
  );
}

