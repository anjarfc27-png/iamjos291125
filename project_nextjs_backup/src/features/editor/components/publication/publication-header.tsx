"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PkpButton } from "@/components/ui/pkp-button";
import type { SubmissionDetail, SubmissionVersion } from "../../types";
import { PublishScheduleModal } from "./publish-schedule-modal";
import { UnpublishModal } from "./unpublish-modal";
import { CreateVersionModal } from "./create-version-modal";

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  publicationStatus: "queued" | "scheduled" | "published";
  currentVersion: SubmissionVersion | undefined;
};

export function PublicationHeader({ submissionId, detail, publicationStatus, currentVersion }: Props) {
  const router = useRouter();
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [showCreateVersionModal, setShowCreateVersionModal] = useState(false);

  const getStatusLabel = () => {
    switch (publicationStatus) {
      case "published":
        return "Published";
      case "scheduled":
        return "Scheduled";
      case "queued":
      default:
        return "Unscheduled";
    }
  };

  const getStatusClass = () => {
    switch (publicationStatus) {
      case "published":
        return "pkpPublication__statusPublished";
      case "scheduled":
        return "";
      case "queued":
      default:
        return "pkpPublication__statusUnpublished";
    }
  };

  const handlePreview = () => {
    // TODO: Open preview in new window
    window.open(`/preview/${submissionId}`, "_blank");
  };

  const handlePublish = () => {
    setShowPublishModal(true);
  };

  const handleUnpublish = () => {
    setShowUnpublishModal(true);
  };

  const handleCreateVersion = () => {
    setShowCreateVersionModal(true);
  };

  const canPublish = detail.summary.stage === "production" || detail.summary.stage === "copyediting";
  const isPublished = publicationStatus === "published";
  const isScheduled = publicationStatus === "scheduled";

  return (
    <div
      className="pkpPublication__header"
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e5e5",
        padding: "1rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {/* Publication Status */}
        <div
          className="pkpPublication__status"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <strong
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Status:
          </strong>
          <span
            className={getStatusClass()}
            style={{
              fontSize: "0.875rem",
              color:
                publicationStatus === "published"
                  ? "#28a745"
                  : publicationStatus === "scheduled"
                  ? "#006798"
                  : "rgba(0, 0, 0, 0.54)",
              fontWeight: publicationStatus === "published" ? 600 : 400,
            }}
          >
            {getStatusLabel()}
          </span>
        </div>

        {/* Version Selector (if multiple versions) */}
        {detail.versions && detail.versions.length > 1 && (
          <div
            className="pkpPublication__version"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            <strong
              style={{
                fontWeight: 600,
                color: "#002C40",
              }}
            >
              Version:
            </strong>
            <span
              style={{
                color: "rgba(0, 0, 0, 0.84)",
              }}
            >
              {currentVersion?.version ?? 1}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {canPublish && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          {/* Preview Button */}
          {!isPublished && (
            <PkpButton
              variant="onclick"
              size="sm"
              onClick={handlePreview}
            >
              Preview
            </PkpButton>
          )}

          {/* Publish/Schedule Button */}
          {publicationStatus === "queued" && (
            <PkpButton
              variant="primary"
              size="sm"
              onClick={handlePublish}
            >
              {detail.summary.status === "published" ? "Publish" : "Schedule Publication"}
            </PkpButton>
          )}

          {/* Unschedule/Unpublish Button */}
          {(isScheduled || isPublished) && (
            <PkpButton
              variant="warnable"
              size="sm"
              onClick={handleUnpublish}
            >
              {isPublished ? "Unpublish" : "Unschedule"}
            </PkpButton>
          )}

          {/* Create Version Button */}
          <PkpButton
            variant="onclick"
            size="sm"
            onClick={handleCreateVersion}
          >
            Create Version
          </PkpButton>
        </div>
      )}

      {/* Modals */}
      {showPublishModal && (
        <PublishScheduleModal
          open={showPublishModal}
          onClose={() => setShowPublishModal(false)}
          submissionId={submissionId}
          currentVersion={currentVersion}
          isPublished={isPublished}
          scheduledDate={currentVersion?.publishedAt ?? null}
        />
      )}

      {showUnpublishModal && (
        <UnpublishModal
          open={showUnpublishModal}
          onClose={() => setShowUnpublishModal(false)}
          submissionId={submissionId}
          currentVersion={currentVersion}
          isScheduled={isScheduled}
        />
      )}

      {showCreateVersionModal && (
        <CreateVersionModal
          open={showCreateVersionModal}
          onClose={() => setShowCreateVersionModal(false)}
          submissionId={submissionId}
          currentVersion={currentVersion}
        />
      )}
    </div>
  );
}

