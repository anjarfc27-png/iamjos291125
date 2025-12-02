'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, use } from 'react';
import { pkpColors, pkpTypography } from '@/lib/theme';
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb';

type Props = {
    children: ReactNode;
    params: Promise<{ journalId: string }>;
};

export default function JournalSettingsLayout({ children, params }: Props) {
    const pathname = usePathname();
    const { journalId } = use(params);

    const JOURNAL_TABS = [
        { id: 'settings', label: 'Settings', href: `/journals/${journalId}/settings` },
        { id: 'plugins', label: 'Plugins', href: `/journals/${journalId}/settings/plugins` },
        { id: 'users', label: 'Users', href: `/journals/${journalId}/settings/users` },
    ];

    const isWizard = pathname?.endsWith('/wizard');

    if (isWizard) {
        return <>{children}</>;
    }

    return (
        <div style={{ fontFamily: pkpTypography.fontFamily, width: '100%' }}>
            {/* Breadcrumb */}
            <div style={{ paddingBottom: '0.5rem' }}>
                <AdminBreadcrumb items={[
                    { label: 'Site Administration', href: '/admin' },
                    { label: 'Hosted Journals', href: '/admin/site-management/hosted-journals' },
                    { label: 'Journal Settings' }
                ]} />
            </div>

            {/* Page Header */}
            <div style={{
                backgroundColor: pkpColors.pageHeaderBg,
                padding: '1rem 0',
                marginBottom: '1.5'
            }}>
                <h1 style={{
                    fontSize: pkpTypography.sectionTitle,
                    fontWeight: pkpTypography.bold,
                    color: pkpColors.textDark,
                    margin: 0,
                    fontFamily: pkpTypography.fontFamily
                }}>
                    Journal Settings
                </h1>
            </div>

            {/* Tab Navigation */}
            <nav style={{
                borderBottom: `2px solid ${pkpColors.borderSubtle}`,
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    {JOURNAL_TABS.map((tab) => {
                        const active = pathname === tab.href || pathname?.startsWith(tab.href + '/');
                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                style={{
                                    padding: '0.75rem 0.25rem',
                                    fontSize: pkpTypography.bodyRegular,
                                    fontWeight: pkpTypography.semibold,
                                    color: active ? '#006798' : pkpColors.textDark,
                                    textDecoration: 'none',
                                    borderBottom: active ? '4px solid #006798' : 'none',
                                    marginBottom: '-2px',
                                    fontFamily: pkpTypography.fontFamily
                                }}
                                className={active ? '' : 'hover:text-[#004d75]'}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Tab Content */}
            {children}
        </div>
    );
}
