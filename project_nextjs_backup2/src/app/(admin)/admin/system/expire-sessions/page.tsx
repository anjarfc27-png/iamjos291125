"use client";

import { useActionState } from "react";
import { expireAllSessionsAction } from "./actions";

type State = null | { ok: true; expired: number } | { ok: false; message: string };

export default function ExpireSessionsPage() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async () => expireAllSessionsAction(),
    null,
  );

  return (
    <div className="space-y-6" style={{
      gap: '1.5rem'
    }}>
      <section className="space-y-4" style={{
        gap: '1rem'
      }}>
        <h2 className="text-xl font-semibold text-gray-900" style={{
          fontSize: '1.25rem',
          fontWeight: '600'
        }}>
          Expire User Sessions
        </h2>
        <p className="text-sm text-gray-600" style={{
          fontSize: '0.875rem'
        }}>
          Mengakhiri seluruh sesi pengguna yang sedang aktif. Pengguna akan diminta
          login ulang. Gunakan sebelum melakukan upgrade sistem.
        </p>
      </section>

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
          Seluruh sesi pengguna berhasil diakhiri untuk {state.expired} akun.
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

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6" style={{
        padding: '1.5rem'
      }}>
        <p className="text-sm text-gray-600 mb-4" style={{
          fontSize: '0.875rem',
          marginBottom: '1rem'
        }}>
          Tindakan ini bersifat langsung dan permanen. Tidak ada notifikasi yang
          dikirim ke pengguna.
        </p>
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
              {pending ? 'Processing...' : 'Expire semua sesi sekarang'}
            </button>
          </form>
          <button
            type="button"
            disabled={pending}
            onClick={() => location.reload()}
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              backgroundColor: '#f8f9fa',
              color: '#006798',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              cursor: pending ? 'not-allowed' : 'pointer',
              opacity: pending ? 0.6 : 1
            }}
          >
            Muat ulang
          </button>
        </div>
      </div>
    </div>
  );
}

