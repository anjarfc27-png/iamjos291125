'use client';

import { pkpColors, pkpTypography } from '@/lib/theme';

type Props = {
    params: { journalId: string };
};

export default function JournalPluginsPage({ params }: Props) {
    return (
        <div>
            <div style={{
                backgroundColor: '#fff',
                border: ' 1px solid #e5e5e5',
                borderRadius: '4px',
                padding: '1.5rem'
            }}>
                <h2 style={{
                    fontSize: pkpTypography.sectionTitle,
                    fontWeight: pkpTypography.bold,
                    color: pkpColors.textDark,
                    marginTop: 0,
                    marginBottom: '1rem',
                    fontFamily: pkpTypography.fontFamily
                }}>
                    Plugins
                </h2>
                <p style={{
                    fontSize: pkpTypography.bodyRegular,
                    color: pkpColors.textGray,
                    fontFamily: pkpTypography.fontFamily
                }}>
                    Manage plugins for this journal. Plugin functionality will be implemented here.
                </p>
            </div>
        </div>
    );
}
