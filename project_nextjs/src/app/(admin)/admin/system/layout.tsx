"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { pkpColors, pkpTypography } from "@/lib/theme";

type Props = {
  children: ReactNode;
};

export default function SystemLayout({ children }: Props) {
  const pathname = usePathname();
  const { t } = useI18n();

  const SYSTEM_LINKS = [
    { href: "/admin/system/system-information", label: t('admin.systemInformation') },
    { href: "/admin/system/expire-sessions", label: t('admin.expireUserSessions') },
    { href: "/admin/system/clear-data-caches", label: t('admin.clearDataCaches') },
    { href: "/admin/system/clear-template-cache", label: t('admin.clearTemplateCache') },
    { href: "/admin/system/clear-scheduled-tasks", label: t('admin.clearScheduledTaskExecutionLogs') },
  ];

  const currentLink = SYSTEM_LINKS.find(link => pathname === link.href);
  const currentLabel = currentLink?.label || t('admin.administrativeFunctions');

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div style={{ paddingBottom: '0.5rem' }}>
        <AdminBreadcrumb items={[
          { label: t('admin.siteAdministration'), href: '/admin' },
          { label: currentLabel }
        ]} />
      </div>

      {/* Page Header */}
      <div className="bg-gray-200 px-6 py-4" style={{
        backgroundColor: pkpColors.pageHeaderBg,
        padding: '1rem 0',
        marginBottom: '1.5rem'
      }}>
        <h1 style={{
          fontSize: pkpTypography.pageTitle,
          fontWeight: pkpTypography.semibold,
          color: pkpColors.textDark,
          fontFamily: pkpTypography.fontFamily,
          margin: 0
        }}>
          {t('admin.administrativeFunctions')}
        </h1>
      </div>

      {/* Content with Sidebar */}
      <div className="px-6 py-6" style={{ padding: 0 }}>
        <div className="grid gap-6 md:grid-cols-[250px_1fr]" style={{ gap: '1.5rem' }}>
          <aside className="space-y-2 rounded border border-gray-200 bg-white p-4" style={{ padding: '1rem' }}>
            {SYSTEM_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 text-sm ${active ? "font-semibold bg-blue-50" : "hover:underline hover:bg-gray-50"}`}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: pkpTypography.bodySmall,
                    borderRadius: '0.25rem',
                    color: pkpColors.linkBlue,
                    fontFamily: pkpTypography.fontFamily
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </aside>
          <div className="rounded border border-gray-200 bg-white p-6" style={{ padding: '1.5rem' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}