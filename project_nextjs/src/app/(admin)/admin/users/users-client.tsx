"use client";

import { useMemo, useState, type CSSProperties } from "react";

export type AdminUserRow = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  registeredAt?: string | null;
  lastLogin?: string | null;
};

type Props = {
  users: AdminUserRow[];
};

export function AdminUsersClient({ users }: Props) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const roleOptions = useMemo(() => {
    const set = new Set<string>();
    users.forEach((user) => user.roles.forEach((role) => role && set.add(role)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [users]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !term ||
        user.fullName.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);
      const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter);
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#002C40" }}>Users &amp; Roles</h2>
        <p style={{ margin: "0.25rem 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
          Kelola akun tingkat situs, termasuk peran global.
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #d9dee5",
          borderRadius: "4px",
          padding: "1rem 1.25rem",
          marginBottom: "1.25rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <label style={{ flex: "1 1 260px", fontSize: "0.8rem", textTransform: "uppercase", color: "#6b7280" }}>
          Search
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nama, username, atau email"
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.35rem",
              border: "1px solid #cdd3db",
              borderRadius: "4px",
              padding: "0.45rem 0.6rem",
              fontSize: "0.9rem",
            }}
          />
        </label>
        <label style={{ flex: "0 0 200px", fontSize: "0.8rem", textTransform: "uppercase", color: "#6b7280" }}>
          Role
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.35rem",
              border: "1px solid #cdd3db",
              borderRadius: "4px",
              padding: "0.45rem 0.6rem",
              fontSize: "0.9rem",
              backgroundColor: "#fff",
            }}
          >
            <option value="all">All Roles</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {capitalize(role)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ border: "1px solid #d9dee5", borderRadius: "4px", overflowX: "auto", backgroundColor: "#fff" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", color: "#1f2937" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb", color: "#4b5563", textTransform: "uppercase", fontSize: "0.75rem" }}>
              <th style={headerCellStyle}>Name</th>
              <th style={headerCellStyle}>Username</th>
              <th style={headerCellStyle}>Email</th>
              <th style={headerCellStyle}>Roles</th>
              <th style={headerCellStyle}>Registered</th>
              <th style={headerCellStyle}>Last Login</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
                  Tidak ada user yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={bodyCellStyle}>
                    <div style={{ fontWeight: 600 }}>{user.fullName || "—"}</div>
                  </td>
                  <td style={bodyCellStyle}>{user.username || "—"}</td>
                  <td style={bodyCellStyle}>
                    <a href={`mailto:${user.email}`} style={{ color: "#006798", textDecoration: "none" }}>
                      {user.email}
                    </a>
                  </td>
                  <td style={bodyCellStyle}>
                    {user.roles.length > 0 ? user.roles.map(capitalize).join(", ") : <span style={{ color: "#9ca3af" }}>—</span>}
                  </td>
                  <td style={bodyCellStyle}>{formatDate(user.registeredAt)}</td>
                  <td style={bodyCellStyle}>{formatDate(user.lastLogin)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function capitalize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }
  try {
    return new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return value;
  }
}

const headerCellStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  textAlign: "left",
  borderBottom: "1px solid #d9dee5",
};

const bodyCellStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  verticalAlign: "top",
};

