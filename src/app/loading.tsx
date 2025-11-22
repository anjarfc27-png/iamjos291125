'use client'

import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Memuat Halaman
        </h2>
        <p className="text-gray-600">
          Silakan tunggu sebentar...
        </p>
      </div>
    </div>
  )
}