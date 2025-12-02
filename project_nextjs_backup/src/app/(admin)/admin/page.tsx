'use client';

import Link from "next/link";
import { useI18n } from "@/contexts/I18nContext";
// import { VersionWarning } from "@/components/admin/version-warning";
import { pkpColors, pkpTypography } from "@/lib/theme";

export default function AdminPage() {
  const { t } = useI18n();

  return (
    <div style={{ fontFamily: pkpTypography.fontFamily, width: '100%' }}>
      {/* Page Title - Light gray background */}
      <div style={{
        backgroundColor: pkpColors.pageHeaderBg,
        padding: '1rem 0',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: pkpTypography.pageTitle,
          fontWeight: pkpTypography.semibold,
          color: pkpColors.textDark,
          margin: 0,
          fontFamily: pkpTypography.fontFamily
        }}>
          {t('admin.siteAdministration')}
        </h1>
      </div>

      {/* Content Panel - Pure white background */}
      <div style={{
        backgroundColor: pkpColors.contentBg,
        padding: 0
      }}>
        {/* Version Check Warning */}
        {/* <VersionWarning /> */}

        {/* Site Management Section */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: pkpTypography.sectionTitle,
            fontWeight: pkpTypography.bold,
            marginBottom: '1.25rem',
            color: pkpColors.titleDark,
            fontFamily: pkpTypography.fontFamily
          }}>
            {t('admin.siteManagement')}
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            <li style={{ marginBottom: '0.875rem' }}>
              <Link
                href="/admin/site-management/hosted-journals"
                style={{
                  color: pkpColors.linkBlue,
                  textDecoration: 'underline',
                  fontSize: pkpTypography.bodyRegular,
                  fontFamily: pkpTypography.fontFamily
                }}
                className="hover:no-underline"
              >
                {t('admin.hostedJournals')}
              </Link>
            </li>
            <li style={{ marginBottom: '0.875rem' }}>
              <Link
                href="/admin/site-settings/site-setup"
                style={{
                  color: pkpColors.linkBlue,
                  textDecoration: 'underline',
                  fontSize: pkpTypography.bodyRegular,
                  fontFamily: pkpTypography.fontFamily
                }}
                className="hover:no-underline"
              >
                {t('admin.siteSettings')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Administrative Functions Section */}
        <div>
          <h2 style={{
            fontSize: pkpTypography.sectionTitle,
            fontWeight: pkpTypography.bold,
            marginBottom: '1.25rem',
            color: pkpColors.titleDark,
            fontFamily: pkpTypography.fontFamily
          }}>
            {t('admin.administrativeFunctions')}
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            <li style={{ marginBottom: '0.875rem' }}>
              <Link
                href="/admin/system/system-information"
                style={{
                  color: pkpColors.linkBlue,
                  textDecoration: 'underline',
                  fontSize: pkpTypography.bodyRegular,
                  fontFamily: pkpTypography.fontFamily
                }}
                className="hover:no-underline"
              >
                {t('admin.systemInformation')}
              </Link>
            </li>
            <li style={{ marginBottom: '0.875rem' }}>
              <Link
                href="/admin/system/expire-sessions"
                style={{
                  color: pkpColors.linkBlue,
                  textDecoration: 'underline',
                  fontSize: pkpTypography.bodyRegular,
                  fontFamily: pkpTypography.fontFamily
                }}
                className="hover:no-underline"
              >
                {t('admin.expireUserSessions')}
              </Link>
            </li>
            <li style={{ marginBottom: '0.875rem' }}>
              <Link
                href="/admin/system/clear-data-caches"
                style={{
                  color: pkpColors.linkBlue,
                  textDecoration: 'underline',
                  fontSize: pkpTypography.bodyRegular,
                  fontFamily: pkpTypography.fontFamily
                }}
                className="hover:no-underline"
              >
                {t('admin.clearDataCaches')}
              </Link>
            </li>
            <li style={{ marginBottom: '0.875rem' }}>
              <Link
                href="/admin/system/clear-template-cache"
                style={{
                  color: pkpColors.linkBlue,
                  textDecoration: 'underline',
                  fontSize: pkpTypography.bodyRegular,
                  fontFamily: pkpTypography.fontFamily
                }}
                className="hover:no-underline"
              >
                {t('admin.clearTemplateCache')}
              </Link>
            </li>
            <li style={{ marginBottom: '0.875rem' }}>
              <Link
                href="/admin/system/clear-scheduled-tasks"
                style={{
                  color: pkpColors.linkBlue,
                  textDecoration: 'underline',
                  fontSize: pkpTypography.bodyRegular,
                  fontFamily: pkpTypography.fontFamily
                }}
                className="hover:no-underline"
              >
                {t('admin.clearScheduledTaskExecutionLogs')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}