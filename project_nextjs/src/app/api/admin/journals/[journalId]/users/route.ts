import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { JOURNAL_ROLE_OPTIONS } from "@/features/journals/types";
export const dynamic = 'force-dynamic';

// Mapping role string to role_id based on OJS PKP 3.3
// ROLE_ID_MANAGER = 16, ROLE_ID_SUB_EDITOR = 17, ROLE_ID_REVIEWER = 4096, ROLE_ID_AUTHOR = 65536
const ROLE_TO_ROLE_ID: Record<string, number> = {
  manager: 16,
  editor: 16, // Editor uses same role_id as Manager
  section_editor: 17,
  guest_editor: 17, // Guest Editor uses same role_id as Section Editor
  reviewer: 4096,
  author: 65536,
  reader: 1048576,
  copyeditor: 4097, // Assistant role
  proofreader: 4097, // Assistant role
  "layout-editor": 4097, // Assistant role
};

const ROLE_ID_TO_ROLE: Record<number, string> = {
  16: "manager",
  17: "section_editor",
  4096: "reviewer",
  65536: "author",
  1048576: "reader",
  4097: "copyeditor", // Default to copyeditor for assistant roles
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ journalId: string }> },
) {
  const { journalId } = await params;
  if (!journalId) {
    return NextResponse.json({ ok: false, message: "Journal tidak ditemukan." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();

    // Get users with their user groups for this journal
    const { data: userGroupsData, error: userGroupsError } = await supabase
      .from("user_user_groups")
      .select(`
        user_id,
        user_groups!inner(
          id,
          role_id,
          context_id
        )
      `)
      .eq("user_groups.context_id", journalId);

    if (userGroupsError) throw userGroupsError;

    // Group by user_id
    const grouped = new Map<string, { roles: string[]; userGroupIds: string[] }>();
    for (const row of userGroupsData ?? []) {
      const entry = grouped.get(row.user_id) ?? { roles: [], userGroupIds: [] };
      const roleId = (row.user_groups as any).role_id;
      const roleString = ROLE_ID_TO_ROLE[roleId] || "unknown";
      if (!entry.roles.includes(roleString)) {
        entry.roles.push(roleString);
      }
      entry.userGroupIds.push((row.user_groups as any).id);
      grouped.set(row.user_id, entry);
    }

    // Get user details
    const users: { id: string; email: string; name: string; roles: string[] }[] = [];
    for (const [userId, info] of grouped.entries()) {
      const user = await getUserById(userId);
      if (user) {
        users.push({
          id: user.id,
          email: user.email ?? "",
          name: (user.user_metadata as { name?: string })?.name ?? user.email ?? user.id,
          roles: info.roles,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      users,
      availableRoles: JOURNAL_ROLE_OPTIONS.map((role) => role.value),
    });
  } catch (error) {
    console.error("Error fetching journal users:", error);
    return NextResponse.json({ ok: false, message: "Gagal memuat pengguna jurnal." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ journalId: string }> },
) {
  const { journalId } = await params;
  if (!journalId) {
    return NextResponse.json({ ok: false, message: "Journal tidak ditemukan." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { email?: string; role?: string } | null;
  const email = body?.email?.toLowerCase().trim();
  const role = body?.role?.trim();
  if (!email || !role) {
    return NextResponse.json({ ok: false, message: "Email dan role wajib diisi." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    // Get role_id from role string
    const roleId = ROLE_TO_ROLE_ID[role];
    if (!roleId) {
      return NextResponse.json({ ok: false, message: `Role "${role}" tidak valid.` }, { status: 400 });
    }

    // Find or create user_group for this journal and role_id
    let { data: userGroup, error: userGroupError } = await supabase
      .from("user_groups")
      .select("id")
      .eq("context_id", journalId)
      .eq("role_id", roleId)
      .single();

    if (userGroupError && userGroupError.code === "PGRST116") {
      // User group doesn't exist, create it
      const { data: newUserGroup, error: createError } = await supabase
        .from("user_groups")
        .insert({
          context_id: journalId,
          role_id: roleId,
          is_default: false,
          show_title: roleId === 16 || roleId === 17, // Manager and Section Editor
          permit_self_registration: roleId === 65536 || roleId === 4096 || roleId === 1048576, // Author, Reviewer, Reader
          permit_metadata_edit: roleId === 16 || roleId === 17 || roleId === 65536 || roleId === 4097, // Manager, Section Editor, Author, Assistant
          recommend_only: roleId === 17, // Section Editor
        })
        .select("id")
        .single();

      if (createError) throw createError;
      userGroup = newUserGroup;

      // Create user_group_settings with name
      const roleName = JOURNAL_ROLE_OPTIONS.find((r) => r.value === role)?.label || role;
      await supabase.from("user_group_settings").insert({
        user_group_id: userGroup.id,
        setting_name: "name",
        setting_value: roleName,
        setting_type: "string",
        locale: "en_US",
      });
    } else if (userGroupError) {
      throw userGroupError;
    }

    // Add user to user_group
    const { error: assignmentError } = await supabase
      .from("user_user_groups")
      .upsert(
        {
          user_id: user.id,
          user_group_id: userGroup!.id,
        },
        { onConflict: "user_id,user_group_id" }
      );

    if (assignmentError) throw assignmentError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error assigning user to journal:", error);
    return NextResponse.json({ ok: false, message: "Gagal menambahkan pengguna ke jurnal." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ journalId: string }> },
) {
  const journalId = (await params).journalId;
  if (!journalId) {
    return NextResponse.json({ ok: false, message: "Journal tidak ditemukan." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { userId?: string; role?: string } | null;
  const userId = body?.userId;
  const role = body?.role;
  if (!userId || !role) {
    return NextResponse.json({ ok: false, message: "User & role wajib diisi." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();

    // Get role_id from role string
    const roleId = ROLE_TO_ROLE_ID[role];
    if (!roleId) {
      return NextResponse.json({ ok: false, message: `Role "${role}" tidak valid.` }, { status: 400 });
    }

    // Find user_group for this journal and role_id
    const { data: userGroup, error: userGroupError } = await supabase
      .from("user_groups")
      .select("id")
      .eq("context_id", journalId)
      .eq("role_id", roleId)
      .single();

    if (userGroupError || !userGroup) {
      return NextResponse.json({ ok: false, message: "User group tidak ditemukan." }, { status: 404 });
    }

    // Remove user from user_group
    const { error } = await supabase
      .from("user_user_groups")
      .delete()
      .eq("user_id", userId)
      .eq("user_group_id", userGroup.id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error removing user from journal:", error);
    return NextResponse.json({ ok: false, message: "Gagal menghapus pengguna dari jurnal." }, { status: 500 });
  }
}

async function findUserByEmail(email: string): Promise<User | null> {
  const supabase = getSupabaseAdminClient();
  let page = 1;
  const perPage = 200;
  while (page < 50) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }
    const user = data.users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (user) return user;
    if (data.users.length < perPage) break;
    page += 1;
  }
  return null;
}

async function getUserById(userId: string): Promise<User | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error) {
    return null;
  }
  return data.user ?? null;
}
