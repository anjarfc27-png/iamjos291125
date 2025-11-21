"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSiteAdmin } from "@/lib/permissions";

type Result = { ok: true; deleted: number } | { ok: false; message: string };

export async function clearScheduledTaskLogsAction(): Promise<Result> {
  try {
    await requireSiteAdmin();
    const supabase = getSupabaseAdminClient();
    const { error, count } = await supabase
      .from("scheduled_task_logs")
      .delete({ count: "exact" })
      .gte("id", 0);

    if (error) {
      if ((error as { code?: string }).code === "42P01") {
        return { ok: true, deleted: 0 };
      }
      return { ok: false, message: "Tidak dapat menghapus log tugas." };
    }

    return { ok: true, deleted: count ?? 0 };
  } catch {
    return { ok: false, message: "Terjadi kesalahan saat menghapus log tugas." };
  }
}