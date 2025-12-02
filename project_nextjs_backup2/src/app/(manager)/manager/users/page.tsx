import { redirect } from "next/navigation";
import { getCurrentUserServer } from "@/lib/auth-server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { UsersManagementClient } from "./users-client";

export const dynamic = "force-dynamic";

async function getUsers(journalId?: string) {
  const supabase = getSupabaseAdminClient();

  try {
    // Get all users with their roles for this journal
    let userRolesQuery = supabase
      .from("user_roles")
      .select(
        `
        user_id,
        role_path,
        context_id,
        users:user_id (
          id,
          email,
          raw_user_meta_data
        )
      `
      );

    if (journalId) {
      userRolesQuery = userRolesQuery.eq("context_id", journalId);
    }

    const { data: userRoles, error } = await userRolesQuery;

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    // Group users by user_id
    const userMap = new Map<
      string,
      {
        id: string;
        email: string;
        name: string;
        roles: string[];
        status: string;
        registeredAt: string | null;
        lastLogin: string | null;
      }
    >();

    (userRoles ?? []).forEach((ur: any) => {
      const userId = ur.user_id as string;
      const userData = (ur.users?.[0] ?? null) as { id: string; email: string; raw_user_meta_data: any } | null;

      if (!userData) return;

      const existing = userMap.get(userId);
      const name = userData.raw_user_meta_data?.name || userData.raw_user_meta_data?.full_name || "";

      if (existing) {
        existing.roles.push(ur.role_path as string);
      } else {
        userMap.set(userId, {
          id: userId,
          email: userData.email,
          name,
          roles: [ur.role_path as string],
          status: "active", // TODO: Get from auth.users or user_settings
          registeredAt: null, // TODO: Get from auth.users.created_at
          lastLogin: null, // TODO: Get from auth.users.last_sign_in_at
        });
      }
    });

    return Array.from(userMap.values());
  } catch (error) {
    console.error("Error in getUsers:", error);
    return [];
  }
}

async function getRoles() {
  const supabase = getSupabaseAdminClient();

  try {
    // Get all available roles from the system
    const { data: roles, error } = await supabase
      .from("roles")
      .select("id, role_path, name")
      .order("role_path", { ascending: true });

    if (error) {
      console.error("Error fetching roles:", error);
      return [];
    }

    return roles || [];
  } catch (error) {
    console.error("Error in getRoles:", error);
    return [];
  }
}

export default async function UsersManagementPage() {
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

  const users = await getUsers();
  const roles = await getRoles();

  return <UsersManagementClient users={users} roles={roles} />;
}


