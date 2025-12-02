'use client';

import Link from "next/link";
import { useI18n } from "@/contexts/I18nContext";

type Props = {
  nodeVersion: string;
  osInfo: string;
  dbInfo: string;
  webServer: string;
  supabaseUrl: string;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3" style={{
      padding: '0.75rem 1rem'
    }}>
      <span className="font-semibold text-gray-900">{label}</span>
      <span className="text-gray-600">{value}</span>
    </div>
  );
}

export function SystemInformationClient({ nodeVersion, osInfo, dbInfo, webServer, supabaseUrl }: Props) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6" style={{
        padding: '1.5rem'
      }}>
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900" style={{
              fontSize: '1.125rem',
              fontWeight: '600'
            }}>
              {t('systemInfo.ojsVersionInformation')}
            </h2>
            <p className="text-sm text-gray-600 mt-1" style={{
              fontSize: '0.875rem',
              marginTop: '0.25rem'
            }}>
              {t('systemInfo.versionDescription')}
            </p>
          </div>
          <button
            type="button"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.375rem 0.75rem',
              backgroundColor: '#006798',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {t('systemInfo.checkForUpdates')}
          </button>
        </header>
        <dl className="grid gap-4 text-sm" style={{
          gap: '1rem',
          fontSize: '0.875rem'
        }}>
          <div className="flex items-center justify-between">
            <dt className="font-semibold text-gray-900">{t('systemInfo.currentVersion')}</dt>
            <dd className="text-gray-600">3.3.0.21 (Clone)</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="font-semibold text-gray-900">
              {t('systemInfo.latestUpgrade')}
            </dt>
            <dd className="text-gray-600">March 10, 2025</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6" style={{
        padding: '1.5rem'
      }}>
        <header>
          <h2 className="text-lg font-semibold text-gray-900" style={{
            fontSize: '1.125rem',
            fontWeight: '600'
          }}>
            {t('systemInfo.serverInformation')}
          </h2>
        </header>
        <dl className="grid gap-3 text-sm" style={{
          gap: '0.75rem',
          fontSize: '0.875rem'
        }}>
          <Row label={t('systemInfo.operatingSystem')} value={osInfo} />
          <Row label={t('systemInfo.nodejsVersion')} value={nodeVersion} />
          <Row label={t('systemInfo.database')} value={dbInfo} />
          <Row label={t('systemInfo.webServer')} value={webServer} />
        </dl>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6" style={{
        padding: '1.5rem'
      }}>
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900" style={{
            fontSize: '1.125rem',
            fontWeight: '600'
          }}>
            {t('systemInfo.ojsConfiguration')}
          </h2>
          <Link
            href="/admin/system/nodejs-info"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.375rem 0.75rem',
              backgroundColor: '#f8f9fa',
              color: '#006798',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            {t('systemInfo.extendedNodejsInformation')}
          </Link>
        </header>
        <table className="w-full text-sm" style={{
          fontSize: '0.875rem'
        }}>
          <tbody className="divide-y divide-gray-200 bg-white">
            {[
              ["general.locale", "id_ID"],
              ["files.directory", "/srv/ojs/files"],
              ["installed", "On"],
              ["session.force_ssl", "Off"],
              ["supabase.url", supabaseUrl],
            ].map(([key, value]) => (
              <tr key={key}>
                <td className="px-4 py-2 font-semibold text-gray-900" style={{
                  padding: '0.5rem 1rem'
                }}>
                  {key}
                </td>
                <td className="px-4 py-2 text-gray-600" style={{
                  padding: '0.5rem 1rem'
                }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
