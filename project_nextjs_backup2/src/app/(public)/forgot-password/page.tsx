import Link from "next/link";

import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-8">
      <div>
        <nav className="mb-6 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--primary-dark)]">
            Beranda
          </Link>{" "}
          / Lupa Kata Sandi
        </nav>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">
          Atur Ulang Kata Sandi
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Masukkan email terdaftar. Kami akan mengirim tautan untuk mengatur
          ulang kata sandi Anda.
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}

