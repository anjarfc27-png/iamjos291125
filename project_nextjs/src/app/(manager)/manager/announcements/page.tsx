import Link from "next/link";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type AnnouncementRow = {
  id: string;
  title: string;
  message: string;
  postedAt: string | null;
  status: "published" | "draft";
};

export const dynamic = "force-dynamic";

export default async function ManagerAnnouncementsPage() {
  const supabase = getSupabaseAdminClient();

  // Batasi ke jurnal pertama (jika ada) agar konsisten dengan konteks Manager
  const { data: journals } = await supabase.from("journals").select("id").limit(1);
  const journalId = journals && journals.length > 0 ? (journals[0].id as string) : null;

  let query = supabase
    .from("announcements")
    .select("id, title, description, date_posted, assoc_id");

  if (journalId) {
    query = query.eq("assoc_id", journalId);
  }

  const { data, error } = await query
    .order("date_posted", { ascending: false })
    .limit(50);

  const announcements: AnnouncementRow[] = (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title ?? "(Untitled Announcement)",
    message: row.description ?? "",
    postedAt: row.date_posted ?? null,
    // OJS 3.3 schema kita tidak punya kolom published; anggap semua yang ada di sini sudah terbit.
    status: "published",
  }));

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
            <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#002C40" }}>Announcements</h1>
            <p style={{ margin: "0.35rem 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
              Ketahui pengumuman terbaru dan kelola status publikasinya.
            </p>
          </div>
          <Link
            href="/manager/announcements/create"
            style={{
              backgroundColor: "#006798",
              color: "#fff",
              padding: "0.45rem 1rem",
              borderRadius: "3px",
              fontSize: "0.875rem",
            }}
          >
            Create Announcement
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
            Gagal memuat daftar pengumuman: {loadError}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {announcements.length === 0 ? (
              <div
                style={{
                  border: "1px solid #dfe3e6",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                  padding: "1.5rem",
                  color: "#6b7280",
                  textAlign: "center",
                }}
              >
                Belum ada pengumuman yang dibuat.
              </div>
            ) : (
              announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  style={{
                    border: "1px solid #dfe3e6",
                    borderRadius: "4px",
                    backgroundColor: "#fff",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem" }}>
                    <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#111827" }}>{announcement.title}</h2>
                    <span
                      style={{
                        borderRadius: "999px",
                        padding: "0.15rem 0.65rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: announcement.status === "published" ? "#e5f0fb" : "#fef3c7",
                        color: announcement.status === "published" ? "#0369a1" : "#92400e",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {announcement.status}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: "#4b5563", fontSize: "0.9rem" }}>{announcement.message || "—"}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                    <span style={{ color: "#6b7280" }}>
                      Diposting: {announcement.postedAt ? formatDate(announcement.postedAt) : "Belum dijadwalkan"}
                    </span>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <Link href={`/manager/announcements/${announcement.id}`} style={actionStyle()}>
                        View
                      </Link>
                      <Link href={`/manager/announcements/${announcement.id}/edit`} style={actionStyle()}>
                        Edit
                      </Link>
                      <Link href={`/manager/announcements/${announcement.id}/publish`} style={actionStyle()}>
                        {announcement.status === "published" ? "Archive" : "Publish"}
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
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

