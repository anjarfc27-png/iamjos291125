"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PkpModal } from "@/components/ui/pkp-modal";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import { FormMessage } from "@/components/ui/form-message";

type Props = {
  open: boolean;
  onClose: () => void;
  submissionId: string;
  currentVersion?: { id: string; version: number };
  isPublished: boolean;
  scheduledDate?: string | null;
};

/**
 * Publish/Schedule Modal
 * Modal for publishing or scheduling publication
 * Based on OJS 3.3 publication scheduling
 */
export function PublishScheduleModal({
  open,
  onClose,
  submissionId,
  currentVersion,
  isPublished,
  scheduledDate,
}: Props) {
  const router = useRouter();
  const [publishNow, setPublishNow] = useState<boolean>(!scheduledDate);
  const [scheduleDate, setScheduleDate] = useState<string>(
    scheduledDate?.split("T")[0] || new Date().toISOString().split("T")[0]
  );
  const [scheduleTime, setScheduleTime] = useState<string>(
    scheduledDate?.split("T")[1]?.slice(0, 5) || "00:00"
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!publishNow && (!scheduleDate || !scheduleTime)) {
      setError("Schedule date and time are required.");
      return;
    }

    const publishDate = publishNow
      ? new Date().toISOString()
      : new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();

    try {
      // TODO: Save publication via server action
      const res = await fetch(`/api/editor/submissions/${submissionId}/publications/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionId: currentVersion?.id,
          publishDate,
          publishNow,
        }),
      });

      const json = await res.json();

      if (!json.ok) {
        setError(json.message ?? "Failed to publish");
        return;
      }

      startTransition(() => {
        router.refresh();
        onClose();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "0.5rem",
          width: "100%",
          maxWidth: "42rem",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.5rem",
            borderBottom: "1px solid #e5e5e5",
          }}
        >
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            {isPublished ? "Schedule Publication" : "Publish"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2rem",
              height: "2rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: "transparent",
              color: "rgba(0, 0, 0, 0.54)",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            padding: "1.5rem",
            overflowY: "auto",
          }}
        >
          {error && <FormMessage tone="error">{error}</FormMessage>}

          {/* Publish Now Option */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                checked={publishNow}
                onChange={() => setPublishNow(true)}
                style={{
                  height: "1rem",
                  width: "1rem",
                  accentColor: "#006798",
                }}
              />
              <span style={{ fontWeight: 600, color: "#002C40" }}>Publish Now</span>
            </label>
            <p style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginLeft: "1.5rem" }}>
              Publish immediately when you save.
            </p>
          </div>

          {/* Schedule Option */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                checked={!publishNow}
                onChange={() => setPublishNow(false)}
                style={{
                  height: "1rem",
                  width: "1rem",
                  accentColor: "#006798",
                }}
              />
              <span style={{ fontWeight: 600, color: "#002C40" }}>Schedule for Later</span>
            </label>
            {!publishNow && (
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginLeft: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    flex: 1,
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#002C40",
                    }}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    required={!publishNow}
                    style={{
                      height: "2.5rem",
                      padding: "0 0.75rem",
                      borderRadius: "0.25rem",
                      border: "1px solid #e5e5e5",
                      backgroundColor: "#ffffff",
                      fontSize: "0.875rem",
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
                      outline: "none",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    flex: 1,
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#002C40",
                    }}
                  >
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    required={!publishNow}
                    style={{
                      height: "2.5rem",
                      padding: "0 0.75rem",
                      borderRadius: "0.25rem",
                      border: "1px solid #e5e5e5",
                      backgroundColor: "#ffffff",
                      fontSize: "0.875rem",
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              paddingTop: "1rem",
              borderTop: "1px solid #e5e5e5",
            }}
          >
            <PkpButton
              type="button"
              variant="onclick"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </PkpButton>
            <PkpButton
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Publishing..." : isPublished ? "Schedule" : "Publish"}
            </PkpButton>
          </div>
        </form>
      </div>
    </div>
  );
}


