"use client";

import { useMemo, useState } from "react";

type User = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  status: string;
  registeredAt: string | null;
  lastLogin: string | null;
};

type Role = {
  id: string;
  role_path: string;
  name: string | null;
};

type Props = {
  users: User[];
  roles: Role[];
};

export function UsersManagementClient({ users, roles }: Props) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const uniqueRoles = useMemo(() => {
    const list = new Set<string>();
    roles.forEach((role) => list.add(role.role_path));
    users.forEach((user) => user.roles.forEach((role) => list.add(role)));
    return Array.from(list).sort();
  }, [roles, users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const normalizedSearch = search.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        user.name?.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch);
      const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter);
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const formatDate = (value: string | null) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div style={{ backgroundColor: "#eaedee", minHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #dfe3e6",
          padding: "1.5rem 2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#002C40",
                margin: 0,
              }}
            >
              Users & Roles
            </h1>
            <p style={{ margin: "0.35rem 0 0", color: "#6b7280", fontSize: "0.875rem" }}>
              Daftar user jurnal dan peran yang mereka miliki.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "#006798",
                backgroundColor: "transparent",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                padding: "0.25rem 0.5rem",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  backgroundColor: "#006798",
                  color: "#ffffff",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                i
              </span>
              Help
            </button>
            <button
              type="button"
              style={{
                backgroundColor: "#006798",
                color: "#fff",
                border: "none",
                borderRadius: "0.25rem",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              + Add User
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Filters */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #dfe3e6",
            borderRadius: "0.25rem",
            padding: "1rem 1.5rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <label style={{ flex: "1 1 260px" }}>
            <span
              style={{
                display: "block",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#6b7280",
                marginBottom: "0.35rem",
              }}
            >
              Search
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nama atau email"
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "0.25rem",
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
              }}
            />
          </label>

          <label style={{ flex: "0 0 200px" }}>
            <span
              style={{
                display: "block",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#6b7280",
                marginBottom: "0.35rem",
              }}
            >
              Role
            </span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "0.25rem",
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
                backgroundColor: "#fff",
              }}
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </label>

          <label style={{ flex: "0 0 180px" }}>
            <span
              style={{
                display: "block",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#6b7280",
                marginBottom: "0.35rem",
              }}
            >
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "0.25rem",
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
                backgroundColor: "#fff",
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        {/* Table */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #dfe3e6",
            borderRadius: "0.25rem",
            overflowX: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr
                style={{
                  backgroundColor: "#f9fafb",
                  color: "#4b5563",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                }}
              >
                <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Name</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Email</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Roles</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Status</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Registered</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Last Login</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: "#6b7280",
                      fontSize: "0.875rem",
                    }}
                  >
                    Tidak ada user yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#fff" : "#f8fafc",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "#111827" }}>
                      {user.name || "—"}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "#374151" }}>{user.email}</td>
                    <td style={{ padding: "0.85rem 1rem", color: "#374151" }}>
                      {user.roles.length > 0 ? user.roles.join(", ") : "—"}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: user.status === "active" ? "#065f46" : "#92400e" }}>
                      {user.status}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "#374151" }}>{formatDate(user.registeredAt)}</td>
                    <td style={{ padding: "0.85rem 1rem", color: "#374151" }}>{formatDate(user.lastLogin)}</td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "0.25rem",
                            backgroundColor: "#fff",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "0.25rem",
                            backgroundColor: "#fff",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                        >
                          Email
                        </button>
                        <button
                          type="button"
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "0.25rem",
                            backgroundColor: "#fff",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                        >
                          Toggle
                        </button>
                        <button
                          type="button"
                          style={{
                            border: "1px solid #ef4444",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "0.25rem",
                            backgroundColor: "#fff5f5",
                            color: "#b91c1c",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



