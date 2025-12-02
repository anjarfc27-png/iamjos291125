"use client";

import { useMemo, useState } from "react";
import type { SubmissionFile, SubmissionReviewRound } from "../../types";
import { FileSelectionGrid } from "../file-selection/file-selection-grid";

type Props = {
  files: SubmissionFile[];
  reviewRounds: SubmissionReviewRound[];
  selectedAttachments: string[];
  onSelectionChange: (fileIds: string[]) => void;
  reviewRoundId?: string;
  label?: string;
};

/**
 * Review Attachments Selector
 * Component for selecting review attachments from review rounds
 * Based on OJS 3.3 EditorSelectableReviewAttachmentsGridHandler
 * Used in editor decision forms to attach review files
 */
export function ReviewAttachmentsSelector({
  files,
  reviewRounds,
  selectedAttachments,
  onSelectionChange,
  reviewRoundId,
  label = "Review Attachments",
}: Props) {
  const [selectedRound, setSelectedRound] = useState<string | undefined>(reviewRoundId);

  // Filter files to only show review attachments (files with stage "review")
  const reviewFiles = useMemo(() => {
    return files.filter((file) => file.stage === "review");
  }, [files]);

  // Get files for selected review round
  const roundFiles = useMemo(() => {
    if (!selectedRound) {
      return reviewFiles;
    }

    // Find the selected review round to get its round number
    const selectedRoundData = reviewRounds.find((round) => round.id === selectedRound);
    if (!selectedRoundData) {
      return reviewFiles;
    }

    // Filter files by round number
    return reviewFiles.filter((file) => file.round === selectedRoundData.round);
  }, [reviewFiles, reviewRounds, selectedRound]);

  // If no review rounds available, show all review files
  const availableFiles = reviewRounds.length > 0 ? roundFiles : reviewFiles;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      {/* Review Round Selector (if multiple rounds exist) */}
      {reviewRounds.length > 1 && (
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
            Review Round
          </label>
          <select
            title="Pilih review round"
            value={selectedRound || ""}
            onChange={(e) => setSelectedRound(e.target.value || undefined)}
            style={{
              height: "2.25rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: "#ffffff",
              paddingLeft: "0.75rem",
              paddingRight: "0.75rem",
              fontSize: "0.875rem",
              color: "#002C40",
              cursor: "pointer",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#006798";
              e.currentTarget.style.outline = "none";
              e.currentTarget.style.boxShadow = "0 0 0 0.2rem rgba(0, 103, 152, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e5e5e5";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <option value="">All Review Rounds</option>
            {reviewRounds.map((round) => (
              <option key={round.id} value={round.id}>
                Review Round {round.round} ({round.status})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Review Attachments Grid */}
      {availableFiles.length > 0 ? (
        <FileSelectionGrid
          files={availableFiles}
          selectedFiles={selectedAttachments}
          onSelectionChange={onSelectionChange}
          stage="review"
          multiple={true}
          label={label}
        />
      ) : (
        <div
          style={{
            padding: "1.5rem",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            backgroundColor: "#f8f9fa",
            borderRadius: "0.25rem",
            border: "1px solid #e5e5e5",
          }}
        >
          {selectedRound
            ? "No review attachments available for the selected review round."
            : "No review attachments available."}
        </div>
      )}

      {selectedAttachments.length > 0 && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "-0.5rem",
          }}
        >
          {selectedAttachments.length} review attachment{selectedAttachments.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}



