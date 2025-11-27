import Link from "next/link";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { AdminUsersClient, type AdminUserRow } from "./users-client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("user_accounts")
    .select(
      `
        id,
        username,
        email,
        first_name,
        last_name,
        created_at,
        updated_at,
        user_account_roles(role_name)
      `,
    )
    .order("created_at", { ascending: true });

  const users: AdminUserRow[] = (data ?? []).map((row) => ({
    id: row.id ?? crypto.randomUUID(),
    username: row.username ?? "",
    email: row.email ?? "",
    fullName: buildName(row.first_name, row.last_name, row.email),
    roles: ((row.user_account_roles ?? []) as { role_name?: string }[])
      .map((role) => role.role_name?.toLowerCase() ?? "")
      .filter(Boolean),
    registeredAt: row.created_at,
    lastLogin: row.updated_at,
  }));

  const loadError = error ? (error as { message?: string }).message ?? String(error) : null;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#fff", minHeight: "100vh" }}>
      <div
        style={{
          backgroundColor: "#e5e5e5",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid #d1d5db",
        }}
      >
        <div style={{ marginBottom: "0.4rem", fontSize: "1rem" }}>
          <Link href="/admin" style={{ color: "#006798", textDecoration: "underline" }}>
            Site Administration
          </Link>
          <span style={{ margin: "0 0.5rem", color: "#6b7280" }}>»</span>
          <span style={{ color: "#111827" }}>Users</span>
        </div>
        <h1 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 600, color: "#111827" }}>User Accounts</h1>
      </div>

      <div style={{ padding: "2rem 1.5rem" }}>
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
            Gagal memuat data user: {loadError}
          </div>
        ) : (
          <AdminUsersClient users={users} />
        )}
      </div>
    </div>
  );
}

function buildName(first?: string | null, last?: string | null, fallback?: string | null) {
  const parts = [first?.trim(), last?.trim()].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(" ");
  }
  return fallback ?? "";
}

