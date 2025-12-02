"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { JOURNAL_ROLE_OPTIONS } from "../types";

type Props = {
  journal: { id: string; name: string };
};

type JournalUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

export function JournalUsersPanel({ journal }: Props) {
  const [users, setUsers] = useState<JournalUser[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>(JOURNAL_ROLE_OPTIONS.map((role) => role.value));
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(JOURNAL_ROLE_OPTIONS[0].value);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isAssigning, startAssign] = useTransition();
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/journals/${journal.id}/users`);
      const json = await res.json();
      if (json.ok) {
        setUsers(json.users ?? []);
        setAvailableRoles(json.availableRoles ?? availableRoles);
      } else {
        setFeedback({ tone: "error", message: json.message ?? "Gagal memuat pengguna." });
      }
    } catch {
      setFeedback({ tone: "error", message: "Kesalahan jaringan saat memuat pengguna." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journal.id]);

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.roles.some((r) => r.toLowerCase().includes(keyword)),
    );
  }, [users, search]);

  const handleAssign = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      setFeedback({ tone: "error", message: "Masukkan email pengguna yang ingin ditambahkan." });
      return;
    }
    startAssign(async () => {
      setFeedback(null);
      try {
        const res = await fetch(`/api/admin/journals/${journal.id}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), role }),
        });
        const json = await res.json();
        if (!json.ok) {
          setFeedback({ tone: "error", message: json.message ?? "Tidak dapat menambahkan pengguna." });
          return;
        }
        setEmail("");
        setFeedback({ tone: "success", message: "Peran berhasil ditambahkan." });
        fetchUsers();
      } catch {
        setFeedback({ tone: "error", message: "Kesalahan jaringan saat menambahkan pengguna." });
      }
    });
  };

  const handleRemove = (userId: string, targetRole: string) => {
    const key = `${userId}-${targetRole}`;
    setRemovingKey(key);
    fetch(`/api/admin/journals/${journal.id}/users`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: targetRole }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.ok) {
          setFeedback({ tone: "error", message: json.message ?? "Tidak dapat menghapus peran." });
          return;
        }
        setFeedback({ tone: "success", message: "Peran dihapus." });
        fetchUsers();
      })
      .catch(() => {
        setFeedback({ tone: "error", message: "Kesalahan jaringan saat menghapus peran." });
      })
      .finally(() => setRemovingKey(null));
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          Kelola pengguna yang memiliki akses ke <span className="font-semibold text-[var(--foreground)]">{journal.name}</span>.
        </p>
      </div>

      <div className="space-y-4 rounded-md border border-[var(--border)] bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Tambah Pengguna Berdasarkan Email</h3>
        <form className="flex flex-col gap-3 md:flex-row md:items-center" onSubmit={handleAssign}>
          <Input
            type="email"
            placeholder="contoh: editor@journal.org"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="flex-1"
          />
          <select
            className="h-11 rounded-md border border-[var(--border)] bg-white px-3 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            {availableRoles.map((value) => (
              <option key={value} value={value}>
                {JOURNAL_ROLE_OPTIONS.find((opt) => opt.value === value)?.label ?? value}
              </option>
            ))}
          </select>
          <Button type="submit" loading={isAssigning}>
            Tambah
          </Button>
        </form>
        <p className="text-xs text-[var(--muted)]">Pengguna harus sudah terdaftar pada instalasi ini.</p>
        {feedback && <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>}
      </div>

      <div className="space-y-3 rounded-md border border-[var(--border)] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input placeholder="Cari nama, email, atau role" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full md:w-64" />
          <p className="text-xs text-[var(--muted)]">Total pengguna: {users.length}</p>
        </div>

        <div className="overflow-hidden rounded-md border border-[var(--border)]">
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-[var(--muted)]">Memuat data pengguna…</div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-[var(--muted)]">Belum ada pengguna yang ditetapkan.</div>
          ) : (
            <table className="min-w-full divide-y divide-[var(--border)] text-sm">
              <thead className="bg-[var(--surface-muted)] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Nama</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Peran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{user.name}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {user.roles.map((userRole) => {
                          const key = `${user.id}-${userRole}`;
                          const roleLabel = JOURNAL_ROLE_OPTIONS.find((opt) => opt.value === userRole)?.label ?? userRole;
                          return (
                            <span
                              key={key}
                              className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]"
                            >
                              {roleLabel}
                              <button
                                type="button"
                                className="text-[var(--primary)] hover:underline"
                                onClick={() => handleRemove(user.id, userRole)}
                                disabled={removingKey === key}
                              >
                                ✕
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
