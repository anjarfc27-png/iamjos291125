import Link from "next/link";

import { FormMessage } from "@/components/ui/form-message";

import { LoginForm } from "@/features/auth/components/login-form";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const registered = params.registered === "true";
  const resetSuccess = params.reset === "success";

  return (
    <div className="page page_login">
      <nav className="mb-6 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--primary-dark)]">
          Beranda
        </Link>{" "}
        / Login
      </nav>

      <h1 className="mb-4 text-3xl font-semibold text-[var(--foreground)]">
        Masuk
      </h1>

      <p className="mb-6 text-sm text-[var(--muted)]">
        Kolom bertanda <span className="text-[#b91c1c]">*</span> wajib diisi.
      </p>

      {(registered || resetSuccess) && (
        <div className="mb-6">
          <FormMessage tone="success">
            {registered
              ? "Akun berhasil dibuat. Silakan cek email Anda untuk konfirmasi dan lakukan login."
              : "Kata sandi berhasil diperbarui. Anda dapat login dengan password baru."}
          </FormMessage>
        </div>
      )}

      <LoginForm />
    </div>
  );
}

