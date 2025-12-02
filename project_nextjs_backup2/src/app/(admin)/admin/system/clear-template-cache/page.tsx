"use client";

import { useActionState } from "react";
import { clearTemplateCacheAction } from "./actions";

export default function ClearTemplateCachePage() {
  const [state, formAction, pending] = useActionState<{ ok: true } | null, FormData>(
    async () => clearTemplateCacheAction(),
    null,
  );

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
          Clear Template Cache
        </h2>
        <p className="text-sm text-gray-600" style={{
          fontSize: '0.875rem'
        }}>
          Hapus versi cache dari template HTML. Berguna setelah melakukan perubahan tampilan.
        </p>
      </header>

      {state && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          color: '#155724',
          fontSize: '0.875rem',
          marginBottom: '1rem'
        }}>
          Template cache berhasil dibersihkan. Template terbaru akan dimuat saat permintaan berikutnya.
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6" style={{
        padding: '1.5rem'
      }}>
        <p className="text-sm text-gray-600 mb-4" style={{
          fontSize: '0.875rem',
          marginBottom: '1rem'
        }}>
          Proses ini hanya memengaruhi file template. Tidak ada konten jurnal yang berubah.
        </p>
        <form action={formAction}>
          <button
            type="submit"
            disabled={pending}
            style={{
              marginTop: '1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              backgroundColor: pending ? '#ccc' : '#006798',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: pending ? 'not-allowed' : 'pointer',
              opacity: pending ? 0.6 : 1
            }}
          >
            {pending ? 'Processing...' : 'Clear Template Cache'}
          </button>
        </form>
      </div>
    </div>
  );
}

