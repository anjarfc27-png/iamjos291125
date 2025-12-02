'use client';

import Link from 'next/link';
import { pkpColors, pkpTypography } from '@/lib/theme';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface AdminBreadcrumbProps {
    items: BreadcrumbItem[];
}

export function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
    return (
        <div style={{
            fontSize: pkpTypography.bodySmall,
            color: pkpColors.textGray,
            marginBottom: '0.5rem',
            fontFamily: pkpTypography.fontFamily,
            padding: '0.5rem 0'
        }}>
            {items.map((item, index) => (
                <span key={index}>
                    {item.href ? (
                        <Link
                            href={item.href}
                            style={{
                                color: pkpColors.linkBlue,
                                textDecoration: 'none',
                                fontFamily: pkpTypography.fontFamily
                            }}
                            className="hover:underline"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span style={{ color: pkpColors.textDark, fontFamily: pkpTypography.fontFamily }}>{item.label}</span>
                    )}
                    {index < items.length - 1 && (
                        <span style={{
                            margin: '0 0.5rem',
                            color: pkpColors.textGray
                        }}> / </span>
                    )}
                </span>
            ))}
        </div>
    );
}
