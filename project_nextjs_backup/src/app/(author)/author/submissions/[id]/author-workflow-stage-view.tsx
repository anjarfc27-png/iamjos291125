import { SubmissionFileGrid } from "@/features/editor/components/submission-file-grid";
import { ReviewRoundsPanel } from "@/features/editor/components/review-rounds-panel";
import type { SubmissionDetail, SubmissionStage } from "@/features/editor/types";
import { AuthorQueriesPanel } from "./author-queries-panel";

type Props = {
  detail: SubmissionDetail;
  stage: SubmissionStage;
};

/**
 * Author-specific Workflow Stage View
 * Read-only version without editorial actions
 */
export function AuthorWorkflowStageView({ detail, stage }: Props) {
  const { summary, files, reviewRounds } = detail;

  return (
    <div
      className="pkp_workflow_stage"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        padding: 0,
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        margin: 0,
      }}
    >
      {/* Files Section */}
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

      {/* Review Rounds Section - Only for Review stage */}
      {stage === "review" && reviewRounds.length > 0 && (
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

      {/* Production Files Section - Only for Production stage */}
      {stage === "production" && detail.versions?.[0]?.galleys && detail.versions[0].galleys.length > 0 && (
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
            Production Files (Galleys)
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "1rem",
          }}>
            {detail.versions[0].galleys.map((galley) => (
              <div
                key={galley.id}
                style={{
                  border: "1px solid #dee2e6",
                  borderRadius: "4px",
                  padding: "1rem",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <div style={{
                  fontWeight: 600,
                  color: "#002C40",
                  marginBottom: "0.5rem",
                }}>
                  {galley.label}
                </div>
                {galley.fileStoragePath && (
                  <div style={{
                    fontSize: "0.875rem",
                    color: "#666",
                    wordBreak: "break-all",
                  }}>
                    {galley.fileStoragePath}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Production Stage - Queries Grid & Submission Emails - OJS PKP 3.3 */}
      {stage === "production" && (
        <>
          {/* Submission Emails - OJS PKP 3.3 Style */}
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
              Submission Emails
            </h2>
            <div
              style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
                fontStyle: "italic",
                padding: "1rem",
                backgroundColor: "#f8f9fa",
                borderRadius: "0.25rem",
              }}
            >
              Email functionality akan diimplementasikan kemudian.
            </div>
          </div>

          {/* Queries Grid - OJS PKP 3.3 Style */}
          <div
            style={{
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: "#ffffff",
              padding: "1.5rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <AuthorQueriesPanel
              submissionId={summary.id}
              stage={stage}
              queries={detail.queries || []}
              participants={detail.participants}
            />
          </div>
        </>
      )}

      {/* Stage-specific information */}
      {stage === "submission" && (
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
            Submission Information
          </h2>
          <div style={{
            fontSize: "0.875rem",
            color: "#666",
            lineHeight: "1.6",
          }}>
            <p style={{ margin: "0.5rem 0" }}>
              <strong>Status:</strong> {summary.status}
            </p>
            <p style={{ margin: "0.5rem 0" }}>
              <strong>Stage:</strong> {summary.stage}
            </p>
            {summary.submittedAt && (
              <p style={{ margin: "0.5rem 0" }}>
                <strong>Submitted:</strong> {new Date(summary.submittedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

