"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSiteAdmin } from "@/lib/permissions";

type Result = { ok: true; expired: number } | { ok: false; message: string };

export async function expireAllSessionsAction(): Promise<Result> {
  try {
    await requireSiteAdmin();
    const supabase = getSupabaseAdminClient();

    // 1. List all users
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      return { ok: false, message: "Gagal mengambil daftar pengguna." };
    }

    let expired = 0;
    const users = data.users ?? [];

    // 2. Sign out each user
    for (const user of users) {
      const { error: signOutError } = await supabase.auth.admin.signOut(user.id);
      if (!signOutError) {
        expired += 1;
      } else {
        console.error(`Failed to sign out user ${user.id}:`, signOutError);
      }
    }

    return { ok: true, expired };
  } catch (error) {
    console.error("Expire sessions error:", error);
    return { ok: false, message: "Terjadi kesalahan saat mengakhiri sesi." };
  }
}