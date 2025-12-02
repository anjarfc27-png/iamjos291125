"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Query, SubmissionStage } from "../../types";
import { PkpModal } from "@/components/ui/pkp-modal";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import { FormMessage } from "@/components/ui/form-message";

type ParticipantSummary = {
  userId: string;
  name: string;
  role: string;
  stage?: SubmissionStage;
};

type Props = {
  open: boolean;
  onClose: () => void;
  submissionId: string;
  query: Query;
  participants: ParticipantSummary[];
};

/**
 * Query Detail Modal
 * Modal for viewing and replying to a query/discussion thread
 * Based on OJS 3.3 query detail view
 */
export function QueryDetailModal({
  open,
  onClose,
  submissionId,
  query,
  participants,
}: Props) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reply.trim()) {
      setError("Reply cannot be empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/editor/submissions/${submissionId}/queries/${query.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: reply.trim(),
        }),
      });

      const json = await res.json();

      if (!json.ok) {
        setError(json.message ?? "Failed to add reply");
        return;
      }

      setReply("");
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseQuery = async () => {
    if (!confirm("Are you sure you want to close this query?")) {
      return;
    }

    try {
      const res = await fetch(`/api/editor/submissions/${submissionId}/queries/${query.id}/close`, {
        method: "POST",
      });

      const json = await res.json();

      if (!json.ok) {
        setError(json.message ?? "Failed to close query");
        return;
      }

      startTransition(() => {
        router.refresh();
        onClose();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close query");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const getParticipantName = (userId: string) => {
    return participants.find((p) => p.userId === userId)?.name || "Unknown";
  };

  const modalTitle = query.notes[0]?.title || "Discussion Thread";
  const modalSubtitle = `Participants: ${query.participants.map((p) => getParticipantName(p)).join(", ")}${query.closed ? " • Closed" : ""}`;

  return (
    <PkpModal
      isOpen={open}
      onClose={onClose}
      title={modalTitle}
      size="large"
      footer={
        <>
          {!query.closed && (
            <PkpButton
              type="button"
              variant="onclick"
              onClick={handleCloseQuery}
              disabled={isSubmitting}
            >
              Close Query
            </PkpButton>
          )}
          <PkpButton
            type="button"
            variant="onclick"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Close
          </PkpButton>
        </>
      }
    >

      {/* Subtitle */}
      <div
        style={{
          fontSize: "0.75rem",
          color: "rgba(0, 0, 0, 0.54)",
          marginBottom: "1rem",
        }}
      >
        {modalSubtitle}
      </div>

      {/* Messages */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxHeight: "60vh",
          overflowY: "auto",
          padding: "0.5rem 0",
        }}
      >
          {query.notes.map((note) => (
            <div
              key={note.id}
              style={{
                borderRadius: "0.25rem",
                border: "1px solid #e5e5e5",
                backgroundColor: "#f8f9fa",
                padding: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#002C40",
                  }}
                >
                  {note.userName}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(0, 0, 0, 0.54)",
                  }}
                >
                  {formatDate(note.dateCreated)}
                </span>
              </div>
              {note.title && (
                <h4
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#002C40",
                    marginBottom: "0.5rem",
                  }}
                >
                  {note.title}
                </h4>
              )}
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "rgba(0, 0, 0, 0.84)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {note.contents}
              </p>
            </div>
          ))}
        </div>

      {/* Reply Form */}
      {!query.closed && (
        <form
          onSubmit={handleReply}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginTop: "1.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid #e5e5e5",
          }}
        >
          <label
            htmlFor="query-reply"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Add Reply
          </label>
          <PkpTextarea
            id="query-reply"
            rows={4}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Enter your reply..."
            required
          />
          {error && <FormMessage tone="error">{error}</FormMessage>}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <PkpButton
              type="submit"
              variant="primary"
              disabled={isSubmitting || !reply.trim()}
              loading={isSubmitting}
            >
              Reply
            </PkpButton>
          </div>
        </form>
      )}
    </PkpModal>
  );
}


