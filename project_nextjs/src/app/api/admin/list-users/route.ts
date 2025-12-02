import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSiteAdmin } from "@/lib/permissions";
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireSiteAdmin();
    const supabase = getSupabaseAdminClient();
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) throw error;

    const formattedUsers = users.map(u => ({
      id: u.id,
      email: u.email ?? "",
      name: (u.user_metadata as { name?: string })?.name ?? u.email ?? "",
      roles: ((u.app_metadata as { roles?: string[] })?.roles ?? []).map((r) => String(r)),
    }));

    return NextResponse.json({ ok: true, users: formattedUsers });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error.message || "Kesalahan server." }, { status: 500 });
  }
}