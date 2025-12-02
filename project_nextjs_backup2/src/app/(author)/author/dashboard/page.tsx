import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type SubmissionRow = {
  id: string;
  title: string | null;
  journal_id: string | null;
  current_stage: string | null;
  status: string | null;
  submitted_at: string | null;
  updated_at: string | null;
};

type JournalRow = {
  id: string;
  title: string | null;
  name: string | null;
};

function getStageColor(stage: string) {
  switch (stage.toLowerCase()) {
    case "submission":
      return { bg: "#fee", color: "#721c24" };
    case "review":
      return { bg: "#fff3cd", color: "#856404" };
    case "copyediting":
      return { bg: "#d1ecf1", color: "#0c5460" };
    case "production":
      return { bg: "#d4edda", color: "#155724" };
    default:
      return { bg: "#e2e3e5", color: "#383d41" };
  }
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "submitted":
      return { bg: "#e2e3e5", color: "#383d41" };
    case "under review":
    case "revision required":
      return { bg: "#fff3cd", color: "#856404" };
    case "accepted":
      return { bg: "#d4edda", color: "#155724" };
    case "rejected":
      return { bg: "#f8d7da", color: "#721c24" };
    default:
      return { bg: "#e2e3e5", color: "#383d41" };
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toISOString().split("T")[0];
}

function getDaysInStage(updatedAt: string | null, createdAt: string | null) {
  const base = updatedAt || createdAt;
  if (!base) {
    return 0;
  }
  const ts = new Date(base).getTime();
  if (Number.isNaN(ts)) {
    return 0;
  }
  const diff = Date.now() - ts;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export default async function AuthorDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/login?source=%2Fauthor%2Fdashboard");
  }

  const admin = getSupabaseAdminClient();

  // Ambil semua submission_id di mana user ini menjadi author via stage_assignments
  // OJS 3.3 uses stage_assignments to link users to submissions
  const {
    data: assignmentRows,
    error: assignmentError,
  } = await admin
    .from("stage_assignments")
    .select("submission_id")
    .eq("user_id", session!.user.id)
    .order("date_assigned", { ascending: false });

  if (assignmentError) {
    console.error("Error loading author stage assignments:", assignmentError.message);
  }

  const submissionIds =
    assignmentRows?.map((row: { submission_id: string }) => row.submission_id) ?? [];

  let submissionsRows: SubmissionRow[] = [];
  if (submissionIds.length > 0) {
    // Select stage_id and status as integers
    const { data: submissionsData } = await admin
      .from("submissions")
      .select("id, title:current_publication_id(title), journal_id:context_id, stage_id, status, date_submitted, last_modified")
      .in("id", submissionIds)
      .order("last_modified", { ascending: false });

    // Note: title is in publication_settings usually, or publications table. 
    // In 2024 schema, submissions has current_publication_id. 
    // We need to fetch title from publication_settings or publications.
    // The query above tries to use a join but Supabase join syntax is tricky with dynamic keys.
    // Let's simplify: fetch submissions, then fetch titles.

    // Re-fetch with simpler query
    const { data: simpleSubmissions } = await admin
      .from("submissions")
      .select("id, context_id, stage_id, status, date_submitted, last_modified, current_publication_id")
      .in("id", submissionIds)
      .order("last_modified", { ascending: false });

    if (simpleSubmissions) {
      // Fetch titles from publication_settings
      const pubIds = simpleSubmissions.map(s => s.current_publication_id).filter(Boolean);
      let titleMap = new Map<string, string>();

      if (pubIds.length > 0) {
        const { data: titles } = await admin
          .from("publication_settings")
          .select("publication_id, setting_value")
          .in("publication_id", pubIds)
          .eq("setting_name", "title"); // Assuming 'title' setting exists

        titles?.forEach((t: any) => titleMap.set(t.publication_id, t.setting_value));
      }

      submissionsRows = simpleSubmissions.map((s: any) => ({
        id: s.id,
        title: titleMap.get(s.current_publication_id) || "Untitled",
        journal_id: s.context_id,
        current_stage: s.stage_id,
        status: s.status,
        submitted_at: s.date_submitted,
        updated_at: s.last_modified
      }));
    }
  }

  const journalIds = Array.from(
    new Set(submissionsRows.map((row) => row.journal_id).filter((id): id is string => Boolean(id)))
  );

  let journalMap = new Map<string, string>();
  if (journalIds.length > 0) {
    const { data: journals } = await admin
      .from("journals")
      .select("id, path") // Journals usually have 'path' or 'name' in settings. 
      // Let's assume 'path' is available in journals table or we need settings.
      // For simplicity, let's try to get 'path' which is often the name/code.
      .in("id", journalIds);

    // If we need full name, we need journal_settings. 
    // Let's stick to simple journals query for now, assuming 'path' exists.
    // If not, we might show ID.

    journalMap = new Map(
      ((journals as any[] | null) ?? []).map((journal) => [journal.id, journal.path || "Journal"])
    );
  }

  const submissions = submissionsRows.map((row) => {
    // Map stage_id (int) to string
    // 1=Submission, 3=Review, 4=Copyediting, 5=Production
    const stageMap: Record<number, string> = {
      1: "Submission",
      3: "Review",
      4: "Copyediting",
      5: "Production"
    };
    const stage = stageMap[Number(row.current_stage)] || "Unknown";

    // Map status (int) to string
    // 1=Queued, 3=Published, 4=Declined
    const statusMap: Record<number, string> = {
      1: "Queued",
      3: "Published",
      4: "Declined"
    };
    const status = statusMap[Number(row.status)] || "Unknown";

    return {
      id: row.id,
      title: row.title ?? "Untitled",
      journal: journalMap.get(row.journal_id ?? "") ?? "Unknown Journal",
      stage,
      status,
      dateSubmitted: formatDate(row.submitted_at),
      daysInStage: getDaysInStage(row.updated_at, row.submitted_at),
      decision: status.toLowerCase() === "published" ? "Accept" : null,
    };
  });

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          borderBottom: "2px solid #e5e5e5",
          paddingBottom: "1rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#002C40",
              margin: 0,
              marginBottom: "0.25rem",
            }}
          >
            My Submissions
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#666",
              margin: 0,
            }}
          >
            Submit and track your manuscript submissions
          </p>
        </div>
        <Link
          href="/author/submission/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "#006798",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 600,
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "4px",
            textDecoration: "none",
          }}
        >
          <Plus style={{ width: "1rem", height: "1rem" }} />
          New Submission
        </Link>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid #e5e5e5",
            backgroundColor: "#f8f9fa",
          }}
        >
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "#002C40",
              margin: 0,
            }}
          >
            Submission History
          </h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f8f9fa",
                  borderBottom: "1px solid #e5e5e5",
                }}
              >
                {["ID", "Title", "Journal", "Stage", "Status", "Date Submitted", "Days in Stage", "Decision", "Actions"].map(
                  (label) => (
                    <th
                      key={label}
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: "#002C40",
                        borderRight: label === "Actions" ? "none" : "1px solid #e5e5e5",
                      }}
                    >
                      {label}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      fontSize: "0.875rem",
                      color: "#666",
                      fontStyle: "italic",
                    }}
                  >
                    No submissions found. Click "New Submission" to get started.
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => {
                  const stageColors = getStageColor(submission.stage);
                  const statusColors = getStatusColor(submission.status);
                  return (
                    <tr
                      key={submission.id}
                      style={{
                        borderBottom: "1px solid #e5e5e5",
                        backgroundColor: "#fff",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          fontSize: "0.875rem",
                          color: "#333",
                          borderRight: "1px solid #e5e5e5",
                          fontWeight: 600,
                        }}
                      >
                        {submission.id}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          fontSize: "0.875rem",
                          color: "#333",
                          borderRight: "1px solid #e5e5e5",
                          maxWidth: "300px",
                        }}
                      >
                        <Link
                          href={`/author/submissions/${submission.id}`}
                          style={{
                            fontWeight: 500,
                            color: "#006798",
                            textDecoration: "none",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
                          }}
                        >
                          {submission.title}
                        </Link>
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          fontSize: "0.875rem",
                          color: "#333",
                          borderRight: "1px solid #e5e5e5",
                        }}
                      >
                        {submission.journal}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          fontSize: "0.875rem",
                          borderRight: "1px solid #e5e5e5",
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: stageColors.bg,
                            color: stageColors.color,
                            fontSize: "0.75rem",
                            padding: "0.125rem 0.5rem",
                            borderRadius: "4px",
                            fontWeight: 600,
                            display: "inline-block",
                          }}
                        >
                          {submission.stage}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          fontSize: "0.875rem",
                          borderRight: "1px solid #e5e5e5",
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: statusColors.bg,
                            color: statusColors.color,
                            fontSize: "0.75rem",
                            padding: "0.125rem 0.5rem",
                            borderRadius: "4px",
                            fontWeight: 600,
                            display: "inline-block",
                          }}
                        >
                          {submission.status}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          fontSize: "0.875rem",
                          color: "#333",
                          borderRight: "1px solid #e5e5e5",
                        }}
                      >
                        {submission.dateSubmitted}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          fontSize: "0.875rem",
                          color: "#333",
                          borderRight: "1px solid #e5e5e5",
                        }}
                      >
                        {submission.daysInStage}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          fontSize: "0.875rem",
                          color: "#333",
                          borderRight: "1px solid #e5e5e5",
                        }}
                      >
                        {submission.decision ?? "-"}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          fontSize: "0.875rem",
                          color: "#333",
                        }}
                      >
                        <Link
                          href={`/author/submissions/${submission.id}`}
                          style={{
                            color: "#006798",
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                        >
                          View Submission
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
