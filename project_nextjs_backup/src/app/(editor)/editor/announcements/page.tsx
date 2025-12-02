import { PageHeader } from "@/components/admin/page-header";

const dummyAnnouncements = [
  {
    id: "1",
    title: "Pengumuman: Perpanjangan Tenggat Waktu Pengiriman Naskah",
    content: "Kami menginformasikan bahwa tenggat waktu pengiriman naskah untuk volume 16 nomor 1 tahun 2025 diperpanjang hingga 30 Maret 2025.",
    status: "published",
    createdAt: "2024-01-20T10:00:00Z",
    expiresAt: "2025-03-30T23:59:59Z"
  },
  {
    id: "2",
    title: "Workshop: Panduan Penulisan Artikel Ilmiah",
    content: "Jurnal akan mengadakan workshop panduan penulisan artikel ilmiah pada tanggal 15 Februari 2025. Pendaftaran dibuka untuk semua penulis.",
    status: "published", 
    createdAt: "2024-01-18T14:30:00Z",
    expiresAt: "2025-02-15T00:00:00Z"
  },
  {
    id: "3",
    title: "Pemberitahuan: Pemeliharaan Sistem",
    content: "Sistem OJS akan mengalami pemeliharaan rutin pada hari Sabtu, 27 Januari 2025 mulai pukul 22:00 - 24:00 WIB.",
    status: "draft",
    createdAt: "2024-01-15T09:15:00Z",
    expiresAt: "2025-01-27T23:59:59Z"
  }
];

export default function AnnouncementsPage() {
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
        backgroundColor: "#ffffff",
        borderBottom: "2px solid #e5e5e5",
        padding: "1.5rem 0", // Safe padding
      }}>
        <div style={{
          padding: "0 1.5rem", // Safe padding horizontal
        }}>
          <h1 style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            margin: 0,
            padding: "0.5rem 0",
            lineHeight: "2.25rem",
            color: "#002C40",
          }}>
            Announcements
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "0.5rem",
            marginBottom: 0,
          }}>
            Kelola pengumuman untuk jurnal.
          </p>
        </div>
      </div>

      {/* Content - OJS 3.3 Style with Safe Area */}
      <div style={{
        padding: "0 1.5rem", // Safe padding horizontal
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}>
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-sm" style={{
          width: "100%",
          maxWidth: "100%",
        }}>
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <strong className="text-sm text-[var(--foreground)]">Announcements</strong>
          <button className="px-3 py-1.5 text-sm bg-[var(--primary)] text-white rounded hover:bg-[var(--primary-dark)]">
            Add Announcement
          </button>
        </div>
        
        <div className="p-0">
          <table className="w-full">
            <thead className="bg-[var(--surface-muted)]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)]">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)]">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)]">Created</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)]">Expires</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dummyAnnouncements.map((announcement) => (
                <tr key={announcement.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]">
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-[var(--foreground)]">{announcement.title}</div>
                    <div className="text-[var(--muted)] text-xs mt-1 line-clamp-2">{announcement.content}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      announcement.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {announcement.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                    {new Date(announcement.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                    {new Date(announcement.expiresAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button className="text-[var(--primary)] hover:text-[var(--primary-dark)]">Edit</button>
                      <button className="text-[var(--primary)] hover:text-[var(--primary-dark)]">Preview</button>
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