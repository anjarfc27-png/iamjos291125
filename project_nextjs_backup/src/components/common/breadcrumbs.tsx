import Link from "next/link";

type Crumb = {
  label: string;
  href?: string;
};

type Props = {
  crumbs: Crumb[];
};

export function Breadcrumbs({ crumbs }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="app__breadcrumbs text-sm text-[var(--muted)]"
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={crumb.label}>
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className="text-[var(--primary)] hover:text-[var(--primary-dark)] font-medium"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="font-semibold text-[var(--foreground)]">{crumb.label}</span>
            )}
            {!isLast && <span className="app__breadcrumbsSeparator mx-2 text-gray-400">/</span>}
          </span>
        );
      })}
    </nav>
  );
}

