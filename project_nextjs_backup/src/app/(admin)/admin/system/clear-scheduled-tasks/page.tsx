"use client";

import { useActionState } from "react";
import { clearScheduledTaskLogsAction } from "./actions";

const MOCK_LOGS = [
  { id: "log-1", name: "Reminder email", executedAt: "2025-03-10 02:00" },
  { id: "log-2", name: "Subscription renewal", executedAt: "2025-03-09 04:30" },
  { id: "log-3", name: "Usage statistics", executedAt: "2025-03-08 23:45" },
];

export default function ClearScheduledTaskLogsPage() {
  const [state, formAction, pending] = useActionState<
    | null
    | { ok: true; deleted: number }
    | { ok: false; message: string },
    FormData
  >(async () => clearScheduledTaskLogsAction(), null);

  return (
    <div className="space-y-6" style={{
      gap: '1.5rem'
    }}>
      <header className="space-y-2" style={{
        gap: '0.5rem'
      }}>
        <h2 className="text-xl font-semibold text-gray-900" style={{
          fontSize: '1.25rem',
          fontWeight: '600'
        }}>
          Clear Scheduled Task Execution Logs
        </h2>
        <p className="text-sm text-gray-600" style={{
          fontSize: '0.875rem'
        }}>
          Hapus file log eksekusi tugas terjadwal dari server. Anda dapat
          melakukan ini untuk menghemat ruang penyimpanan.
        </p>
      </header>

      {state?.ok && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          color: '#155724',
          fontSize: '0.875rem',
          marginBottom: '1rem'
        }}>
          Log tugas terjadwal berhasil dihapus{typeof state.deleted === "number" ? ` (${state.deleted})` : ""}.
        </div>
      )}
      {state && !state.ok && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          fontSize: '0.875rem',
          marginBottom: '1rem'
        }}>
          {state.message}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.75rem'
              }}>
                Nama tugas
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.75rem'
              }}>
                Eksekusi terakhir
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {MOCK_LOGS.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 text-sm text-gray-900" style={{
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem'
                }}>
                  {log.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600" style={{
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem'
                }}>
                  {log.executedAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        display: 'flex',
        gap: '0.75rem'
      }}>
        <form action={formAction} style={{ display: 'contents' }}>
          <button
            type="submit"
            disabled={pending}
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              backgroundColor: pending ? '#ccc' : '#d32f2f',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: pending ? 'not-allowed' : 'pointer',
              opacity: pending ? 0.6 : 1
            }}
          >
            {pending ? 'Processing...' : 'Clear Logs'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => {
            window.location.href = "/api/admin/download-task-log";
          }}
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.5rem 1rem',
            backgroundColor: '#f8f9fa',
            color: '#006798',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Download Log File
        </button>
      </div>
    </div>
  );
}

