'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ReviewerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Reviewer section error:', error)
  }, [error])

  return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Terjadi Kesalahan di Bagian Reviewer
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                Maaf, terjadi kesalahan saat memuat bagian reviewer. Silakan coba lagi.
              </p>
            </div>
            <div className="mt-4">
              <button
                onClick={reset}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}