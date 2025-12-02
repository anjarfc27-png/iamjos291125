'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { WizardHeader } from './wizard-header';
import { PkpInput } from '@/components/ui/pkp-input';
import { PkpCheckbox } from '@/components/ui/pkp-checkbox';
import { PkpRichTextEditor } from '@/components/ui/pkp-rich-text-editor';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/providers/supabase-provider';
import { updateJournalAction } from '../../site-management/hosted-journals/actions';
import { pkpColors, pkpTypography } from '@/lib/theme';
import { toast } from 'sonner';

export default function JournalWizardPage({ params }: { params: Promise<{ journalId: string }> }) {
    const { journalId } = use(params);
    const router = useRouter();
    const supabase = useSupabase();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pathPrefix, setPathPrefix] = useState('http://localhost/');

    const [formData, setFormData] = useState({
        title: '',
        initials: '',
        abbreviation: '',
        description: '',
        path: '',
        isPublic: false,
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPathPrefix(`${window.location.origin}/`);
        }
    }, []);

    useEffect(() => {
        const fetchJournal = async () => {
            try {
                // Fetch journal basic info
                const { data: journal, error: journalError } = await supabase
                    .from('journals')
                    .select('*')
                    .eq('id', journalId)
                    .single();

                if (journalError) throw journalError;

                // Fetch journal settings (name, description, etc.)
                const { data: settings, error: settingsError } = await supabase
                    .from('journal_settings')
                    .select('setting_name, setting_value')
                    .eq('journal_id', journalId);

                if (settingsError) throw settingsError;

                const settingsMap = (settings || []).reduce((acc: any, curr) => {
                    acc[curr.setting_name] = curr.setting_value;
                    return acc;
                }, {});

                setFormData({
                    title: settingsMap.name || '',
                    initials: settingsMap.initials || '',
                    abbreviation: settingsMap.abbreviation || '',
                    description: settingsMap.description || '',
                    path: journal.path || '',
                    isPublic: journal.enabled || false,
                });
            } catch (error) {
                console.error('Error fetching journal:', error);
                toast.error('Failed to load journal data');
            } finally {
                setLoading(false);
            }
        };

        if (journalId) {
            fetchJournal();
        }
    }, [journalId, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const result = await updateJournalAction({
                id: journalId,
                title: formData.title,
                initials: formData.initials,
                abbreviation: formData.abbreviation,
                path: formData.path,
                description: formData.description,
                isPublic: formData.isPublic,
            });

            if (result.success) {
                toast.success('Journal updated successfully');
                router.refresh();
            } else {
                toast.error(result.message || 'Failed to update journal');
            }
        } catch (error) {
            console.error('Error updating journal:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-[#eaedee] flex flex-col">
            <WizardHeader journalName={formData.title} />

            <div className="flex-1 p-8">
                <div className="max-w-4xl mx-auto bg-white border border-gray-200 shadow-sm rounded-sm">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">

                        {/* Journal Title (Required but not in screenshot, keeping it for functionality but hidden if desired, 
                but keeping it commented out as per previous decision to match screenshot, 
                assuming title is not editable here or user accepts it's missing) 
                Wait, if I don't render it, user can't edit it. That's fine if that's what they want.
            */}

                        {/* Journal Description */}
                        <PkpRichTextEditor
                            label="Journal description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={8}
                        />

                        {/* Path */}
                        <div className="relative">
                            <label className="block text-sm font-bold text-[#002C40] mb-2">
                                Path <span className="text-red-600">*</span>
                            </label>
                            <div className="relative flex items-center">
                                <div className="absolute left-3 text-gray-500 text-sm select-none pointer-events-none">
                                    {pathPrefix}
                                </div>
                                <PkpInput
                                    value={formData.path}
                                    onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                                    required
                                    style={{ paddingLeft: `${pathPrefix.length * 7 + 10}px` }} // Approximate width calculation
                                />
                            </div>
                        </div>

                        {/* Enable */}
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <label className="block text-sm font-bold text-[#002C40] mb-2">
                                Enable
                            </label>
                            <div className="border border-[#e5e5e5] rounded p-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <PkpCheckbox
                                        checked={formData.isPublic}
                                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                    />
                                    <span className="text-sm text-gray-700">
                                        Enable this journal to appear publicly on the site
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4 border-t border-gray-200">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="bg-[#006798] hover:bg-[#005a87] text-white font-semibold px-4 py-2 rounded shadow-sm"
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
