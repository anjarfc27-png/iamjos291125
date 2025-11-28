'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/providers/supabase-provider';
import { pkpColors, pkpTypography } from '@/lib/theme';

type Props = {
    params: { journalId: string };
};

export default function JournalSettingsPage({ params }: Props) {
    const supabase = useSupabase();
    const [loading, setLoading] = useState(true);
    const [journal, setJournal] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        initials: '',
        abbreviation: '',
        description: '',
        enabled: true
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadJournal();
    }, [params.journalId]);

    const loadJournal = async () => {
        try {
            // Fetch journal
            const { data: journalData, error: journalError } = await supabase
                .from('journals')
                .select('*')
                .eq('id', params.journalId)
                .single();

            if (journalError) throw journalError;

            // Fetch journal settings
            const { data: settings, error: settingsError } = await supabase
                .from('journal_settings')
                .select('*')
                .eq('journal_id', params.journalId);

            if (settingsError) throw settingsError;

            const settingsMap = new Map(
                (settings || []).map(s => [s.setting_name, s.setting_value])
            );

            setJournal(journalData);
            setFormData({
                title: settingsMap.get('name') || journalData.journal_title || '',
                initials: settingsMap.get('initials') || '',
                abbreviation: settingsMap.get('abbreviation') || '',
                description: settingsMap.get('description') || '',
                enabled: journalData.enabled ?? true
            });
        } catch (err) {
            console.error('Error loading journal:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            // Update journal
            const { error: journalError } = await supabase
                .from('journals')
                .update({
                    journal_title: formData.title,
                    enabled: formData.enabled,
                    updated_at: new Date().toISOString()
                })
                .eq('id', params.journalId);

            if (journalError) throw journalError;

            // Upsert settings
            const settings = [
                { journal_id: params.journalId, setting_name: 'name', setting_value: formData.title },
                { journal_id: params.journalId, setting_name: 'initials', setting_value: formData.initials },
                { journal_id: params.journalId, setting_name: 'abbreviation', setting_value: formData.abbreviation },
                { journal_id: params.journalId, setting_name: 'description', setting_value: formData.description },
            ];

            for (const setting of settings) {
                await supabase
                    .from('journal_settings')
                    .upsert(setting, {
                        onConflict: 'journal_id,setting_name'
                    });
            }

            setMessage('Settings saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err: any) {
            console.error('Error saving settings:', err);
            setMessage('Error: ' + (err.message || 'Failed to save settings'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!journal) {
        return <div>Journal not found</div>;
    }

    return (
        <div>
            {/* Success/Error Message */}
            {message && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    borderRadius: '4px',
                    backgroundColor: message.includes('Error') ? '#fee' : '#efe',
                    border: `1px solid ${message.includes('Error') ? '#fcc' : '#cfc'}`,
                    color: message.includes('Error') ? '#c00' : '#060'
                }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSave}>
                {/* Journal Main Settings */}
                <div style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <h2 style={{
                        fontSize: pkpTypography.sectionTitle,
                        fontWeight: pkpTypography.bold,
                        color: pkpColors.textDark,
                        marginTop: 0,
                        marginBottom: '1.5rem',
                        fontFamily: pkpTypography.fontFamily
                    }}>
                        Journal Information
                    </h2>

                    {/* Journal Title */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: pkpTypography.semibold,
                            fontSize: pkpTypography.bodyRegular,
                            color: pkpColors.textDark,
                            fontFamily: pkpTypography.fontFamily
                        }}>
                            Journal Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: pkpTypography.bodyRegular,
                                fontFamily: pkpTypography.fontFamily
                            }}
                        />
                    </div>

                    {/* Journal Initials */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: pkpTypography.semibold,
                            fontSize: pkpTypography.bodyRegular,
                            color: pkpColors.textDark,
                            fontFamily: pkpTypography.fontFamily
                        }}>
                            Journal Initials
                        </label>
                        <input
                            type="text"
                            value={formData.initials}
                            onChange={(e) => setFormData({ ...formData, initials: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: pkpTypography.bodyRegular,
                                fontFamily: pkpTypography.fontFamily
                            }}
                        />
                    </div>

                    {/* Journal Abbreviation */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: pkpTypography.semibold,
                            fontSize: pkpTypography.bodyRegular,
                            color: pkpColors.textDark,
                            fontFamily: pkpTypography.fontFamily
                        }}>
                            Journal Abbreviation
                        </label>
                        <input
                            type="text"
                            value={formData.abbreviation}
                            onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: pkpTypography.bodyRegular,
                                fontFamily: pkpTypography.fontFamily
                            }}
                        />
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: pkpTypography.semibold,
                            fontSize: pkpTypography.bodyRegular,
                            color: pkpColors.textDark,
                            fontFamily: pkpTypography.fontFamily
                        }}>
                            Journal Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={5}
                            style={{
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: pkpTypography.bodyRegular,
                                fontFamily: pkpTypography.fontFamily,
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {/* Enabled Checkbox */}
                    <div style={{ marginBottom: 0 }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                checked={formData.enabled}
                                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                style={{
                                    width: '1.125rem',
                                    height: '1.125rem',
                                    cursor: 'pointer'
                                }}
                            />
                            <span style={{
                                fontSize: pkpTypography.bodyRegular,
                                color: pkpColors.textDark,
                                fontFamily: pkpTypography.fontFamily
                            }}>
                                Enable this journal to appear publicly on the site
                            </span>
                        </label>
                    </div>
                </div>

                {/* Save Button */}
                <div style={{
                    display: 'flex',
                    gap: '1rem'
                }}>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            padding: '0.625rem 1.25rem',
                            backgroundColor: pkpColors.primary,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: pkpTypography.bodyRegular,
                            fontWeight: pkpTypography.semibold,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.6 : 1,
                            fontFamily: pkpTypography.fontFamily
                        }}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
}
