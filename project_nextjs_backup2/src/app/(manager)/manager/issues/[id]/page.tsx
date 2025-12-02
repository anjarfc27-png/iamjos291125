
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { IssueDetailClient } from "./issue-detail-client";
import { getIssueSubmissions, getAvailableSubmissions } from "@/features/issues/actions/toc";

type Props = {
    params: {
        id: string;
    };
};

export const dynamic = "force-dynamic";

export default async function IssueDetailPage({ params }: Props) {
    const supabase = await createSupabaseServerClient();
    const { id } = params;

    // 1. Fetch Issue Details
    const { data: issue, error } = await supabase
        .from("issues")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !issue) {
        console.error("Error fetching issue:", error);
        notFound();
    }

    // 2. Fetch Assigned Submissions (TOC)
    const tocResult = await getIssueSubmissions(id);
    const assignedSubmissions = tocResult.success ? tocResult.data : [];

    // 3. Fetch Available Submissions (Candidates)
    // We need journal_id from the issue to filter available submissions
    const availableResult = await getAvailableSubmissions(issue.journal_id);
    const availableSubmissions = availableResult.success ? availableResult.data : [];

    return (
        <IssueDetailClient
            issue={issue}
            assignedSubmissions={assignedSubmissions}
            availableSubmissions={availableSubmissions}
        />
    );
}
