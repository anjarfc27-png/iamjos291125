"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="flex-shrink-0">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Terjadi Kesalahan
          </h1>
          <p className="text-gray-600 mb-6">
            Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-left">
              <p className="text-sm text-red-800 font-medium mb-2">
                Detail Error:
              </p>
              <p className="text-sm text-red-700 font-mono">{error.message}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Coba Lagi
            </button>

            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
