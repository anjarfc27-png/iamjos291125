import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { IssueRow } from "@/features/editor/types";
import { IssuesClient } from "./issues-client";

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

  return <IssuesClient issues={issues} />;
}

