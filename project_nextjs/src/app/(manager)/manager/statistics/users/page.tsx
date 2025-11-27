import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function ManagerUserStatsPage() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.rpc("user_role_counts");

  const rows: { role: string; total: number }[] = Array.isArray(data)
    ? data.map((item: any) => ({
        role: item.role_name ?? "unknown",
        total: Number(item.count ?? 0),
      }))
    : [];

  return (
    <div style={{ minHeight: "100%", backgroundColor: "#eaedee" }}>
      <div
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #dfe3e6",
          padding: "1.5rem 2rem",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#002C40" }}>User Statistics</h1>
        <p style={{ margin: "0.35rem 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
          Rekap jumlah user berdasarkan peran tingkat jurnal maupun situs.
        </p>
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
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", color: "#1f2937" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", color: "#4b5563", textTransform: "uppercase", fontSize: "0.75rem" }}>
                <th style={{ padding: "0.65rem 0.9rem", textAlign: "left" }}>Role</th>
                <th style={{ padding: "0.65rem 0.9rem", textAlign: "left" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={2} style={{ padding: "1rem", color: "#b91c1c" }}>
                    Gagal memuat data: {(error as { message?: string }).message ?? String(error)}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ padding: "1rem", color: "#6b7280" }}>
                    Belum ada data user per role.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.role} style={{ borderTop: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "0.65rem 0.9rem" }}>{capitalize(row.role)}</td>
                    <td style={{ padding: "0.65rem 0.9rem" }}>{row.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function capitalize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

