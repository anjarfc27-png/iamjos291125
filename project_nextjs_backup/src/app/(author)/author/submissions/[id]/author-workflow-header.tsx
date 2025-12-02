'use client';

import { useState } from 'react';
import { PkpButton } from "@/components/ui/pkp-button";
import type { SubmissionSummary, SubmissionStage } from "@/features/editor/types";
import { AuthorFileUploadModal } from './author-file-upload-modal';
import { AuthorLibraryModal } from './author-library-modal';

type Props = {
  submission: SubmissionSummary;
  authorName?: string;
  submissionId: string;
  currentStage?: SubmissionStage;
};

/**
 * Author Workflow Header
 * Based on OJS PKP 3.3 author dashboard header
 * Includes "Add File" and "Submission Library" buttons as per OJS 3.3
 */
export function AuthorWorkflowHeader({ submission, authorName = "—", submissionId, currentStage = 'submission' }: Props) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);

  // Determine if upload is allowed based on stage
  // In OJS 3.3, authors can upload files in submission and sometimes review/copyediting stages
  const canUploadFile = currentStage === 'submission' || currentStage === 'review' || currentStage === 'copyediting';

  return (
    <div
      className="pkpWorkflow__header"
      style={{
        borderBottom: "2px solid #e5e5e5",
        backgroundColor: "#ffffff",
        padding: "1rem 1.5rem",
        boxShadow: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1
          className="pkpWorkflow__identification"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "1rem",
            lineHeight: "1.5",
            margin: 0,
            padding: 0,
          }}
        >
          <span
            className="pkpWorkflow__identificationId"
            style={{
              fontWeight: 700,
              color: "#002C40",
            }}
          >
            {submission.id}
          </span>
          <span
            className="pkpWorkflow__identificationDivider"
            style={{
              color: "rgba(0, 0, 0, 0.54)",
              fontWeight: 400,
            }}
          >
            /
          </span>
          <span
            className="pkpWorkflow__identificationAuthor"
            style={{
              color: "#002C40",
            }}
          >
            {authorName}
          </span>
          <span
            className="pkpWorkflow__identificationDivider"
            style={{
              color: "rgba(0, 0, 0, 0.54)",
              fontWeight: 400,
            }}
          >
            /
          </span>
          <span
            className="pkpWorkflow__identificationTitle"
            style={{
              color: "#002C40",
              fontWeight: 500,
            }}
          >
            {submission.title}
          </span>
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {/* Action Buttons - OJS PKP 3.3 Style */}
          {canUploadFile && (
            <PkpButton
              variant="primary"
              onClick={() => setIsUploadModalOpen(true)}
            >
              Add File
            </PkpButton>
          )}
          <PkpButton
            variant="onclick"
            onClick={() => setIsLibraryModalOpen(true)}
          >
            Submission Library
          </PkpButton>
        </div>
      </div>

      {/* Modals */}
      {canUploadFile && (
        <AuthorFileUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          submissionId={submissionId}
          currentStage={currentStage}
        />
      )}
      <AuthorLibraryModal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
        submissionId={submissionId}
      />
    </div>
  );
}


