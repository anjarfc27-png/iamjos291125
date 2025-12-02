import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function PublicLayout({ children }: Props) {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[var(--surface-muted)] py-16 px-4">
      <div className="mb-10 text-center">
        <div className="text-3xl font-semibold tracking-wide text-[var(--primary)]">
          OJS
        </div>
        <p className="text-sm font-medium text-[var(--muted)]">
          Open Journal Systems
        </p>
      </div>
      <section className="w-full max-w-xl rounded-lg bg-white p-10 shadow-sm ring-1 ring-[var(--border)]">
        {children}
      </section>
    </main>
  );
}

