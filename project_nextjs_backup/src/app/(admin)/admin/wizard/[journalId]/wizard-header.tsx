'use client';

import Link from "next/link";
import { useI18n } from "@/contexts/I18nContext";

type Props = {
  journalName?: string;
};

export function WizardHeader({ journalName }: Props) {
  const { t } = useI18n();

  return (
    <div className="bg-gray-200 px-6 py-4" style={{
      backgroundColor: '#e5e5e5',
      padding: '1rem 1.5rem'
    }}>
      {/* Breadcrumb */}
      <div className="mb-2" style={{ marginBottom: '0.5rem' }}>
        <Link 
          href="/admin" 
          style={{
            color: '#006798',
            textDecoration: 'underline',
            fontSize: '1rem'
          }}
          className="hover:no-underline"
        >
          {t('admin.siteAdministration')}
        </Link>
        <span style={{ 
          color: '#6B7280', 
          margin: '0 0.5rem',
          fontSize: '1rem'
        }}>»</span>
        <Link 
          href="/admin/site-management/hosted-journals" 
          style={{
            color: '#006798',
            textDecoration: 'underline',
            fontSize: '1rem'
          }}
          className="hover:no-underline"
        >
          {t('admin.hostedJournals')}
        </Link>
        <span style={{ 
          color: '#6B7280', 
          margin: '0 0.5rem',
          fontSize: '1rem'
        }}>»</span>
        <span style={{ 
          color: '#111827',
          fontSize: '1rem'
        }}>
          {journalName || t('wizard.title')}
        </span>
      </div>
      <h1 className="text-xl font-semibold text-gray-900" style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#111827'
      }}>
        {t('wizard.title')}
      </h1>
    </div>
  );
}

