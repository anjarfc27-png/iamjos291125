'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Query, SubmissionStage, SubmissionParticipant } from '@/features/editor/types';
import { QueryCard } from '@/features/editor/components/queries/query-card';

type Props = {
  submissionId: string;
  stage: SubmissionStage;
  queries: Query[];
  participants: SubmissionParticipant[];
};

/**
 * Author Queries Panel
 * Read-only version for Author role - can view queries but not create them
 * Based on OJS PKP 3.3 queries system
 */
export function AuthorQueriesPanel({ submissionId, stage, queries, participants }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const [participantFilter, setParticipantFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');

  // Convert SubmissionParticipant to ParticipantSummary format
  const participantSummaries = useMemo(() => {
    return participants.map(p => ({
      userId: p.userId,
      name: p.name || `User ${p.userId}`,
      role: p.role,
      stage: p.stage,
    }));
  }, [participants]);

  const participantColorMap = useMemo(() => {
    const palette = ['#006798', '#00836a', '#9c27b0', '#f57c00', '#c62828', '#5d4037'];
    const map: Record<string, string> = {};
    participantSummaries.forEach((participant, index) => {
      map[participant.userId] = palette[index % palette.length];
    });
    return map;
  }, [participantSummaries]);

  // Filter queries for production stage
  const productionQueries = useMemo(() => {
    return queries.filter(q => q.stage === 'production');
  }, [queries]);

  const filteredQueries = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();
    return productionQueries.filter((query) => {
      const matchesStage = stageFilter === 'all' || query.stage === stageFilter;
      const matchesParticipant =
        participantFilter === 'all' || query.participants.includes(participantFilter);

      const matchesKeyword =
        !keyword ||
        query.notes.some((note) => note.contents.toLowerCase().includes(keyword) || note.title?.toLowerCase().includes(keyword)) ||
        (query.stage ?? '').toLowerCase().includes(keyword);

      return matchesStage && matchesParticipant && matchesKeyword;
    });
  }, [productionQueries, searchTerm, stageFilter, participantFilter]);

  const openQueries = filteredQueries.filter((q) => !q.closed);
  const closedQueries = filteredQueries.filter((q) => q.closed);

  return (
    <div>
      <h2
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: '#002C40',
          marginBottom: '1rem',
        }}
      >
        Queries ({filteredQueries.length}/{productionQueries.length})
      </h2>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Cari pesan, judul, atau stage…"
          style={{
            flex: '1 1 12rem',
            border: '1px solid #d5d5d5',
            borderRadius: '0.25rem',
            padding: '0.5rem 0.75rem',
            fontSize: '0.85rem',
          }}
        />
        <select
          value={participantFilter}
          onChange={(event) => setParticipantFilter(event.target.value)}
          style={{
            minWidth: '12rem',
            border: '1px solid #d5d5d5',
            borderRadius: '0.25rem',
            padding: '0.5rem 0.75rem',
            fontSize: '0.85rem',
          }}
        >
          <option value="all">Semua Peserta</option>
          {participantSummaries.map((participant) => (
            <option key={participant.userId} value={participant.userId}>
              {participant.name} ({participant.role})
            </option>
          ))}
        </select>
      </div>

      {productionQueries.length === 0 ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'rgba(0, 0, 0, 0.54)',
            backgroundColor: '#f8f9fa',
            borderRadius: '0.25rem',
            border: '1px solid #e5e5e5',
          }}
        >
          No queries yet.
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Open Queries */}
          {openQueries.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#002C40',
                  marginBottom: '0.75rem',
                }}
              >
                Open Queries ({openQueries.length})
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {openQueries.map((query) => (
                  <QueryCard
                    key={query.id}
                    submissionId={submissionId}
                    query={query}
                    participants={participantSummaries}
                    participantColors={participantColorMap}
                    highlightedParticipant={participantFilter === 'all' ? undefined : participantFilter}
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
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#002C40',
                  marginBottom: '0.75rem',
                }}
              >
                Closed Queries ({closedQueries.length})
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {closedQueries.map((query) => (
                  <QueryCard
                    key={query.id}
                    submissionId={submissionId}
                    query={query}
                    participants={participantSummaries}
                    participantColors={participantColorMap}
                    highlightedParticipant={participantFilter === 'all' ? undefined : participantFilter}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

