import { StageBadge } from "./stage-badge";
import { WorkflowStageActions } from "./workflow-stage-actions";
import { SubmissionParticipantsPanel } from "./submission-participants-panel";
import { SubmissionActivityForm } from "./submission-activity-form";
import { SubmissionFileGrid } from "./submission-file-grid";
import { ReviewRoundsPanel } from "./review-rounds-panel";
import { SubmissionMetadataForm } from "./submission-metadata-form";
import { QueriesPanel } from "./queries/queries-panel";
import type { SubmissionDetail, SubmissionStage } from "../types";

type Props = {
  detail: SubmissionDetail;
};

export function SubmissionWorkflowView({ detail }: Props) {
  const { summary, versions, files, activity, metadata, participants, queries = [] } = detail;

  // Extract metadata
  const authors = (metadata as { authors?: Array<{ givenName?: string; familyName?: string; affiliation?: string; email?: string }> })?.authors ?? [];
  const abstract = (metadata as { abstract?: string | null })?.abstract ?? null;
  const keywords = (metadata as { keywords?: string[] | null })?.keywords ?? null;
  const categories = (metadata as { categories?: string[] | null })?.categories ?? null;
  const subjects = (metadata as { subjects?: string[] | null })?.subjects ?? null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        padding: 0, // Padding di-handle di parent wrapper
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        margin: 0, // No margin - spacing dari parent
      }}
    >
      {/* Submission Summary - OJS 3.3 Exact Layout */}
      <section
        style={{
          borderRadius: "0",
          border: "none",
          borderBottom: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          boxShadow: "none",
        }}
      >
        <header
          style={{
            marginBottom: "1rem",
          }}
        >
          <h1
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#002C40",
              marginBottom: "0.75rem",
              lineHeight: "1.5",
            }}
          >
            {summary.title}
          </h1>
          
          {/* Authors */}
          {authors.length > 0 && (
            <div
              style={{
                marginBottom: "0.5rem",
                fontSize: "0.875rem",
                color: "#002C40",
                fontWeight: 500,
              }}
            >
              {authors.map((author, idx) => (
                <span key={idx}>
                  {author.givenName ?? ""} {author.familyName ?? ""}
                  {author.affiliation && ` (${author.affiliation})`}
                  {idx < authors.length - 1 && ", "}
                </span>
              ))}
            </div>
          )}

          {/* Abstract */}
          {abstract && (
            <div
              className="abstract"
              style={{
                marginTop: "0.75rem",
                marginBottom: "0.75rem",
                fontSize: "0.875rem",
                lineHeight: "1.6",
                color: "rgba(0, 0, 0, 0.84)",
              }}
            >
              {abstract}
            </div>
          )}

          {/* Metadata Table - OJS 3.3 Style with Modern Spacing */}
          <div
            style={{
              marginTop: "1rem",
              borderTop: "1px solid #e5e5e5",
              paddingTop: "1rem",
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '100%',
                overflowX: 'auto',
                overflowY: 'visible',
              }}
            >
              <table
                className="pkpTable"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.875rem",
                  minWidth: '100%',
                }}
              >
              <tbody>
                <tr>
                  <th
                    scope="row"
                    style={{
                      padding: "0.5rem 1rem 0.5rem 0",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#002C40",
                      width: "30%",
                      verticalAlign: "top",
                    }}
                  >
                    Journal
                  </th>
                  <td
                    style={{
                      padding: "0.5rem 0",
                      color: "rgba(0, 0, 0, 0.84)",
                    }}
                  >
                    {summary.journalTitle ?? "—"}
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    style={{
                      padding: "0.5rem 1rem 0.5rem 0",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#002C40",
                      verticalAlign: "top",
                    }}
                  >
                    Submission ID
                  </th>
                  <td
                    style={{
                      padding: "0.5rem 0",
                      color: "rgba(0, 0, 0, 0.84)",
                    }}
                  >
                    {summary.id}
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    style={{
                      padding: "0.5rem 1rem 0.5rem 0",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#002C40",
                      verticalAlign: "top",
                    }}
                  >
                    Stage
                  </th>
                  <td
                    style={{
                      padding: "0.5rem 0",
                      color: "rgba(0, 0, 0, 0.84)",
                    }}
                  >
                    <StageBadge stage={summary.stage} />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    style={{
                      padding: "0.5rem 1rem 0.5rem 0",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#002C40",
                      verticalAlign: "top",
                    }}
                  >
                    Status
                  </th>
                  <td
                    style={{
                      padding: "0.5rem 0",
                      color: "rgba(0, 0, 0, 0.84)",
                    }}
                  >
                    {summary.status}
                  </td>
                </tr>
                {keywords && keywords.length > 0 && (
                  <tr>
                    <th
                      scope="row"
                      style={{
                        padding: "0.5rem 1rem 0.5rem 0",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#002C40",
                        verticalAlign: "top",
                      }}
                    >
                      Keywords
                    </th>
                    <td
                      style={{
                        padding: "0.5rem 0",
                        color: "rgba(0, 0, 0, 0.84)",
                      }}
                    >
                      {keywords.join(", ")}
                    </td>
                  </tr>
                )}
                {categories && categories.length > 0 && (
                  <tr>
                    <th
                      scope="row"
                      style={{
                        padding: "0.5rem 1rem 0.5rem 0",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#002C40",
                        verticalAlign: "top",
                      }}
                    >
                      Categories
                    </th>
                    <td
                      style={{
                        padding: "0.5rem 0",
                        color: "rgba(0, 0, 0, 0.84)",
                      }}
                    >
                      {categories.join(", ")}
                    </td>
                  </tr>
                )}
                <tr>
                  <th
                    scope="row"
                    style={{
                      padding: "0.5rem 1rem 0.5rem 0",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#002C40",
                      verticalAlign: "top",
                    }}
                  >
                    Submitted
                  </th>
                  <td
                    style={{
                      padding: "0.5rem 0",
                      color: "rgba(0, 0, 0, 0.84)",
                    }}
                  >
                    {formatDate(summary.submittedAt)}
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    style={{
                      padding: "0.5rem 1rem 0.5rem 0",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#002C40",
                      verticalAlign: "top",
                    }}
                  >
                    Last Updated
                  </th>
                  <td
                    style={{
                      padding: "0.5rem 0",
                      color: "rgba(0, 0, 0, 0.84)",
                    }}
                  >
                    {formatDate(summary.updatedAt)}
                  </td>
                </tr>
              </tbody>
              </table>
            </div>
          </div>

          {/* Editorial Actions */}
          <div
            style={{
              marginTop: "1.5rem",
              borderTop: "1px solid #e5e5e5",
              paddingTop: "1rem",
            }}
          >
            <WorkflowStageActions 
              submissionId={summary.id} 
              currentStage={summary.stage} 
              status={summary.status}
              authorName={authors.length > 0 ? `${authors[0]?.givenName ?? ""} ${authors[0]?.familyName ?? ""}`.trim() : undefined}
              files={files}
              reviewRounds={detail.reviewRounds}
            />
          </div>
        </header>
      </section>

      {/* Participants - OJS 3.3 Exact Layout */}
      <section
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
          Participants
        </h2>
        <SubmissionParticipantsPanel submissionId={summary.id} journalId={summary.journalId} currentStage={summary.stage} />
      </section>

      {/* Metadata Form - OJS 3.3 Exact Layout */}
      <section
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
            marginBottom: "0.5rem",
          }}
        >
          Metadata
        </h2>
        <p
          style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginBottom: "1rem",
          }}
        >
          Edit judul, abstrak, dan kata kunci submission.
        </p>
        <SubmissionMetadataForm
          submissionId={summary.id}
          initialTitle={summary.title}
          initialAbstract={(detail.metadata as { abstract?: string | null } | null)?.abstract ?? null}
          initialKeywords={(detail.metadata as { keywords?: string[] | null } | null)?.keywords ?? null}
        />
      </section>

      {/* Versions - OJS 3.3 Exact Layout */}
      <section
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
          Versions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {versions.length === 0 && (
            <p
              style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
              }}
            >
              Belum ada versi yang disimpan.
            </p>
          )}
          {versions.map((version) => (
            <div
              key={version.id}
              style={{
                borderRadius: "0.25rem",
                border: "1px solid #e5e5e5",
                backgroundColor: "#f8f9fa",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  marginBottom: "0.25rem",
                }}
              >
                <strong
                  style={{
                    color: "#002C40",
                    fontWeight: 600,
                  }}
                >
                  Version {version.version}
                </strong>
                <span
                  style={{
                    color: "rgba(0, 0, 0, 0.54)",
                    fontSize: "0.875rem",
                  }}
                >
                  {formatDate(version.createdAt)}
                </span>
              </div>
              <p
                style={{
                  color: "rgba(0, 0, 0, 0.54)",
                  fontSize: "0.875rem",
                  margin: 0,
                }}
              >
                Status: {version.status}
                {version.issue?.title && ` · Issue ${version.issue.volume ?? ""} (${version.issue.year ?? ""})`}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Files Sections - OJS 3.3 Style */}
      {renderFileSection("Submission Files", "submission", summary.id, files)}
      {renderFileSection("Review Files", "review", summary.id, files)}
      {renderFileSection("Copyediting Files", "copyediting", summary.id, files)}
      {renderFileSection("Production Files", "production", summary.id, files)}

      {/* Review Rounds - OJS 3.3 Exact Layout */}
      <section
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
          Review Rounds
        </h2>
        <ReviewRoundsPanel submissionId={summary.id} rounds={detail.reviewRounds} journalId={summary.journalId} />
      </section>

      {/* Activity Log - OJS 3.3 Exact Layout */}
      <section
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
          Activity Log
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
          {activity.length === 0 && (
            <p
              style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
              }}
            >
              Belum ada aktivitas tercatat.
            </p>
          )}
          {activity.map((log) => (
            <div
              key={log.id}
              style={{
                borderRadius: "0.25rem",
                border: "1px solid #e5e5e5",
                backgroundColor: "#f8f9fa",
                padding: "0.75rem 1rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#002C40",
                  marginBottom: "0.25rem",
                }}
              >
                {log.category}
              </p>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "rgba(0, 0, 0, 0.84)",
                  marginBottom: "0.25rem",
                }}
              >
                {log.message}
              </p>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                }}
              >
                {formatDate(log.createdAt)}
              </span>
            </div>
          ))}
        </div>
        <SubmissionActivityForm submissionId={summary.id} />
      </section>

      {/* Queries/Discussions Section - OJS 3.3 Exact Layout */}
      <section
        style={{
          borderRadius: "0",
          border: "none",
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          boxShadow: "none",
        }}
      >
        <QueriesPanel
          submissionId={summary.id}
          stage={summary.stage}
          queries={queries}
          participants={participants.map((p) => ({
            userId: p.userId,
            name: p.name ?? p.userId,
            role: p.role,
            stage: p.stage,
          }))}
        />
      </section>
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function renderFileSection(title: string, stage: SubmissionStage, submissionId: string, files: SubmissionDetail["files"]) {
  // Filter files by stage
  const stageFiles = files.filter((f) => f.stage === stage);
  
  // Skip empty sections
  if (stageFiles.length === 0) {
    return null;
  }

  return (
    <section
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
        {title}
      </h2>
      <SubmissionFileGrid submissionId={submissionId} stage={stage} files={stageFiles} allFiles={files} />
    </section>
  );
}

