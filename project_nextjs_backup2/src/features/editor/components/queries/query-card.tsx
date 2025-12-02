"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Query, SubmissionStage } from "../../types";
import { QueryDetailModal } from "./query-detail-modal";
import { FormMessage } from "@/components/ui/form-message";

type ParticipantSummary = {
  userId: string;
  name: string;
  role: string;
  stage?: SubmissionStage;
};

type Props = {
  submissionId: string;
  query: Query;
  participants: ParticipantSummary[];
  participantColors?: Record<string, string>;
  highlightedParticipant?: string | null;
};

/**
 * Query Card
 * Component for displaying a single query/discussion thread
 * Based on OJS 3.3 query display
 */
export function QueryCard({
  submissionId,
  query,
  participants,
  participantColors,
  highlightedParticipant,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const lastNote = query.notes.length > 0 ? query.notes[query.notes.length - 1] : null;
  const lastActivityAt = query.dateModified || lastNote?.dateCreated || query.datePosted;
  const participantBadges = query.participants.map((userId) => {
    const participant = participants.find((p) => p.userId === userId);
    return {
      userId,
      name: participant?.name || "Unknown",
      role: participant?.role,
      color: participantColors?.[userId],
    };
  });
  const isHighlighted = highlightedParticipant && query.participants.includes(highlightedParticipant);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    startTransition(() => {
      router.refresh();
    });
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

  return (
    <>
      <div
        onClick={handleOpen}
        style={{
          borderRadius: "0.25rem",
          border: isHighlighted ? "1px solid #006798" : "1px solid #e5e5e5",
          backgroundColor: query.closed ? "#f8f9fa" : "#ffffff",
          padding: "0.75rem 1rem",
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: isHighlighted ? "0 0 0 2px rgba(0, 103, 152, 0.15)" : undefined,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f8f9fa";
          e.currentTarget.style.borderColor = "#d0d0d0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = query.closed ? "#f8f9fa" : "#ffffff";
          e.currentTarget.style.borderColor = "#e5e5e5";
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.25rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#002C40",
                }}
              >
                {lastNote?.title || "Discussion Thread"}
              </span>
              {query.stage && (
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: 0.2,
                    color: "#006798",
                    border: "1px solid rgba(0, 103, 152, 0.3)",
                    padding: "0.1rem 0.35rem",
                    borderRadius: "999px",
                    textTransform: "capitalize",
                  }}
                >
                  {query.stage}
                </span>
              )}
              {query.closed && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#ffffff",
                    backgroundColor: "rgba(0, 0, 0, 0.54)",
                    padding: "0.125rem 0.5rem",
                    borderRadius: "0.125rem",
                  }}
                >
                  Closed
                </span>
              )}
            </div>
            {lastNote && (
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "rgba(0, 0, 0, 0.84)",
                  marginBottom: "0.25rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {lastNote.contents}
              </p>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                fontSize: "0.75rem",
                color: "rgba(0, 0, 0, 0.54)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.35rem",
                }}
              >
                {participantBadges.length === 0 ? (
                  <span>Participants: none</span>
                ) : (
                  participantBadges.map((badge) => (
                    <span
                      key={badge.userId}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "0.7rem",
                        fontWeight: badge.userId === highlightedParticipant ? 700 : 500,
                        color: badge.userId === highlightedParticipant ? "#002C40" : "#ffffff",
                        backgroundColor:
                          badge.userId === highlightedParticipant
                            ? "#cde9f8"
                            : badge.color ?? "rgba(0,0,0,0.45)",
                        borderRadius: "999px",
                        padding: "0.2rem 0.6rem",
                        border:
                          badge.userId === highlightedParticipant
                            ? "1px solid #006798"
                            : "1px solid transparent",
                      }}
                    >
                      <span>{badge.name}</span>
                      {badge.role && <span style={{ opacity: 0.8 }}>({badge.role})</span>}
                    </span>
                  ))
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span>{query.notes.length} {query.notes.length === 1 ? "message" : "messages"}</span>
                <span>•</span>
                <span>Updated {formatDate(lastActivityAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <QueryDetailModal
          open={true}
          onClose={handleClose}
          submissionId={submissionId}
          query={query}
          participants={participants}
        />
      )}
    </>
  );
}



