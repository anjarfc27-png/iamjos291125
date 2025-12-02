"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Query, SubmissionStage } from "../../types";
import { QueryCard } from "./query-card";
import { CreateQueryModal } from "./create-query-modal";

type ParticipantSummary = {
  userId: string;
  name: string;
  role: string;
  stage?: SubmissionStage;
};

type Props = {
  submissionId: string;
  stage: SubmissionStage;
  queries: Query[];
  participants: ParticipantSummary[];
};

/**
 * Queries Panel
 * Component for displaying and managing discussion queries/threads
 * Based on OJS 3.3 queries system
 */
export function QueriesPanel({ submissionId, stage, queries, participants }: Props) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [participantFilter, setParticipantFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const participantColorMap = useMemo(() => {
    const palette = ["#006798", "#00836a", "#9c27b0", "#f57c00", "#c62828", "#5d4037"];
    const map: Record<string, string> = {};
    participants.forEach((participant, index) => {
      map[participant.userId] = palette[index % palette.length];
    });
    return map;
  }, [participants]);

  const filteredQueries = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();
    return queries.filter((query) => {
      const matchesStage = stageFilter === "all" || query.stage === stageFilter;
      const matchesParticipant =
        participantFilter === "all" || query.participants.includes(participantFilter);

      const matchesKeyword =
        !keyword ||
        query.notes.some((note) => note.contents.toLowerCase().includes(keyword) || note.title?.toLowerCase().includes(keyword)) ||
        (query.stage ?? "").toLowerCase().includes(keyword);

      return matchesStage && matchesParticipant && matchesKeyword;
    });
  }, [queries, searchTerm, stageFilter, participantFilter]);

  const openQueries = filteredQueries.filter((q) => !q.closed);
  const closedQueries = filteredQueries.filter((q) => q.closed);
  const stageOptions = useMemo(() => {
    const uniqueStages = Array.from(new Set(queries.map((query) => query.stage).filter(Boolean)));
    return uniqueStages as SubmissionStage[];
  }, [queries]);

  const handleCreateQuery = () => {
    setIsCreating(true);
  };

  const handleCloseModal = () => {
    setIsCreating(false);
  };

  const handleQueryCreated = () => {
    setIsCreating(false);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div
      style={{
        borderRadius: "0.25rem",
        border: "1px solid #e5e5e5",
        backgroundColor: "#ffffff",
        padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "#002C40",
          }}
        >
          Queries ({filteredQueries.length}/{queries.length})
        </h2>
        <button
          type="button"
          onClick={handleCreateQuery}
          disabled={isPending}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "0.25rem",
            border: "1px solid #006798",
            backgroundColor: "#006798",
            color: "#ffffff",
            height: "2.25rem",
            paddingLeft: "1rem",
            paddingRight: "1rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: isPending ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!isPending) {
              e.currentTarget.style.backgroundColor = "#005a82";
              e.currentTarget.style.borderColor = "#005a82";
            }
          }}
          onMouseLeave={(e) => {
            if (!isPending) {
              e.currentTarget.style.backgroundColor = "#006798";
              e.currentTarget.style.borderColor = "#006798";
            }
          }}
        >
          Create Query
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Cari pesan, judul, atau stage…"
          style={{
            flex: "1 1 12rem",
            border: "1px solid #d5d5d5",
            borderRadius: "0.25rem",
            padding: "0.5rem 0.75rem",
            fontSize: "0.85rem",
          }}
        />
        <select
          value={participantFilter}
          onChange={(event) => setParticipantFilter(event.target.value)}
          style={{
            minWidth: "12rem",
            border: "1px solid #d5d5d5",
            borderRadius: "0.25rem",
            padding: "0.5rem 0.75rem",
            fontSize: "0.85rem",
          }}
        >
          <option value="all">Semua Peserta</option>
          {participants.map((participant) => (
            <option key={participant.userId} value={participant.userId}>
              {participant.name} ({participant.role})
            </option>
          ))}
        </select>
        <select
          value={stageFilter}
          onChange={(event) => setStageFilter(event.target.value)}
          style={{
            minWidth: "10rem",
            border: "1px solid #d5d5d5",
            borderRadius: "0.25rem",
            padding: "0.5rem 0.75rem",
            fontSize: "0.85rem",
          }}
        >
          <option value="all">Semua Stage</option>
          {stageOptions.map((stageValue) => (
            <option key={stageValue} value={stageValue}>
              {stageValue}
            </option>
          ))}
        </select>
      </div>

      {queries.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            backgroundColor: "#f8f9fa",
            borderRadius: "0.25rem",
            border: "1px solid #e5e5e5",
          }}
        >
          No queries yet. Create a query to start a discussion.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {/* Open Queries */}
          {openQueries.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#002C40",
                  marginBottom: "0.75rem",
                }}
              >
                Open Queries ({openQueries.length})
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {openQueries.map((query) => (
                  <QueryCard
                    key={query.id}
                    submissionId={submissionId}
                    query={query}
                    participants={participants}
                    participantColors={participantColorMap}
                    highlightedParticipant={participantFilter === "all" ? undefined : participantFilter}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Closed Queries */}
          {closedQueries.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#002C40",
                  marginBottom: "0.75rem",
                }}
              >
                Closed Queries ({closedQueries.length})
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {closedQueries.map((query) => (
                  <QueryCard
                    key={query.id}
                    submissionId={submissionId}
                    query={query}
                    participants={participants}
                    participantColors={participantColorMap}
                    highlightedParticipant={participantFilter === "all" ? undefined : participantFilter}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isCreating && (
        <CreateQueryModal
          open={true}
          onClose={handleCloseModal}
          submissionId={submissionId}
          stage={stage}
          participants={participants}
          onQueryCreated={handleQueryCreated}
        />
      )}
    </div>
  );
}



