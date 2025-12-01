import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';
import Link from "next/link";
import { format } from "date-fns";

type Props = {
    params: Promise<{ path: string }>;
};

export default async function JournalHomePage({ params }: Props) {
    const { path } = await params;
    const supabase = await createSupabaseServerClient();

    // Fetch Journal
    const { data: journal } = await supabase
        .from('journals')
        .select('*')
        .eq('path', path)
        .eq('enabled', true)
        .single();

    if (!journal) {
        notFound();
    }

    // Fetch Current Issue (Latest published)
    const { data: currentIssue } = await supabase
        .from('issues')
        .select(`
            *,
            submission_versions!inner (
                submission:submissions (
                    id,
                    title,
                    metadata,
                    status
                ),
                version
            )
        `)
        .eq('journal_id', journal.id)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    // Process articles from the joined query
    const articles = currentIssue?.submission_versions?.map((sv: any) => ({
        id: sv.submission.id,
        title: sv.submission.title,
        authors: sv.submission.metadata?.authors || [],
        version: sv.version
    })) || [];

    // Fetch Announcements
    const { data: announcements } = await supabase
        .from('announcements')
        .select(`
            *,
            settings:announcement_settings(*)
        `)
        .eq('assoc_type', 256) // Journal
        .eq('assoc_id', journal.id)
        .order('date_posted', { ascending: false })
        .limit(5); // Show last 5

    const processedAnnouncements = announcements?.map((a: any) => ({
        id: a.id,
        title: a.settings.find((s: any) => s.setting_name === 'title')?.setting_value,
        shortDescription: a.settings.find((s: any) => s.setting_name === 'shortDescription')?.setting_value,
        datePosted: a.date_posted
    })) || [];

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                <div className="lg:col-span-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
                        {journal.name}
                    </h1>

                    {journal.description && (
                        <div className="prose prose-lg text-gray-500 mb-8">
                            <p>{journal.description}</p>
                        </div>
                    )}

                    {/* Announcements Section */}
                    {processedAnnouncements.length > 0 && (
                        <div className="mb-10 border-t border-gray-200 pt-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Announcements</h2>
                            <div className="space-y-6">
                                {processedAnnouncements.map((announcement: any) => (
                                    <div key={announcement.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <h3 className="text-lg font-semibold text-[#006798] mb-1">
                                            {announcement.title}
                                        </h3>
                                        <div className="text-sm text-gray-500 mb-2">
                                            {format(new Date(announcement.datePosted), 'MMMM d, yyyy')}
                                        </div>
                                        {announcement.shortDescription && (
                                            <p className="text-gray-700">{announcement.shortDescription}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-t border-gray-200 pt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Issue</h2>

                        {currentIssue ? (
                            <div className="space-y-6">
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-xl font-semibold text-[#006798]">
                                        <Link href={`/journals/${path}/issue/${currentIssue.id}`}>
                                            {currentIssue.title || `Vol ${currentIssue.volume} No ${currentIssue.number} (${currentIssue.year})`}
                                        </Link>
                                    </h3>
                                    <span className="text-gray-500 text-sm">
                                        Published: {format(new Date(currentIssue.published_at), 'yyyy-MM-dd')}
                                    </span>
                                </div>

                                {currentIssue.cover_image && (
                                    <img
                                        src={currentIssue.cover_image}
                                        alt="Cover"
                                        className="w-full max-w-xs rounded shadow-sm"
                                    />
                                )}

                                <div className="space-y-4 mt-6">
                                    {articles.length > 0 ? (
                                        articles.map((article: any) => (
                                            <div key={article.id} className="border-b border-gray-100 pb-4 last:border-0">
                                                <h4 className="text-lg font-medium text-gray-900">
                                                    <Link href={`/journals/${path}/article/${article.id}`} className="hover:text-[#006798]">
                                                        {article.title}
                                                    </Link>
                                                </h4>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {article.authors.map((a: any) => `${a.givenName} ${a.familyName}`).join(", ")}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic">No articles in this issue.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-md bg-yellow-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">No issues published yet</h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p>This journal has not published any issues yet. Check back later.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 lg:col-span-4 lg:mt-0">
                    <div className="rounded-lg bg-gray-50 p-6 shadow-sm ring-1 ring-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Journal Information</h3>
                        <dl className="mt-4 space-y-4">
                            {journal.issn && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">ISSN</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{journal.issn}</dd>
                                </div>
                            )}
                        </dl>
                        <div className="mt-6 space-y-3">
                            <Link href={`/author/submission/new?journal=${journal.id}`} className="block w-full rounded-md bg-[var(--primary)] px-3 py-2 text-center text-sm font-semibold !text-white shadow-sm hover:bg-[var(--primary-hover)] transition-colors">
                                Make a Submission
                            </Link>
                            <Link href={`/journals/${path}/issue/archive`} className="block w-full rounded-md bg-white px-3 py-2 text-center text-sm font-semibold !text-[var(--primary)] shadow-sm ring-1 ring-inset ring-[var(--primary)] hover:bg-gray-50 transition-colors">
                                Browse Archives
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
