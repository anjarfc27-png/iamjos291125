'use client';

import { useI18n } from "@/contexts/I18nContext";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";

interface SystemPageHeaderProps {
    title: string;
    description?: string;
}

export function SystemPageHeader({ title, description }: SystemPageHeaderProps) {
    const { t } = useI18n();

    return (
        <div style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Breadcrumb */}
            <AdminBreadcrumb items={[
                { label: t('admin.siteAdministration'), href: '/admin' },
                { label: title }
            ]} />

            {/* Page Title */}
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
                    {title}
                </h1>
                {description && (
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#666',
                        margin: '0.5rem 0 0 0'
                    }}>
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
