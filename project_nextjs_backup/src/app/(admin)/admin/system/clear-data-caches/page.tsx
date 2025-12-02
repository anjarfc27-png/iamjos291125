"use client";

import { useActionState } from "react";
import { clearDataCachesAction } from "./actions";

const CACHE_ITEMS = [
  { id: "locale", label: "Locale data cache", description: "Istilah dan terjemahan." },
  { id: "help", label: "Help cache", description: "Konten bantuan pengguna." },
  { id: "search", label: "Search cache", description: "Index pencarian artikel." },
];

export default function ClearDataCachesPage() {
  const [state, formAction, pending] = useActionState<{ ok: true } | null, FormData>(
    async () => clearDataCachesAction(),
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
          Clear Data Caches
        </h2>
        <p className="text-sm text-gray-600" style={{
          fontSize: '0.875rem'
        }}>
          Paksa pemuatan ulang data setelah melakukan perubahan konfigurasi atau penyesuaian.
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
          Cache data berhasil dibersihkan. Versi terbaru akan dibuat ulang secara otomatis.
        </div>
      )}

      <div className="space-y-4" style={{
        gap: '1rem'
      }}>
        {CACHE_ITEMS.map((item) => (
          <div
            key={item.id}
            className="rounded-md border border-gray-200 bg-gray-50 p-5"
            style={{
              padding: '1.25rem'
            }}
          >
            <h3 className="text-base font-semibold text-gray-900 mb-2" style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              {item.label}
            </h3>
            <p className="text-sm text-gray-600" style={{
              fontSize: '0.875rem'
            }}>
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          style={{
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
          {pending ? 'Processing...' : 'Clear Data Caches'}
        </button>
      </form>
    </div>
  );
}

