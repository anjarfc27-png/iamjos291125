'use client';

import { useI18n } from "@/contexts/I18nContext";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";

export function SystemInformationHeader() {
  const { t } = useI18n();

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '100%'
    }}>
      {/* Breadcrumb */}
      <AdminBreadcrumb items={[
        { label: t('admin.siteAdministration'), href: '/admin' },
        { label: t('admin.systemInformation') }
      ]} />

      {/* Page Title - Light gray background */}
      <div style={{
        backgroundColor: '#E5E5E5',
        padding: '1rem 1.5rem',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#111827',
          margin: 0
        }}>
          {t('admin.systemInformation')}
        </h1>
      </div>
    </div>
  );
}
