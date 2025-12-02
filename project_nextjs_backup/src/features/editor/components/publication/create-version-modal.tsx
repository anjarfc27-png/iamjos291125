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
};

/**
 * Create Version Modal
 * Modal for creating a new publication version
 * Based on OJS 3.3 version creation
 */
export function CreateVersionModal({ open, onClose, submissionId, currentVersion }: Props) {
  const router = useRouter();
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // TODO: Create version via server action
      const res = await fetch(`/api/editor/submissions/${submissionId}/publications/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!json.ok) {
        setError(json.message ?? "Failed to create version");
        return;
      }

      setDescription("");
      startTransition(() => {
        router.refresh();
        onClose();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create version");
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
            Create New Version
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

          <p
            style={{
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.84)",
            }}
          >
            Create a new version of this publication. The new version will be numbered{" "}
            {currentVersion ? currentVersion.version + 1 : 2}.
          </p>

          {/* Description */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <label
              htmlFor="version-description"
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#002C40",
              }}
            >
              Version Description (optional)
            </label>
            <PkpTextarea
              id="version-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the changes in this version..."
              rows={4}
            />
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
              {isSubmitting ? "Creating..." : "Create Version"}
            </PkpButton>
          </div>
        </form>
      </div>
    </div>
  );
}


