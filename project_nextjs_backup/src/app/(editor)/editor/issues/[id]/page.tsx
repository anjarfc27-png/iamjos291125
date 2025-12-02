'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IssueTOC } from "@/features/issues/components/issue-toc";
import { useSupabase } from "@/providers/supabase-provider";
import { publishIssue, unpublishIssue } from "@/features/issues/actions/issues";
import { toast } from "sonner";
import { ArrowLeft, Globe, CheckCircle } from "lucide-react";
import Link from "next/link";

type Issue = {
    id: string;
    volume: number | null;
    number: string | null;
    year: number | null;
    title: string | null;
    description: string | null;
    is_public: boolean;
    published_at: string | null;
    journal_id: string;
};

export default function IssueDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const supabase = useSupabase();
    const [issue, setIssue] = useState<Issue | null>(null);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);

    const fetchIssue = async () => {
        try {
            const { data, error } = await supabase
                .from('issues')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setIssue(data);
        } catch (error) {
            console.error("Error fetching issue:", error);
            toast.error("Failed to load issue details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchIssue();
    }, [id]);

    const handlePublish = async () => {
        if (!confirm("Are you sure you want to publish this issue? This will make it visible to the public.")) return;

        setPublishing(true);
        const result = await publishIssue(id);
        if (result.success) {
            toast.success("Issue published successfully");
            fetchIssue();
        } else {
            toast.error("Failed to publish issue");
        }
        setPublishing(false);
    };

    const handleUnpublish = async () => {
        if (!confirm("Are you sure you want to unpublish this issue? It will be hidden from the public.")) return;

        setPublishing(true);
        const result = await unpublishIssue(id);
        if (result.success) {
            toast.success("Issue unpublished");
            fetchIssue();
        } else {
            toast.error("Failed to unpublish issue");
        }
        setPublishing(false);
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!issue) return <div className="p-8 text-center">Issue not found</div>;

    return (
        <div style={{
            width: "100%",
            maxWidth: "100%",
            minHeight: "100%",
            backgroundColor: "#eaedee",
            padding: 0,
            margin: 0,
        }}>
            {/* Header */}
            <div style={{
                backgroundColor: "#ffffff",
                borderBottom: "2px solid #e5e5e5",
                padding: "1.5rem 0",
            }}>
                <div style={{ padding: "0 1.5rem" }}>
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/editor/issues" className="text-gray-500 hover:text-gray-900">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-2xl font-bold text-[#002C40]">
                            {issue.title || `Vol ${issue.volume} No ${issue.number} (${issue.year})`}
                        </h1>
                        <Badge variant={issue.published_at ? 'success' : 'warning'}>
                            {issue.published_at ? 'Published' : 'Unpublished'}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            {issue.description || "No description provided."}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline">
                                <Link href={`/editor/issues/${id}/edit`}>Edit Data</Link>
                            </Button>
                            <Button variant="outline">
                                <Link href={`/editor/issues/${id}/preview`}>Preview</Link>
                            </Button>
                            {issue.published_at ? (
                                <Button
                                    variant="danger"
                                    onClick={handleUnpublish}
                                    disabled={publishing}
                                >
                                    Unpublish Issue
                                </Button>
                            ) : (
                                <Button
                                    className="bg-[#006798] hover:bg-[#005a87]"
                                    onClick={handlePublish}
                                    disabled={publishing}
                                >
                                    <Globe className="mr-2 h-4 w-4" />
                                    Publish Issue
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{
                padding: "1.5rem",
                width: "100%",
                maxWidth: "100%",
                overflowX: "hidden",
            }}>
                <div className="grid grid-cols-3 gap-6">
                    {/* Main Column: TOC */}
                    <div className="col-span-2">
                        <IssueTOC issueId={id} />
                    </div>

                    {/* Sidebar: Info */}
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                            <h3 className="font-medium mb-3">Issue Data</h3>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Volume</dt>
                                    <dd>{issue.volume}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Number</dt>
                                    <dd>{issue.number}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Year</dt>
                                    <dd>{issue.year}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Published</dt>
                                    <dd>{issue.published_at ? new Date(issue.published_at).toLocaleDateString() : '-'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
