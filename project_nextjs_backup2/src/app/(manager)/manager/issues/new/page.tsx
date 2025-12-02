import { redirect } from "next/navigation";

import { getCurrentUserServer } from "@/lib/auth-server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function createIssue(formData: FormData) {
  "use server";

  const user = await getCurrentUserServer();
  if (!user) {
    redirect("/login");
  }

  const supabase = getSupabaseAdminClient();

  // Ambil jurnal pertama sebagai konteks default, mengikuti pola halaman Manager lain
  const { data: journals } = await supabase.from("journals").select("id").limit(1);
  const journalId = journals && journals.length > 0 ? (journals[0].id as string) : null;

  if (!journalId) {
    throw new Error("Journal tidak ditemukan untuk membuat issue.");
  }

  const volume = formData.get("volume");
  const number = formData.get("number");
  const year = formData.get("year");
  const title = formData.get("title");
  const published = formData.get("published") === "on";
  const datePublished = formData.get("datePublished");

  const volumeNumber = volume ? Number(volume) || null : null;
  const issueNumber = number ? Number(number) || null : null;
  const issueYear = year ? Number(year) || null : null;
  const normalizedTitle =
    typeof title === "string" && title.trim().length > 0 ? title.trim() : null;
  const normalizedDatePublished =
    typeof datePublished === "string" && datePublished.trim().length > 0
      ? datePublished
      : null;

  // Simpan langsung ke tabel issues, meniru logika API /api/journals/[journalId]/issues (mode create)
  const insertPayload: any = {
    journal_id: journalId,
    volume: volumeNumber,
    number: issueNumber,
    year: issueYear,
    published,
    date_published: normalizedDatePublished,
  };

  const { data, error } = await supabase
    .from("issues")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) {
    console.error("Error inserting issue:", error);
    throw new Error("Gagal menyimpan issue baru.");
  }

  const issueId = data.id as string;

  if (normalizedTitle) {
    const { error: settingsError } = await supabase.from("issue_settings").insert({
      issue_id: issueId,
      setting_name: "title",
      setting_value: normalizedTitle,
      setting_type: "string",
      locale: "en_US",
    });

    if (settingsError) {
      console.error("Error saving issue title setting:", settingsError);
      // Jangan gagal total; biarkan issue tetap ada walau judul setting gagal.
    }
  }

  redirect("/manager/issues");
}

export default async function ManagerCreateIssuePage() {
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
        <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#002C40" }}>Create Issue</h1>
        <p style={{ margin: "0.35rem 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
          Buat edisi jurnal baru (volume, number, year, status publikasi).
        </p>
      </div>

      <div
        style={{
          padding: "1.5rem",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <form action={createIssue}>
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
              <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "#6b7280" }}>
                Judul issue, misal: Volume 10, Number 2 (2025).
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "1rem",
              }}
            >
              <div>
                <label
                  htmlFor="volume"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                    color: "#374151",
                  }}
                >
                  Volume
                </label>
                <input
                  id="volume"
                  name="volume"
                  type="number"
                  min={0}
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
                  htmlFor="number"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                    color: "#374151",
                  }}
                >
                  Number
                </label>
                <input
                  id="number"
                  name="number"
                  type="number"
                  min={0}
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
                  htmlFor="year"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                    color: "#374151",
                  }}
                >
                  Year
                </label>
                <input
                  id="year"
                  name="year"
                  type="number"
                  min={1900}
                  max={2100}
                  style={{
                    width: "100%",
                    borderRadius: "3px",
                    border: "1px solid #d1d5db",
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.875rem",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <div>
                <label
                  htmlFor="datePublished"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                    color: "#374151",
                  }}
                >
                  Publication Date
                </label>
                <input
                  id="datePublished"
                  name="datePublished"
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

              <label
                htmlFor="published"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginTop: "1.5rem",
                  fontSize: "0.875rem",
                  color: "#374151",
                }}
              >
                <input id="published" name="published" type="checkbox" />
                Mark as published
              </label>
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
                href="/manager/issues"
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


