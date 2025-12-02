import { PageHeader } from "@/components/admin/page-header";

const dummyUsers = [
  {
    id: "1",
    name: "Dr. Andi Wijaya, M.Kom",
    email: "andi.wijaya@ui.ac.id",
    role: "Editor-in-Chief",
    status: "active",
    registeredAt: "2023-01-15",
    lastLogin: "2024-01-20T10:30:00Z"
  },
  {
    id: "2",
    name: "Siti Nurhaliza, S.T., M.T.",
    email: "siti.nurhaliza@ugm.ac.id",
    role: "Section Editor",
    status: "active",
    registeredAt: "2023-03-20",
    lastLogin: "2024-01-19T14:15:00Z"
  },
  {
    id: "3",
    name: "Bambang Suryadi, S.Kom., M.Kom.",
    email: "bambang.s@itb.ac.id",
    role: "Reviewer",
    status: "active",
    registeredAt: "2023-05-10",
    lastLogin: "2024-01-18T09:45:00Z"
  },
  {
    id: "4",
    name: "Dr. Ratih Pratiwi, M.Kom.",
    email: "ratih.pratiwi@unpad.ac.id",
    role: "Copyeditor",
    status: "inactive",
    registeredAt: "2023-02-28",
    lastLogin: "2023-12-15T16:20:00Z"
  },
  {
    id: "5",
    name: "Dr. Budi Santoso",
    email: "budi.santoso@binus.ac.id",
    role: "Reviewer",
    status: "active",
    registeredAt: "2023-04-12",
    lastLogin: "2024-01-21T11:00:00Z"
  }
];

export default function UsersRolesPage() {
  return (
    <section style={{
      width: "100%",
      maxWidth: "100%",
      minHeight: "100%",
      backgroundColor: "#eaedee",
      padding: 0,
      margin: 0,
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    }}>
      {/* Page Header - OJS 3.3 Style with Safe Area */}
      <div style={{
        padding: "1.5rem 1.5rem 0 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}>
        <div>
          <h1 className="text-2xl font-bold text-[#002C40] mb-2">
            Users & Roles
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginBottom: "1.5rem",
          }}>
            Kelola pengguna dan peran di jurnal.
          </p>
        </div>
        <button
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
      </div>

      {/* Content - OJS 3.3 Style with Safe Area */}
      <div style={{
        padding: "0 1.5rem",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}>
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-sm" style={{
          width: "100%",
          maxWidth: "100%",
        }}>
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <strong className="text-sm text-[var(--foreground)]">Journal Users</strong>
            <button className="px-3 py-1.5 text-sm bg-[var(--primary)] text-white rounded hover:bg-[var(--primary-dark)]">
              Add User
            </button>
          </div>

          <div className="p-0">
            <table className="w-full">
              <thead className="bg-[var(--surface-muted)]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)]">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)]">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)]">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)]">Registered</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dummyUsers.map((user) => (
                  <tr key={user.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-[var(--foreground)]">{user.name}</div>
                      <div className="text-[var(--muted)]">{user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">{user.role}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">{user.registeredAt}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button className="text-[var(--primary)] hover:text-[var(--primary-dark)]">Edit</button>
                        <button className="text-[var(--primary)] hover:text-[var(--primary-dark)]">Roles</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}