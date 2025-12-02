import Link from "next/link";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type ToolRow = {
  id: string;
  name: string;
  description?: string | null;
  route: string;
};

export const dynamic = "force-dynamic";

const DEFAULT_TOOLS: ToolRow[] = [
  { id: "files", name: "Submission Files", description: "Kelola file submission lintas stage.", route: "/manager/tools/files" },
  { id: "access", name: "Access & Security", description: "Atur kebijakan akses jurnal.", route: "/manager/tools/access" },
  { id: "statistics", name: "Statistics Export", description: "Unduh laporan statistik.", route: "/manager/tools/statistics" },
  { id: "email", name: "Prepared Emails", description: "Kelola template email default.", route: "/manager/tools/emails" },
];

export default async function ManagerToolsPage() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("manager_tools")
    .select("id, name, description, route")
    .order("name", { ascending: true });

  const tools = ((data as ToolRow[] | null) ?? []).length > 0 ? (data as ToolRow[]) : DEFAULT_TOOLS;
  const loadError = error ? (error as { message?: string }).message ?? String(error) : null;

  return (
    <div style={{ minHeight: "100%", backgroundColor: "#eaedee" }}>
      <div
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #dfe3e6",
          padding: "1.5rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#002C40" }}>Tools</h1>
          <p style={{ margin: "0.35rem 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
            Akses alat bantu yang tersedia di laman Manager OJS.
          </p>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            color: "#006798",
            backgroundColor: "transparent",
            border: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            padding: "0.25rem 0.5rem",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: "#006798",
              color: "#ffffff",
              fontSize: "10px",
              fontWeight: "bold",
            }}
          >
            i
          </span>
          Help
        </button>
      </div>

      <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
        {loadError && (
          <div
            style={{
              border: "1px solid #fecaca",
              backgroundColor: "#fee2e2",
              padding: "1rem 1.25rem",
              color: "#991b1b",
              borderRadius: "4px",
              marginBottom: "1rem",
            }}
          >
            Gagal memuat daftar tools: {loadError}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem",
          }}
        >
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.route || "#"}
              style={{
                border: "1px solid #dfe3e6",
                borderRadius: "4px",
                backgroundColor: "#fff",
                padding: "1rem 1.1rem",
                textDecoration: "none",
                color: "#1f2937",
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
              }}
            >
              <strong style={{ fontSize: "1rem", color: "#002C40" }}>{tool.name}</strong>
              <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{tool.description || "—"}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

