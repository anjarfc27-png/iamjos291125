import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getSiteInformation } from "@/app/(admin)/admin/site-settings/actions";

export const dynamic = 'force-dynamic';

export default async function SiteIndex() {
    const supabase = await createSupabaseServerClient();
    const [journalsResult, siteInfo] = await Promise.all([
        supabase
            .from('journals')
            .select('id, path, enabled')
            .eq('enabled', true)
            .order('path'),
        getSiteInformation()
    ]);

    // Fetch settings for each journal
    const journalsWithSettings = await Promise.all(
        (journalsResult.data || []).map(async (journal) => {
            const { data: settings } = await supabase
                .from('journal_settings')
                .select('setting_name, setting_value')
                .eq('journal_id', journal.id)
                .in('setting_name', ['name', 'description', 'thumbnail']);

            const name = settings?.find(s => s.setting_name === 'name')?.setting_value || journal.path;
            const description = settings?.find(s => s.setting_name === 'description')?.setting_value || '';
            const thumbnail = settings?.find(s => s.setting_name === 'thumbnail')?.setting_value || null;

            return {
                ...journal,
                name,
                description,
                thumbnail_url: thumbnail ? (thumbnail.startsWith('http') ? thumbnail : null) : null
            };
        })
    );

    const journals = journalsWithSettings;

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Journals
                </h1>
                {siteInfo.about && (
                    <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: siteInfo.about }} />
                    </div>
                )}
            </div>
            <div className="space-y-8 border-t border-gray-200 pt-6">
                {journals?.map((journal) => (
                    <div key={journal.id} className="flex flex-col md:flex-row gap-4 pb-8 border-b border-gray-100 last:border-b-0">
                        {journal.thumbnail_url && (
                            <div className="flex-shrink-0 w-full md:w-32">
                                <Link href={`/journals/${journal.path}`}>
                                    <img
                                        className="w-full h-auto object-cover border border-gray-200 hover:opacity-80 transition-opacity"
                                        src={journal.thumbnail_url}
                                        alt={journal.name}
                                    />
                                </Link>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold mb-2">
                                <Link
                                    href={`/journals/${journal.path}`}
                                    className="text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
                                >
                                    {journal.name}
                                </Link>
                            </h2>
                            <div className="text-sm text-gray-600 prose prose-sm max-w-none mb-3">
                                {journal.description ? (
                                    <div dangerouslySetInnerHTML={{ __html: journal.description }} />
                                ) : (
                                    <p>No description available.</p>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    href={`/journals/${journal.path}`}
                                    className="inline-block px-3 py-1.5 bg-[var(--primary)] !text-white text-xs font-medium rounded hover:bg-[var(--primary-dark)] transition-colors"
                                >
                                    View Journal
                                </Link>
                                <Link
                                    href={`/journals/${journal.path}/issue/current`}
                                    className="inline-block px-3 py-1.5 border border-[var(--primary)] !text-[var(--primary)] bg-white text-xs font-medium rounded hover:bg-gray-50 transition-colors"
                                >
                                    Current Issue
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
                {(!journals || journals.length === 0) && (
                    <div className="text-center text-gray-500 py-12">
                        No journals available at the moment.
                    </div>
                )}
            </div>
        </div>
    );
}
