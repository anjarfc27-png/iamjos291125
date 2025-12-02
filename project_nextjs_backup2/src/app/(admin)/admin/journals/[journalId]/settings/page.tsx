'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/providers/supabase-provider';
import { pkpColors, pkpTypography } from '@/lib/theme';
import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";

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
    const [contactData, setContactData] = useState({
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        contactAffiliation: '',
        mailingAddress: '',
        supportName: '',
        supportEmail: '',
        supportPhone: ''
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('masthead');

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
            setContactData({
                contactName: settingsMap.get('contactName') || '',
                contactEmail: settingsMap.get('contactEmail') || '',
                contactPhone: settingsMap.get('contactPhone') || '',
                contactAffiliation: settingsMap.get('contactAffiliation') || '',
                mailingAddress: settingsMap.get('mailingAddress') || '',
                supportName: settingsMap.get('supportName') || '',
                supportEmail: settingsMap.get('supportEmail') || '',
                supportPhone: settingsMap.get('supportPhone') || ''
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
                // Contact data
                { journal_id: params.journalId, setting_name: 'contactName', setting_value: contactData.contactName },
                { journal_id: params.journalId, setting_name: 'contactEmail', setting_value: contactData.contactEmail },
                { journal_id: params.journalId, setting_name: 'contactPhone', setting_value: contactData.contactPhone },
                { journal_id: params.journalId, setting_name: 'contactAffiliation', setting_value: contactData.contactAffiliation },
                { journal_id: params.journalId, setting_name: 'mailingAddress', setting_value: contactData.mailingAddress },
                { journal_id: params.journalId, setting_name: 'supportName', setting_value: contactData.supportName },
                { journal_id: params.journalId, setting_name: 'supportEmail', setting_value: contactData.supportEmail },
                { journal_id: params.journalId, setting_name: 'supportPhone', setting_value: contactData.supportPhone },
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
                <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '4px' }}>
                    <PkpTabs defaultValue="masthead" value={activeTab} onValueChange={setActiveTab}>
                        {/* Tabs Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            backgroundColor: '#f5f5f5',
                            borderBottom: '1px solid #ddd'
                        }}>
                            <PkpTabsList style={{
                                flex: 1,
                                borderBottom: 'none',
                                backgroundColor: 'transparent',
                                padding: '0 1rem'
                            }}>
                                <PkpTabsTrigger value="masthead">Masthead</PkpTabsTrigger>
                                <PkpTabsTrigger value="contact">Contact</PkpTabsTrigger>
                                <PkpTabsTrigger value="sections">Sections</PkpTabsTrigger>
                                <PkpTabsTrigger value="categories">Categories</PkpTabsTrigger>
                            </PkpTabsList>

                            {/* Help Link */}
                            <div style={{ padding: '0 1.5rem 0.5rem 0' }}>
                                <a
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        textDecoration: 'none',
                                        color: '#006798',
                                        fontSize: '0.875rem',
                                        fontWeight: 500
                                    }}
                                >
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        backgroundColor: '#00B24E',
                                        color: 'white',
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        fontFamily: 'serif',
                                        marginRight: '0.25rem'
                                    }}>
                                        i
                                    </span>
                                    <span>Help</span>
                                </a>
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div style={{ padding: '2rem' }}>
                            {/* Masthead Tab */}
                            <PkpTabsContent value="masthead">
                                <h2 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: '#000',
                                    marginTop: 0,
                                    marginBottom: '1.5rem'
                                }}>
                                    Journal Information
                                </h2>

                                {/* Journal Title */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: 600,
                                        fontSize: '0.875rem'
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
                                            borderRadius: '3px',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>

                                {/* Journal Initials */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: 600,
                                        fontSize: '0.875rem'
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
                                            borderRadius: '3px',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>

                                {/* Journal Abbreviation */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: 600,
                                        fontSize: '0.875rem'
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
                                            borderRadius: '3px',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>

                                {/* Description */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: 600,
                                        fontSize: '0.875rem'
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
                                            borderRadius: '3px',
                                            fontSize: '0.875rem',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                {/* Enabled Checkbox */}
                                <div>
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
                                                width: '1rem',
                                                height: '1rem',
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <span style={{ fontSize: '0.875rem' }}>Enable this journal to appear publicly on the site</span>
                                    </label>
                                </div>
                            </PkpTabsContent>

                            {/* Contact Tab - 2 Column Layout */}
                            <PkpTabsContent value="contact">
                                {/* Principal Contact */}
                                <div style={{ marginBottom: '3rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
                                        {/* Left: Title and Description */}
                                        <div>
                                            <h3 style={{
                                                fontSize: '1.125rem',
                                                fontWeight: 700,
                                                color: '#000',
                                                marginTop: 0,
                                                marginBottom: '0.75rem'
                                            }}>
                                                Principal Contact
                                            </h3>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: '#333',
                                                lineHeight: 1.5,
                                                margin: 0
                                            }}>
                                                Enter contact details, typically for a principal editorship, managing editorship, or administrative staff position, which can be displayed on your publicly accessible website.
                                            </p>
                                        </div>

                                        {/* Right: Form Fields */}
                                        <div>
                                            {/* Name */}
                                            <div style={{ marginBottom: '1.25rem' }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    color: '#000'
                                                }}>
                                                    Name <span style={{ color: '#d00' }}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={contactData.contactName}
                                                    onChange={(e) => setContactData({ ...contactData, contactName: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '450px',
                                                        padding: '0.5rem 0.75rem',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '3px',
                                                        fontSize: '0.875rem'
                                                    }}
                                                />
                                            </div>

                                            {/* Email */}
                                            <div style={{ marginBottom: '1.25rem' }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    color: '#000'
                                                }}>
                                                    Email <span style={{ color: '#d00' }}>*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={contactData.contactEmail}
                                                    onChange={(e) => setContactData({ ...contactData, contactEmail: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '450px',
                                                        padding: '0.5rem 0.75rem',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '3px',
                                                        fontSize: '0.875rem'
                                                    }}
                                                />
                                            </div>

                                            {/* Phone */}
                                            <div style={{ marginBottom: '1.25rem' }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    color: '#000'
                                                }}>
                                                    Phone
                                                </label>
                                                <input
                                                    type="text"
                                                    value={contactData.contactPhone}
                                                    onChange={(e) => setContactData({ ...contactData, contactPhone: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '450px',
                                                        padding: '0.5rem 0.75rem',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '3px',
                                                        fontSize: '0.875rem'
                                                    }}
                                                />
                                            </div>

                                            {/* Affiliation */}
                                            <div style={{ marginBottom: '1.25rem' }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    color: '#000'
                                                }}>
                                                    Affiliation
                                                </label>
                                                <input
                                                    type="text"
                                                    value={contactData.contactAffiliation}
                                                    onChange={(e) => setContactData({ ...contactData, contactAffiliation: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '450px',
                                                        padding: '0.5rem 0.75rem',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '3px',
                                                        fontSize: '0.875rem'
                                                    }}
                                                />
                                            </div>

                                            {/* Mailing Address */}
                                            <div style={{ marginBottom: 0 }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    color: '#000'
                                                }}>
                                                    Mailing Address
                                                </label>
                                                <textarea
                                                    value={contactData.mailingAddress}
                                                    onChange={(e) => setContactData({ ...contactData, mailingAddress: e.target.value })}
                                                    rows={4}
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '450px',
                                                        padding: '0.5rem 0.75rem',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '3px',
                                                        fontSize: '0.875rem',
                                                        resize: 'vertical'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '2.5rem 0' }} />

                                {/* Technical Support Contact */}
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
                                        {/* Left: Title and Description */}
                                        <div>
                                            <h3 style={{
                                                fontSize: '1.125rem',
                                                fontWeight: 700,
                                                color: '#000',
                                                marginTop: 0,
                                                marginBottom: '0.75rem'
                                            }}>
                                                Technical Support Contact
                                            </h3>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: '#333',
                                                lineHeight: 1.5,
                                                margin: 0
                                            }}>
                                                A contact person who can assist editors, authors and reviewers with any problems they have submitting, editing, reviewing or publishing material.
                                            </p>
                                        </div>

                                        {/* Right: Form Fields */}
                                        <div>
                                            {/* Name */}
                                            <div style={{ marginBottom: '1.25rem' }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    color: '#000'
                                                }}>
                                                    Name <span style={{ color: '#d00' }}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={contactData.supportName}
                                                    onChange={(e) => setContactData({ ...contactData, supportName: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '450px',
                                                        padding: '0.5rem 0.75rem',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '3px',
                                                        fontSize: '0.875rem'
                                                    }}
                                                />
                                            </div>

                                            {/* Email */}
                                            <div style={{ marginBottom: '1.25rem' }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    color: '#000'
                                                }}>
                                                    Email <span style={{ color: '#d00' }}>*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={contactData.supportEmail}
                                                    onChange={(e) => setContactData({ ...contactData, supportEmail: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '450px',
                                                        padding: '0.5rem 0.75rem',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '3px',
                                                        fontSize: '0.875rem'
                                                    }}
                                                />
                                            </div>

                                            {/* Phone */}
                                            <div style={{ marginBottom: 0 }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    color: '#000'
                                                }}>
                                                    Phone
                                                </label>
                                                <input
                                                    type="text"
                                                    value={contactData.supportPhone}
                                                    onChange={(e) => setContactData({ ...contactData, supportPhone: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '450px',
                                                        padding: '0.5rem 0.75rem',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '3px',
                                                        fontSize: '0.875rem'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button at Bottom */}
                                <div style={{
                                    marginTop: '2.5rem',
                                    paddingTop: '1.5rem',
                                    borderTop: '1px solid #e5e5e5',
                                    display: 'flex',
                                    justifyContent: 'flex-end'
                                }}>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        style={{
                                            padding: '0.5rem 1.25rem',
                                            backgroundColor: '#006798',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '3px',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            cursor: saving ? 'not-allowed' : 'pointer',
                                            opacity: saving ? 0.6 : 1
                                        }}
                                    >
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </PkpTabsContent>

                            {/* Sections Tab */}
                            <PkpTabsContent value="sections">
                                <p style={{ color: '#666' }}>Sections content coming soon...</p>
                            </PkpTabsContent>

                            {/* Categories Tab */}
                            <PkpTabsContent value="categories">
                                <p style={{ color: '#666' }}>Categories content coming soon...</p>
                            </PkpTabsContent>
                        </div>
                    </PkpTabs>
                </div>
            </form>
        </div>
    );
}
