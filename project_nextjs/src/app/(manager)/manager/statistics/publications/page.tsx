import Link from "next/link";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type MonthlyRow = {
  month: string;
  count: number;
};

export const dynamic = "force-dynamic";

export default async function ManagerPublicationStatsPage() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.rpc("submission_monthly_counts");

  const rows: MonthlyRow[] = Array.isArray(data)
    ? data.map((item: any) => ({
        month: item.month_label ?? "Unknown",
        count: Number(item.count ?? 0),
      }))
    : [];

  const loadError = error ? (error as { message?: string }).message ?? String(error) : null;

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
            <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#002C40" }}>Publication Statistics</h1>
            <p style={{ margin: "0.35rem 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
              Ringkasan publikasi per bulan untuk membantu perencanaan issue.
            </p>
          </div>
          <Link href="/manager/statistics/users" style={{ color: "#006798", textDecoration: "none", fontSize: "0.85rem" }}>
            Lihat statistik user →
          </Link>
        </div>
      </div>

      <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <div
          style={{
            border: "1px solid #dfe3e6",
            borderRadius: "4px",
            backgroundColor: "#fff",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "0.75rem",
              marginBottom: "1.25rem",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#002C40" }}>Publikasi per Bulan</h2>
          </div>
          {loadError ? (
            <div style={{ color: "#b91c1c" }}>Gagal memuat data: {loadError}</div>
          ) : rows.length === 0 ? (
            <div style={{ color: "#6b7280" }}>Belum ada data publikasi.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", color: "#1f2937" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", color: "#4b5563", textTransform: "uppercase", fontSize: "0.75rem" }}>
                  <th style={{ padding: "0.65rem 0.9rem", textAlign: "left" }}>Month</th>
                  <th style={{ padding: "0.65rem 0.9rem", textAlign: "left" }}>Publications</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.month} style={{ borderTop: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "0.65rem 0.9rem" }}>{row.month}</td>
                    <td style={{ padding: "0.65rem 0.9rem" }}>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

