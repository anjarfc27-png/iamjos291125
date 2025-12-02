import { SubmissionParticipantsPanel } from "./submission-participants-panel";
import { SubmissionFileGrid } from "./submission-file-grid";
import { ReviewRoundsPanel } from "./review-rounds-panel";
import { ProductionFilesPanel } from "./production-files/production-files-panel";
import { WorkflowStageActions } from "./workflow-stage-actions";
import { createGalley, updateGalley, deleteGalley } from "../actions/production-files";
import type { SubmissionDetail, SubmissionStage } from "../types";

type Props = {
  detail: SubmissionDetail;
  stage: SubmissionStage;
};

export function WorkflowStageView({ detail, stage }: Props) {
  const { summary, files, reviewRounds, participants } = detail;

  // Extract author name from metadata
  const authorName =
    (detail.metadata as { authors?: Array<{ givenName?: string; familyName?: string }> })?.authors?.[0]
      ? `${(detail.metadata as { authors?: Array<{ givenName?: string; familyName?: string }> })?.authors?.[0]?.givenName ?? ""} ${(detail.metadata as { authors?: Array<{ givenName?: string; familyName?: string }> })?.authors?.[0]?.familyName ?? ""}`.trim() || undefined
      : undefined;

  // Get current review round ID (if in review stage)
  const currentReviewRound = stage === "review" && reviewRounds.length > 0
    ? reviewRounds[reviewRounds.length - 1]?.id
    : undefined;

  const productionVersion = detail.versions?.[0];
  const productionFiles = files.filter((file) => file.stage === "production");

  return (
    <div
      className="pkp_workflow_stage"
      style={{
        display: "flex",
        gap: "1.5rem",
        padding: 0, // Padding di-handle di parent wrapper
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        margin: 0, // No margin - spacing dari parent
      }}
    >
      {/* Sidebar - OJS 3.3 Style */}
      <div
        className="pkp_workflow_sidebar"
        style={{
          width: "20rem",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div
          className="pkp_tab_actions"
          style={{
            borderRadius: "0",
            border: "none",
            backgroundColor: "#ffffff",
            padding: "1rem",
            boxShadow: "none",
          }}
        >
          <h3
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
              marginBottom: "0.75rem",
            }}
          >
            Editorial Actions
          </h3>
          <WorkflowStageActions
            submissionId={summary.id}
            currentStage={stage}
            status={summary.status}
            authorName={authorName}
            reviewRoundId={currentReviewRound}
            files={files}
            reviewRounds={reviewRounds}
            participants={participants}
          />
        </div>

        <div
          className="pkp_participants_grid"
          style={{
            borderRadius: "0",
            border: "none",
            backgroundColor: "#ffffff",
            padding: "1rem",
            boxShadow: "none",
          }}
        >
          <h3
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
              marginBottom: "0.75rem",
            }}
          >
            Participants
          </h3>
          <SubmissionParticipantsPanel 
            submissionId={summary.id} 
            journalId={summary.journalId}
            currentStage={stage}
          />
        </div>
      </div>

      {/* Content - OJS 3.3 Style with Modern Spacing */}
      <div
        className="pkp_workflow_content"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          minWidth: 0, // Prevent flex item from overflowing
          maxWidth: '100%',
        }}
      >
        <div
          style={{
            borderRadius: "0.25rem",
            border: "1px solid #e5e5e5",
            backgroundColor: "#ffffff",
            padding: "1.5rem",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#002C40",
              marginBottom: "1rem",
            }}
          >
            Files
          </h2>
          <SubmissionFileGrid submissionId={summary.id} stage={stage} files={files} />
        </div>

        {stage === "review" && (
          <div
            style={{
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: "#ffffff",
              padding: "1.5rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "#002C40",
                marginBottom: "1rem",
              }}
            >
              Review Rounds
            </h2>
            <ReviewRoundsPanel submissionId={summary.id} rounds={reviewRounds} journalId={summary.journalId} />
          </div>
        )}

        {stage === "production" && productionVersion && (
          <div
            style={{
              borderRadius: "0",
              border: "none",
              backgroundColor: "#ffffff",
              padding: "1.5rem",
              boxShadow: "none",
            }}
          >
            <h2
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "#002C40",
                marginBottom: "1rem",
              }}
            >
              Production Files (Galleys)
            </h2>
            <ProductionFilesPanel
              submissionId={summary.id}
              stage={stage}
              submissionVersionId={productionVersion.id}
              galleys={productionVersion.galleys}
              availableFiles={productionFiles}
              onCreateGalley={async (data) => {
                const result = await createGalley(data);
                if (!result.ok) {
                  throw new Error(result.error ?? "Failed to create galley");
                }
              }}
              onUpdateGalley={async (data) => {
                const result = await updateGalley(data);
                if (!result.ok) {
                  throw new Error(result.error ?? "Failed to update galley");
                }
              }}
              onDeleteGalley={async (galleyId) => {
                const result = await deleteGalley(galleyId);
                if (!result.ok) {
                  throw new Error(result.error ?? "Failed to delete galley");
                }
              }}
            />
          </div>
        )}
        {stage === "production" && !productionVersion && (
          <div
            style={{
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: "#ffffff",
              padding: "1.5rem",
            }}
          >
            <p className="text-sm text-[var(--muted)]">
              Belum ada versi publikasi yang dapat dikelola. Buat versi publikasi terlebih dahulu di tab Publication.
            </p>
          </div>
        )}

        {/* Queries section - placeholder for future implementation */}
        <div
          style={{
            borderRadius: "0",
            border: "none",
            backgroundColor: "#ffffff",
            padding: "1.5rem",
            boxShadow: "none",
          }}
        >
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#002C40",
              marginBottom: "1rem",
            }}
          >
            Queries
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.54)",
            }}
          >
            Queries feature akan diimplementasikan kemudian.
          </p>
        </div>
      </div>
    </div>
  );
}

