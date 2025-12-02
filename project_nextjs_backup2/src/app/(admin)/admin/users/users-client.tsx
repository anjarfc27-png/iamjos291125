"use client";

import { useMemo, useState, type CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { loginAsUser, toggleUserBan } from "@/features/admin/actions/users";
import { UserEditForm } from "@/features/admin/components/user-edit-form";
import { MergeUsersModal } from "@/features/admin/components/merge-users-modal";
import { useRouter } from "next/navigation";

export type AdminUserRow = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  registeredAt?: string | null;
  lastLogin?: string | null;
  bannedUntil?: string | null; // Add this to your type definition if not present
};

type Props = {
  users: AdminUserRow[];
};

type ModalState =
  | { type: 'edit', user: AdminUserRow }
  | { type: 'merge', user: AdminUserRow }
  | null;

export function AdminUsersClient({ users }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modalState, setModalState] = useState<ModalState>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

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

  const handleLoginAs = async (userId: string) => {
    const result = await loginAsUser(userId);
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      setFeedback({ tone: "error", message: result.message || "Failed to login as user" });
    }
  };

  const handleToggleBan = async (user: AdminUserRow) => {
    const isBanned = !!user.bannedUntil; // Simple check, ideally check date > now
    const result = await toggleUserBan(user.id, !isBanned);
    if (result.success) {
      setFeedback({ tone: "success", message: result.message });
      router.refresh();
    } else {
      setFeedback({ tone: "error", message: result.message || "Failed to update ban status" });
    }
  };

  const closeAll = () => setModalState(null);

  const renderOverlay = (content: ReactNode, title: string) =>
    typeof document !== "undefined"
      ? createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={closeAll}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "32rem",
              maxHeight: "90vh",
              backgroundColor: "#fff",
              borderRadius: "4px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{
              padding: "1rem 1.5rem",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h3 style={{ margin: 0, fontWeight: 600, fontSize: "1.1rem" }}>{title}</h3>
              <button onClick={closeAll} style={{ border: "none", background: "none", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <div style={{ padding: "1.5rem", overflowY: "auto" }}>
              {content}
            </div>
          </div>
        </div>,
        document.body,
      )
      : null;

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

      {feedback && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            borderRadius: "4px",
            fontSize: "0.875rem",
            color: feedback.tone === "success" ? "#0f5132" : "#842029",
            backgroundColor: feedback.tone === "success" ? "#d1e7dd" : "#f8d7da",
          }}
        >
          {feedback.message}
        </div>
      )}

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
              <th style={headerCellStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
                  Tidak ada user yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={bodyCellStyle}>
                    <div style={{ fontWeight: 600 }}>{user.fullName || "—"}</div>
                    {user.bannedUntil && <span style={{ fontSize: "0.7rem", color: "red", fontWeight: "bold" }}>[BANNED]</span>}
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
                  <td style={bodyCellStyle}>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <button onClick={() => handleLoginAs(user.id)} style={actionButtonStyle}>Login As</button>
                      <button onClick={() => setModalState({ type: 'edit', user })} style={actionButtonStyle}>Edit</button>
                      <button onClick={() => setModalState({ type: 'merge', user })} style={actionButtonStyle}>Merge</button>
                      <button
                        onClick={() => handleToggleBan(user)}
                        style={{ ...actionButtonStyle, color: user.bannedUntil ? "green" : "red" }}
                      >
                        {user.bannedUntil ? "Unban" : "Disable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalState?.type === 'edit' && renderOverlay(
        <UserEditForm
          user={modalState.user}
          onCancel={closeAll}
          onSuccess={(msg) => {
            setFeedback({ tone: "success", message: msg });
            closeAll();
            router.refresh();
          }}
        />,
        "Edit User"
      )}

      {modalState?.type === 'merge' && renderOverlay(
        <MergeUsersModal
          sourceUser={modalState.user}
          allUsers={users}
          onCancel={closeAll}
          onSuccess={(msg) => {
            setFeedback({ tone: "success", message: msg });
            closeAll();
            router.refresh();
          }}
        />,
        "Merge Users"
      )}

    </div>
  );
}

function capitalize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
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

const actionButtonStyle: CSSProperties = {
  padding: "0.2rem 0.5rem",
  fontSize: "0.8rem",
  border: "1px solid #d1d5db",
  borderRadius: "3px",
  backgroundColor: "white",
  cursor: "pointer",
  color: "#374151"
};

