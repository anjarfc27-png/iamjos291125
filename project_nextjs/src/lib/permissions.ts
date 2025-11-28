import { createSupabaseServerClient } from "./supabase/server";
import { getSupabaseAdminClient } from "./supabase/admin";
import type { NextRequest } from "next/server";

export type RolePath =
  | "admin"
  | "manager"
  | "editor"
  | "section_editor"
  | "guest_editor"
  | "reviewer"
  | "author"
  | "reader"
  | "copyeditor"
  | "proofreader"
  | "layout-editor"
  | "subscription-manager";

// Mapping role_path string -> OJS role_id (see OJS 3.3 role constants)
const ROLE_TO_ROLE_ID: Record<RolePath, number> = {
  manager: 16,
  editor: 16,
  section_editor: 17,
  guest_editor: 17,
  reviewer: 4096,
  author: 65536,
  reader: 1048576,
  copyeditor: 4097,
  proofreader: 4097,
  "layout-editor": 4097,
  "subscription-manager": 2097152,
  admin: 1,
};

export interface User {
  id: string;
  email: string;
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function getCurrentUser(request?: Request | NextRequest): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? "",
  };
}

// ---- Site-level roles (application-wide) ------------------------------------

export async function hasUserSiteRole(userId: string, rolePath: RolePath): Promise<boolean> {
  const supabase = getSupabaseAdminClient();

  console.log('[hasUserSiteRole] Checking role:', { userId, rolePath });

  // First check: Site roles in user_account_roles with context_id = null
  const { data: accountRoles, error: accountError } = await supabase
    .from("user_account_roles")
    .select("role_path, context_id")
    .eq("user_id", userId);

  console.log('[hasUserSiteRole] user_account_roles query result:', { accountRoles, accountError });

  const hasAccountRole = (accountRoles ?? []).some((r: any) => r.role_path === rolePath && (r.context_id == null));

  if (hasAccountRole) {
    console.log('[hasUserSiteRole] Found in user_account_roles!');
    return true;
  }

  // Fallback check: Check user_user_groups with context_id = 0 or NULL (site-wide) for backward compatibility
  if (rolePath === 'admin') {
    const roleId = ROLE_TO_ROLE_ID[rolePath];
    console.log('[hasUserSiteRole] Fallback check for admin, roleId:', roleId);

    // Try with context_id = 0
    const { data: userGroups0, error: error0 } = await supabase
      .from("user_user_groups")
      .select(`
        user_groups!inner(
          id,
          role_id,
          context_id
        )
      `)
      .eq("user_id", userId)
      .eq("user_groups.role_id", roleId)
      .eq("user_groups.context_id", 0);

    console.log('[hasUserSiteRole] user_user_groups with context_id=0:', { userGroups0, error0 });

    if ((userGroups0 ?? []).length > 0) {
      console.log('[hasUserSiteRole] Found admin role with context_id=0!');
      return true;
    }

    // Try with context_id IS NULL for site-wide admin
    const { data: userGroupsNull, error: errorNull } = await supabase
      .from("user_user_groups")
      .select(`
        user_groups!inner(
          id,
          role_id,
          context_id
        )
      `)
      .eq("user_id", userId)
      .eq("user_groups.role_id", roleId)
      .is("user_groups.context_id", null);

    console.log('[hasUserSiteRole] user_user_groups with context_id IS NULL:', { userGroupsNull, errorNull });

    if ((userGroupsNull ?? []).length > 0) {
      console.log('[hasUserSiteRole] Found admin role with context_id IS NULL!');
      return true;
    }
  }

  console.log('[hasUserSiteRole] No admin role found anywhere!');
  return false;
}

export async function requireSiteAdmin(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    const error: any = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  const admin = await hasUserSiteRole(userId, "admin");
  if (!admin) {
    const error: any = new Error("Forbidden");
    error.status = 403;
    throw error;
  }
}

// ---- Journal-level roles based on OJS user_groups / user_user_groups --------

export async function hasUserJournalRole(
  userId: string,
  journalId: string,
  rolePaths: RolePath[],
): Promise<boolean> {
  const supabase = getSupabaseAdminClient();

  // Convert role paths to role_ids
  const roleIds = rolePaths
    .map((role) => ROLE_TO_ROLE_ID[role])
    .filter((id): id is number => !!id);

  if (roleIds.length === 0) {
    return false;
  }

  // Check if user has any of these role_ids in user_user_groups for this journal
  const { data } = await supabase
    .from("user_user_groups")
    .select(`
      user_groups!inner(
        id,
        role_id,
        context_id
      )
    `)
    .eq("user_id", userId)
    .eq("user_groups.context_id", journalId)
    .in("user_groups.role_id", roleIds);

  return (data ?? []).length > 0;
}

export async function requireJournalRole(
  requestOrJournalId: NextRequest | string,
  journalIdOrRoles?: string | RolePath[],
  rolePaths?: RolePath[],
): Promise<void> {
  let userId: string | null;
  let journalId: string;
  let roles: RolePath[];

  // Handle different function signatures
  if (typeof requestOrJournalId === "string") {
    // Server action signature: requireJournalRole(journalId, roles)
    userId = await getCurrentUserId();
    journalId = requestOrJournalId;
    roles = Array.isArray(journalIdOrRoles)
      ? (journalIdOrRoles as RolePath[])
      : journalIdOrRoles
        ? [journalIdOrRoles as RolePath]
        : [];
  } else {
    // API route signature: requireJournalRole(request, journalId, roles)
    const user = await getCurrentUser(requestOrJournalId);
    userId = user?.id ?? null;
    journalId = journalIdOrRoles as string;
    roles = (rolePaths ?? []) as RolePath[];
  }

  if (!userId) {
    const error: any = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  const ok = await hasUserJournalRole(userId, journalId, roles);
  const isAdmin = await hasUserSiteRole(userId, "admin");

  if (!ok && !isAdmin) {
    const error: any = new Error("Forbidden");
    error.status = 403;
    throw error;
  }
}