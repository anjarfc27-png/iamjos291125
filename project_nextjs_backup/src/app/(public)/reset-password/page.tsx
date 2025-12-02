import { Suspense } from "react";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="space-y-8">
      <div>
        <nav className="mb-6 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Beranda / Reset Kata Sandi
        </nav>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">
          Buat Kata Sandi Baru
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Masukkan kata sandi baru Anda. Setelah berhasil, Anda akan diarahkan
          ke halaman login.
        </p>
      </div>

      <Suspense fallback={<div>Memuat formulir...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

