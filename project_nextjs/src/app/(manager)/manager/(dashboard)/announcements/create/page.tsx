import { redirect } from "next/navigation";

import { getCurrentUserServer } from "@/lib/auth-server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function createAnnouncement(formData: FormData) {
  "use server";

  const user = await getCurrentUserServer();
  if (!user) {
    redirect("/login");
  }

  const supabase = getSupabaseAdminClient();

  const { data: journals } = await supabase.from("journals").select("id").limit(1);
  const journalId = journals && journals.length > 0 ? (journals[0].id as string) : null;

  if (!journalId) {
    throw new Error("Journal tidak ditemukan untuk membuat announcement.");
  }

  const title = formData.get("title");
  const description = formData.get("description");
  const datePosted = formData.get("datePosted");

  const payload: {
    title: string;
    description?: string | null;
    date_posted?: string | null;
    assoc_type?: number | null;
    assoc_id?: string | null;
  } = {
    title: typeof title === "string" && title.trim().length > 0 ? title.trim() : "Untitled announcement",
  };

  payload.description =
    typeof description === "string" && description.trim().length > 0 ? description.trim() : null;
  payload.date_posted =
    typeof datePosted === "string" && datePosted.trim().length > 0 ? datePosted : null;

  // Assosiasikan ke jurnal pertama (ASSOC_TYPE_JOURNAL ~ 256 di OJS, tapi di clone ini kita tidak pakai enum ketat)
  payload.assoc_type = 256;
  payload.assoc_id = journalId;

  const { error } = await supabase.from("announcements").insert(payload);
  if (error) {
    console.error("Error creating announcement:", error);
    throw new Error("Gagal menyimpan announcement baru.");
  }

  redirect("/manager/announcements");
}

export default async function ManagerCreateAnnouncementPage() {
  const user = await getCurrentUserServer();

  if (!user) {
    redirect("/login");
  }

  const hasManagerRole = user.roles?.some((r) => {
    const rolePath = r.role_path?.toLowerCase();
    return rolePath === "manager" || rolePath === "admin";
  });

  if (!hasManagerRole) {
    redirect("/dashboard");
  }

  return (
    <div style={{ backgroundColor: "#eaedee", minHeight: "100%" }}>
      <div
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #dfe3e6",
          padding: "1.25rem 1.5rem",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#002C40" }}>
          Create Announcement
        </h1>
        <p style={{ margin: "0.35rem 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
          Buat pengumuman baru untuk pembaca dan kontributor jurnal.
        </p>
      </div>

      <div
        style={{
          padding: "1.5rem",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <form action={createAnnouncement}>
          <div
            style={{
              border: "1px solid #dfe3e6",
              borderRadius: "4px",
              backgroundColor: "#ffffff",
              padding: "1.5rem 1.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div>
              <label
                htmlFor="title"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "0.25rem",
                  color: "#374151",
                }}
              >
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                style={{
                  width: "100%",
                  borderRadius: "3px",
                  border: "1px solid #d1d5db",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "0.25rem",
                  color: "#374151",
                }}
              >
                Message
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                style={{
                  width: "100%",
                  borderRadius: "3px",
                  border: "1px solid #d1d5db",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ maxWidth: "260px" }}>
              <label
                htmlFor="datePosted"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "0.25rem",
                  color: "#374151",
                }}
              >
                Post Date
              </label>
              <input
                id="datePosted"
                name="datePosted"
                type="date"
                style={{
                  width: "100%",
                  borderRadius: "3px",
                  border: "1px solid #d1d5db",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
                marginTop: "1rem",
              }}
            >
              <a
                href="/manager/announcements"
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: "3px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  color: "#374151",
                  backgroundColor: "#ffffff",
                }}
              >
                Cancel
              </a>
              <button
                type="submit"
                style={{
                  padding: "0.45rem 1.1rem",
                  borderRadius: "3px",
                  border: "1px solid #006798",
                  fontSize: "0.875rem",
                  color: "#ffffff",
                  backgroundColor: "#006798",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


