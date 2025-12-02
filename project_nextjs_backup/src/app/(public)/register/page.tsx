import Link from "next/link";

import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <div>
        <nav className="mb-6 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--primary-dark)]">
            Beranda
          </Link>{" "}
          / Register
        </nav>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">
          Daftar
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Kolom bertanda <span className="text-[#b91c1c]">*</span> wajib diisi.
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}

