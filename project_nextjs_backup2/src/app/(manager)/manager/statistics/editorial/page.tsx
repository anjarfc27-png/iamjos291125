import Link from "next/link";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type SummaryRow = {
  label: string;
  value: number;
};

type SubmissionStageSummary = {
  stage: string;
  count: number;
};

export const dynamic = "force-dynamic";

export default async function ManagerEditorialStatsPage() {
  const supabase = getSupabaseAdminClient();

  const [submissionCounts, stageCounts] = await Promise.all([
    supabase
      .from("submissions")
      .select("status")
      .then(({ data }) => summarizeStatus(data ?? [])),
    supabase
      .from("submissions")
      .select("current_stage")
      .then(({ data }) => summarizeStage(data ?? [])),
  ]);

  return (
    <div style={{ minHeight: "100%", backgroundColor: "#eaedee" }}>
      <div
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #dfe3e6",
          padding: "1.5rem 2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#002C40" }}>Editorial Statistics</h1>
            <p style={{ margin: "0.35rem 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
              Ringkasan aktivitas editorial dan status submission.
            </p>
          </div>
          <Link
            href="/manager/statistics/publications"
            style={{
              color: "#006798",
              textDecoration: "none",
              fontSize: "0.85rem",
            }}
          >
            Lihat publikasi →
          </Link>
        </div>
      </div>

      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <StatsGrid title="Submission Status" rows={submissionCounts} />
        <StatsGrid title="Current Stage" rows={stageCounts} />
      </div>
    </div>
  );
}

function summarizeStatus(rows: { status?: string | null }[]): SummaryRow[] {
  const counter = new Map<string, number>();
  rows.forEach((row) => {
    const status = String(row.status ?? "unknown");
    counter.set(status, (counter.get(status) ?? 0) + 1);
  });
  return Array.from(counter.entries()).map(([label, value]) => ({ label, value }));
}

function summarizeStage(rows: { current_stage?: string | null }[]): SummaryRow[] {
  const counter = new Map<string, number>();
  rows.forEach((row) => {
    const stage = String(row.current_stage ?? "unknown");
    counter.set(stage, (counter.get(stage) ?? 0) + 1);
  });
  return Array.from(counter.entries()).map(([label, value]) => ({ label, value }));
}

function StatsGrid({ title, rows }: { title: string; rows: SummaryRow[] }) {
  return (
    <div
      style={{
        border: "1px solid #dfe3e6",
        borderRadius: "4px",
        backgroundColor: "#fff",
        padding: "1.5rem 1.75rem",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "0.75rem",
          marginBottom: "1.25rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#002C40" }}>{title}</h2>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {rows.map((row) => (
          <div
            key={row.label}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "3px",
              padding: "0.85rem 1rem",
              backgroundColor: "#f8fafc",
            }}
          >
            <div style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.08em" }}>
              {row.label}
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#002C40" }}>{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

