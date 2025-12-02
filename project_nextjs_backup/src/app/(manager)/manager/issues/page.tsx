import Link from "next/link";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import type { IssueRow } from "@/features/editor/types";

export const dynamic = "force-dynamic";

type IssueRecord = {
  id: string;
  volume?: number | null;
  number?: number | string | null;
  year?: number | null;
  published?: boolean | null;
  date_published?: string | null;
  title?: string | null;
};

function mapIssue(row: IssueRecord): IssueRow {
  return {
    id: row.id,
    volume: row.volume ?? null,
    number:
      row.number == null
        ? null
        : typeof row.number === "number"
          ? row.number
          : Number.isNaN(Number(row.number))
            ? null
            : Number(row.number),
    year: row.year ?? null,
    status: row.published ? "published" : ("draft" as IssueRow["status"]),
    publishedAt: row.date_published ?? null,
    title: row.title ?? `Vol. ${row.volume ?? "-"}, No. ${row.number ?? "-"} (${row.year ?? "-"})`,
  };
}

export default async function ManagerIssuesPage() {
  const supabase = getSupabaseAdminClient();

  // Coba batasi ke jurnal pertama jika ada, supaya konsisten dengan konteks Manager
  const { data: journals } = await supabase.from("journals").select("id").limit(1);
  const journalId = journals && journals.length > 0 ? (journals[0].id as string) : null;

  let query = supabase
    .from("issues")
    .select("id, journal_id, volume, number, year, published, date_published, issue_settings(setting_name, setting_value)");

  if (journalId) {
    query = query.eq("journal_id", journalId);
  }

  const { data, error } = await query
    .order("year", { ascending: false })
    .order("volume", { ascending: false })
    .order("number", { ascending: false })
    .limit(50);

  const issues = ((data ?? []) as any[]).map((row) => {
    const titleSetting = row.issue_settings?.find((setting: any) => setting.setting_name === "title");
    return mapIssue({
      id: row.id,
      volume: row.volume,
      number: row.number,
      year: row.year,
      published: row.published,
      date_published: row.date_published,
      title: titleSetting?.setting_value ?? null,
    });
  });

  const loadError = error ? (error as { message?: string }).message ?? null : null;

  return (
    <div>
      <div
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #dfe3e6",
          padding: "1.25rem 1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#002C40" }}>Issues</h1>
            <p style={{ margin: "0.35rem 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
              Kelola daftar edisi terbitan, penjadwalan, dan status publikasi.
            </p>
          </div>
          <Link
            href="/manager/issues/new"
            style={{
              backgroundColor: "#006798",
              color: "#fff",
              padding: "0.45rem 1rem",
              borderRadius: "3px",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            Create Issue
          </Link>
        </div>
      </div>

      <div
        style={{
          padding: "1.5rem",
        }}
      >
        {loadError ? (
          <div
            style={{
              border: "1px solid #fecaca",
              backgroundColor: "#fee2e2",
              padding: "1rem 1.25rem",
              color: "#991b1b",
              borderRadius: "4px",
            }}
          >
            Gagal memuat issues: {loadError}
          </div>
        ) : (
          <div style={{ border: "1px solid #dfe3e6", borderRadius: "4px", backgroundColor: "#fff", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", color: "#1f2937" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", color: "#4b5563", textTransform: "uppercase", fontSize: "0.75rem" }}>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Issue</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Volume</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Number</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Year</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Published</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
                      Belum ada issue terdaftar.
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr key={issue.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>{issue.title}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>{issue.volume ?? "—"}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>{issue.number ?? "—"}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>{issue.year ?? "—"}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>{issue.status}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>{issue.publishedAt ? formatDate(issue.publishedAt) : "—"}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                          <Link href={`/manager/issues/${issue.id}`} style={actionStyle()}>
                            View
                          </Link>
                          <Link href={`/manager/issues/${issue.id}/edit`} style={actionStyle()}>
                            Edit
                          </Link>
                          <Link href={`/manager/issues/${issue.id}#schedule`} style={actionStyle()}>
                            Schedule
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return value;
  }
}

function actionStyle(): React.CSSProperties {
  return {
    padding: "0.35rem 0.75rem",
    borderRadius: "3px",
    border: "1px solid #d1d5db",
    fontSize: "0.8rem",
    textDecoration: "none",
    color: "#006798",
    backgroundColor: "#fff",
  };
}

