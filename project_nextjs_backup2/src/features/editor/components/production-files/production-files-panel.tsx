"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormMessage } from "@/components/ui/form-message";
import { GalleyGrid } from "./galley-grid";
import { GalleyCreationModal } from "./galley-creation-modal";
import { GalleyEditor } from "./galley-editor";
import type { PublicationGalley, SubmissionFile, SubmissionStage } from "../../types";
import { PkpButton } from "@/components/ui/pkp-button";

type Props = {
  submissionId: string;
  stage: SubmissionStage;
  submissionVersionId: string;
  galleys: PublicationGalley[];
  availableFiles?: SubmissionFile[];
  onCreateGalley?: (data: {
    submissionId: string;
    stage: SubmissionStage;
    submissionVersionId: string;
    label: string;
    locale: string;
    fileId?: string;
    remoteUrl?: string;
  }) => Promise<void>;
  onUpdateGalley?: (data: {
    galleyId: string;
    submissionVersionId: string;
    label: string;
    locale: string;
    isApproved: boolean;
    fileId?: string;
    remoteUrl?: string;
  }) => Promise<void>;
  onDeleteGalley?: (galleyId: string) => Promise<void>;
};

/**
 * Production Files Panel
 * Displays and manages galleys for production stage
 * Based on OJS PKP 3.3 production stage file management
 */
export function ProductionFilesPanel({
  submissionId,
  stage,
  submissionVersionId,
  galleys,
  availableFiles = [],
  onCreateGalley,
  onUpdateGalley,
  onDeleteGalley,
}: Props) {
  const router = useRouter();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedGalley, setSelectedGalley] = useState<PublicationGalley | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const handleCreateGalley = async (data: {
    submissionId: string;
    stage: SubmissionStage;
    submissionVersionId: string;
    label: string;
    locale: string;
    fileId?: string;
    remoteUrl?: string;
  }) => {
    if (!onCreateGalley) return;

    setFeedback(null);
    try {
      await onCreateGalley(data);
      setFeedback({ tone: "success", message: "Galley created successfully" });
      setOpenCreateModal(false);
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to create galley",
      });
      throw error;
    }
  };

  const handleUpdateGalley = async (data: {
    galleyId: string;
    submissionVersionId: string;
    label: string;
    locale: string;
    isApproved: boolean;
    fileId?: string;
    remoteUrl?: string;
  }) => {
    if (!onUpdateGalley) return;

    setFeedback(null);
    try {
      await onUpdateGalley(data);
      setFeedback({ tone: "success", message: "Galley updated successfully" });
      setOpenEditModal(false);
      setSelectedGalley(null);
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to update galley",
      });
      throw error;
    }
  };

  const handleDeleteGalley = async (galleyId: string) => {
    if (!onDeleteGalley) return;

    setFeedback(null);
    try {
      await onDeleteGalley(galleyId);
      setFeedback({ tone: "success", message: "Galley deleted successfully" });
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to delete galley",
      });
      throw error;
    }
  };

  const handleEdit = (galleyId: string) => {
    const galley = galleys.find((g) => g.id === galleyId);
    if (galley) {
      setSelectedGalley(galley);
      setOpenEditModal(true);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Production Files (Galleys) ({galleys.length})
          </h3>
          {onCreateGalley && (
            <PkpButton size="sm" variant="primary" onClick={() => setOpenCreateModal(true)}>
              Create Galley
            </PkpButton>
          )}
        </div>

        {feedback && (
          <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
        )}

        <GalleyGrid
          submissionId={submissionId}
          stage={stage}
          galleys={galleys}
          onEdit={onUpdateGalley ? handleEdit : undefined}
          onDelete={onDeleteGalley ? handleDeleteGalley : undefined}
        />
      </div>

      {/* Create Galley Modal */}
      {openCreateModal && onCreateGalley && (
        <GalleyCreationModal
          open={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
          submissionId={submissionId}
          stage={stage}
          submissionVersionId={submissionVersionId}
          availableFiles={availableFiles}
          onSubmit={handleCreateGalley}
        />
      )}

      {/* Edit Galley Modal */}
      {openEditModal && selectedGalley && onUpdateGalley && (
        <GalleyEditor
          open={openEditModal}
          onClose={() => {
            setOpenEditModal(false);
            setSelectedGalley(null);
          }}
          submissionId={submissionId}
          stage={stage}
          galley={selectedGalley}
          submissionVersionId={submissionVersionId}
          availableFiles={availableFiles}
          onSubmit={handleUpdateGalley}
        />
      )}
    </>
  );
}
