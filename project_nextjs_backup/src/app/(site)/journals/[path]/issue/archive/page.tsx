import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

type Props = {
    params: Promise<{ path: string }>;
};

export default async function IssueArchivePage({ params }: Props) {
    const { path } = await params;
    const supabase = await createSupabaseServerClient();

    // Fetch Journal
    const { data: journal } = await supabase
        .from('journals')
        .select('id, name, path')
        .eq('path', path)
        .eq('enabled', true)
        .single();

    if (!journal) {
        notFound();
    }

    // Fetch Published Issues
    const { data: issues } = await supabase
        .from('issues')
        .select('*')
        .eq('journal_id', journal.id)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <nav className="mb-8" aria-label="Breadcrumb">
                <ol role="list" className="flex items-center space-x-4">
                    <li>
                        <Link href={`/journals/${path}`} className="text-gray-500 hover:text-gray-700">
                            Home
                        </Link>
                    </li>
                    <li>
                        <svg className="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                        </svg>
                    </li>
                    <li>
                        <span className="text-gray-900 font-medium" aria-current="page">Archives</span>
                    </li>
                </ol>
            </nav>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Archives</h1>

            {!issues || issues.length === 0 ? (
                <div className="text-gray-500">No issues published yet.</div>
            ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {issues.map((issue) => (
                        <div key={issue.id} className="flex flex-col overflow-hidden rounded-lg shadow-sm ring-1 ring-gray-200 bg-white hover:shadow-md transition-shadow">
                            {issue.cover_image && (
                                <div className="flex-shrink-0">
                                    <img className="h-48 w-full object-cover" src={issue.cover_image} alt="" />
                                </div>
                            )}
                            <div className="flex flex-1 flex-col justify-between p-6">
                                <div className="flex-1">
                                    <Link href={`/journals/${path}/issue/${issue.id}`} className="mt-2 block">
                                        <p className="text-xl font-semibold text-gray-900">
                                            {issue.title || `Vol ${issue.volume} No ${issue.number} (${issue.year})`}
                                        </p>
                                        <p className="mt-3 text-base text-gray-500 line-clamp-3">
                                            {issue.description}
                                        </p>
                                    </Link>
                                </div>
                                <div className="mt-6 flex items-center">
                                    <div className="text-sm text-gray-500">
                                        <time dateTime={issue.published_at}>
                                            {format(new Date(issue.published_at), 'MMMM d, yyyy')}
                                        </time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
