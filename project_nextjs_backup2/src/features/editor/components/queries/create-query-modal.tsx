"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SubmissionStage } from "../../types";
import { PkpModal } from "@/components/ui/pkp-modal";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import { PkpCheckbox } from "@/components/ui/pkp-checkbox";
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
  stage: SubmissionStage;
  participants: ParticipantSummary[];
  onQueryCreated: () => void;
};

/**
 * Create Query Modal
 * Modal for creating a new discussion query/thread
 * Based on OJS 3.3 query creation - OJS 3.3 Exact Layout
 */
export function CreateQueryModal({
  open,
  onClose,
  submissionId,
  stage,
  participants,
  onQueryCreated,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participantSearch, setParticipantSearch] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }
    const defaults = participants
      .filter((participant) => participant.stage === stage || ["manager", "editor"].includes(participant.role))
      .map((participant) => participant.userId);
    setSelectedParticipants(Array.from(new Set(defaults)));
    setTitle("");
    setMessage("");
    setParticipantSearch("");
    setError(null);
  }, [open, participants, stage]);

  const filteredParticipants = useMemo(() => {
    const keyword = participantSearch.toLowerCase().trim();
    if (!keyword) {
      return participants;
    }
    return participants.filter((participant) => {
      const haystack = `${participant.name} ${participant.role}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [participants, participantSearch]);

  const handleSelectAll = () => {
    const ids = filteredParticipants.map((participant) => participant.userId);
    setSelectedParticipants((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const handleClearSelection = () => {
    setSelectedParticipants([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!message.trim()) {
      setError("Message cannot be empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/editor/submissions/${submissionId}/queries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage,
          title: title.trim() || undefined,
          message: message.trim(),
          participantIds: selectedParticipants,
        }),
      });

      const json = await res.json();

      if (!json.ok) {
        setError(json.message ?? "Failed to create query");
        return;
      }

      setTitle("");
      setMessage("");
      setSelectedParticipants([]);
      onQueryCreated();
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create query");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleParticipant = (userId: string) => {
    if (selectedParticipants.includes(userId)) {
      setSelectedParticipants(selectedParticipants.filter((id) => id !== userId));
    } else {
      setSelectedParticipants([...selectedParticipants, userId]);
    }
  };

  return (
    <PkpModal
      isOpen={open}
      onClose={onClose}
      title="Create Discussion Query"
      footer={
        <>
          <PkpButton
            variant="onclick"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </PkpButton>
          <PkpButton
            variant="primary"
            type="submit"
            form="create-query-form"
            disabled={isSubmitting || !message.trim()}
            loading={isSubmitting}
          >
            Create Query
          </PkpButton>
        </>
      }
    >
      <form
        id="create-query-form"
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {error && <FormMessage tone="error">{error}</FormMessage>}

        {/* Title (Optional) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <label
            htmlFor="query-title"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Title (Optional)
          </label>
          <PkpInput
            id="query-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter query title..."
          />
        </div>

        {/* Message */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <label
            htmlFor="query-message"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Message *
          </label>
          <PkpTextarea
            id="query-message"
            rows={8}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
            required
          />
        </div>

        {/* Participants Selection */}
        {participants.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <label
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#002C40",
              }}
            >
              Add Participants
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <PkpInput
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
                placeholder="Search by name or role..."
                style={{ flex: "1 1 200px" }}
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <PkpButton type="button" variant="onclick" size="sm" onClick={handleSelectAll}>
                  Select All
                </PkpButton>
                <PkpButton type="button" variant="onclick" size="sm" onClick={handleClearSelection}>
                  Clear
                </PkpButton>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                maxHeight: "12rem",
                overflow: "auto",
                padding: "0.75rem",
                borderRadius: "0.25rem",
                border: "1px solid #e5e5e5",
                backgroundColor: "#f8f9fa",
              }}
            >
              {filteredParticipants.length === 0 && (
                <span className="text-xs text-[var(--muted)]">No participants match your search.</span>
              )}
              {filteredParticipants.map((participant) => (
                <label
                  key={participant.userId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  <PkpCheckbox
                    checked={selectedParticipants.includes(participant.userId)}
                    onChange={() => handleToggleParticipant(participant.userId)}
                  />
                  <span style={{ color: "#002C40", display: "flex", flexDirection: "column" }}>
                    <span>{participant.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "rgba(0,0,0,0.6)" }}>
                      {participant.role}
                      {participant.stage ? ` • ${participant.stage}` : ""}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </form>
    </PkpModal>
  );
}
