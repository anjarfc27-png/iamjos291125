'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/providers/supabase-provider';
import { pkpColors, pkpTypography } from '@/lib/theme';

type Props = {
    params: { journalId: string };
};

export default function JournalUsersPage({ params }: Props) {
    const supabase = useSupabase();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, [params.journalId]);

    const loadUsers = async () => {
        try {
            // Fetch users assigned to this journal
            const { data, error } = await supabase
                .from('user_user_groups')
                .select(`
          user_id,
          user_accounts (
            username,
            email
          ),
          user_groups (
            user_group_id,
            role_id
          )
        `)
                .eq('context_id', params.journalId);

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading users...</div>;
    }

    return (
        <div>
            <div style={{
                backgroundColor: '#fff',
                border: '1px solid #e5e5e5',
                borderRadius: '4px',
                padding: '1.5rem'
            }}>
                <h2 style={{
                    fontSize: pkpTypography.sectionTitle,
                    fontWeight: pkpTypography.bold,
                    color: pkpColors.textDark,
                    marginTop: 0,
                    marginBottom: '1.5rem',
                    fontFamily: pkpTypography.fontFamily
                }}>
                    Journal Users
                </h2>

                {users.length === 0 ? (
                    <p style={{
                        fontSize: pkpTypography.bodyRegular,
                        color: pkpColors.textGray,
                        fontFamily: pkpTypography.fontFamily
                    }}>
                        No users assigned to this journal yet.
                    </p>
                ) : (
                    <div style={{
                        border: '1px solid #e5e5e5',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#f8f9fa' }}>
                                <tr>
                                    <th style={{
                                        padding: '0.75rem 1rem',
                                        textAlign: 'left',
                                        fontSize: pkpTypography.bodySmall,
                                        fontWeight: pkpTypography.semibold,
                                        color: pkpColors.textDark,
                                        borderBottom: '1px solid #e5e5e5',
                                        fontFamily: pkpTypography.fontFamily
                                    }}>
                                        Username
                                    </th>
                                    <th style={{
                                        padding: '0.75rem 1rem',
                                        textAlign: 'left',
                                        fontSize: pkpTypography.bodySmall,
                                        fontWeight: pkpTypography.semibold,
                                        color: pkpColors.textDark,
                                        borderBottom: '1px solid #e5e5e5',
                                        fontFamily: pkpTypography.fontFamily
                                    }}>
                                        Email
                                    </th>
                                    <th style={{
                                        padding: '0.75rem 1rem',
                                        textAlign: 'left',
                                        fontSize: pkpTypography.bodySmall,
                                        fontWeight: pkpTypography.semibold,
                                        color: pkpColors.textDark,
                                        borderBottom: '1px solid #e5e5e5',
                                        fontFamily: pkpTypography.fontFamily
                                    }}>
                                        Role
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={index} style={{
                                        borderBottom: index < users.length - 1 ? '1px solid #e5e5e5' : 'none'
                                    }}>
                                        <td style={{
                                            padding: '0.75rem 1rem',
                                            fontSize: pkpTypography.bodyRegular,
                                            fontFamily: pkpTypography.fontFamily
                                        }}>
                                            {user.user_accounts?.username || 'N/A'}
                                        </td>
                                        <td style={{
                                            padding: '0.75rem 1rem',
                                            fontSize: pkpTypography.bodyRegular,
                                            fontFamily: pkpTypography.fontFamily
                                        }}>
                                            {user.user_accounts?.email || 'N/A'}
                                        </td>
                                        <td style={{
                                            padding: '0.75rem 1rem',
                                            fontSize: pkpTypography.bodyRegular,
                                            fontFamily: pkpTypography.fontFamily
                                        }}>
                                            {user.user_groups?.role_id || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
