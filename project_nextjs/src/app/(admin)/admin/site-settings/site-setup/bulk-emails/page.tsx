import { fetchHostedJournals } from "@/features/journals/data";
import { getBulkEmailPermissions, updateBulkEmailPermissionsAction } from "../../actions";

export const dynamic = 'force-dynamic';

export default async function SiteSetupBulkEmailsPage() {
  const [journals, permissions] = await Promise.all([
    fetchHostedJournals(),
    getBulkEmailPermissions()
  ]);
  const allowed = new Set(
    permissions.permissions
      .filter((item) => item.allow)
      .map((item) => item.id)
  );

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <header style={{
        padding: "1rem 1.5rem",
        backgroundColor: "#f9fafb",
        borderBottom: '1px solid #e5e5e5',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: "1rem",
          fontWeight: "600",
          color: '#002C40',
          margin: 0
        }}>
          Bulk Emails
        </h2>
      </header>

      <form action={updateBulkEmailPermissionsAction} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '0 1.5rem 2rem 1.5rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {journals.length === 0 && (
            <div style={{
              padding: '0.75rem 1rem',
              border: '1px dashed #dee2e6',
              borderRadius: '4px',
              backgroundColor: '#f8f9fa',
              fontSize: '0.875rem',
              color: '#666',
              fontStyle: 'italic'
            }}>
              Belum ada jurnal yang di-host. Tambahkan jurnal pada menu Hosted Journals untuk mengaktifkan izin email massal.
            </div>
          )}

          {journals.map((journal) => (
            <label
              key={journal.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer'
              }}
            >
              <input type="hidden" name="journal_id" value={journal.id} />
              <span style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40'
              }}>
                {journal.name}
              </span>
              <input
                type="checkbox"
                name="allow_journal"
                value={journal.id}
                defaultChecked={allowed.has(journal.id)}
                style={{
                  width: '1rem',
                  height: '1rem',
                  cursor: 'pointer'
                }}
              />
            </label>
          ))}
        </div>

        <div style={{
          padding: '0.75rem 0',
          fontSize: '0.875rem',
          color: '#666'
        }}>
          <p style={{ margin: 0 }}>
            Pastikan kebijakan anti-spam & privasi user telah dipenuhi sebelum mengaktifkan email massal.
          </p>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          marginTop: '1rem'
        }}>
          <button
            type="submit"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              backgroundColor: '#006798',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
