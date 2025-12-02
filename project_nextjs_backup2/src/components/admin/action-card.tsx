import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  href: string;
  actionLabel?: string;
};

export function ActionCard({
  title,
  description,
  href,
  actionLabel = "Lihat",
}: Props) {
  return (
    <div className="relative rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* Blue top border */}
      <div className="absolute left-0 top-0 h-1 w-full rounded-t-lg bg-[var(--primary)]" />
      
      <div className="mt-1 space-y-2">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          {title}
        </h3>
        {description && (
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            {description}
          </p>
        )}
      </div>
      <div className="mt-5 border-t border-[var(--border)] pt-4">
        <Link
          href={href}
          className="inline-block text-sm font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-dark)] hover:underline"
        >
          {actionLabel} →
        </Link>
      </div>
    </div>
  );
}

