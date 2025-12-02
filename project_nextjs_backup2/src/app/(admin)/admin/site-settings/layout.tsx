"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/contexts/I18nContext";
import type { ReactNode } from "react";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { pkpColors, pkpTypography } from "@/lib/theme";

type Props = { children: ReactNode };

export default function SiteSettingsLayout({ children }: Props) {
  const pathname = usePathname();
  const { t } = useI18n();

  const MAIN_TABS = [
    { id: "setup", label: t('siteSettings.setup'), href: "/admin/site-settings/site-setup" },
    { id: "appearance", label: t('siteSettings.appearance'), href: "/admin/site-settings/appearance" },
    { id: "plugins", label: t('siteSettings.plugins'), href: "/admin/site-settings/plugins" },
  ] as const;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div style={{ padding: '0 1.5rem 0.5rem 1.5rem' }}>
        <AdminBreadcrumb items={[
          { label: t('admin.siteAdministration'), href: '/admin' },
          { label: t('admin.siteSettings') }
        ]} />
      </div>

      {/* Page Header */}
      <div className="bg-gray-200 px-6 py-4" style={{
        backgroundColor: pkpColors.pageHeaderBg,
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h1 style={{
          fontSize: pkpTypography.sectionTitle,
          fontWeight: pkpTypography.bold,
          color: pkpColors.textDark,
          fontFamily: pkpTypography.fontFamily,
          margin: 0
        }}>
          {t('admin.siteSettings')}
        </h1>
      </div>

      {/* Tab Navigation */}
      <nav className="mb-6 border-b border-gray-200" style={{
        marginBottom: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 1.5rem'
      }}>
        <div className="flex gap-6" style={{ gap: '1.5rem' }}>
          {MAIN_TABS.map((tab) => {
            const active = pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`pb-3 px-1 font-semibold transition-colors ${active ? "border-b-2" : "hover:text-[#004d75]"}`}
                style={{
                  fontSize: pkpTypography.bodyLarge,
                  paddingBottom: '0.75rem',
                  borderBottom: active ? `2px solid ${pkpColors.linkBlue}` : 'none',
                  fontWeight: pkpTypography.semibold,
                  color: pkpColors.linkBlue,
                  fontFamily: pkpTypography.fontFamily
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      {children}
    </div>
  );
}