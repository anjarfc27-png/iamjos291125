'use server'

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addSubmissionToIssue(issueId: string, submissionId: string) {
    const supabase = await createSupabaseServerClient();

    try {
        // 1. Get the latest version of the submission
        const { data: latestVersion, error: versionError } = await supabase
            .from('submission_versions')
            .select('id, version')
            .eq('submission_id', submissionId)
            .order('version', { ascending: false })
            .limit(1)
            .single();

        if (versionError) throw versionError;

        // 2. Update the version to point to the issue
        const { error: updateError } = await supabase
            .from('submission_versions')
            .update({ issue_id: issueId })
            .eq('id', latestVersion.id);

        if (updateError) throw updateError;

        // 3. Update submission status to 'scheduled' if it's not already published
        const { error: statusError } = await supabase
            .from('submissions')
            .update({ status: 'scheduled' })
            .eq('id', submissionId)
            .neq('status', 'published'); // Don't revert published status

        if (statusError) throw statusError;

        revalidatePath(`/editor/issues/${issueId}`);
        return { success: true };
    } catch (error) {
        console.error('Error adding submission to issue:', error);
        return { success: false, error: 'Failed to add submission to issue' };
    }
}

export async function removeSubmissionFromIssue(issueId: string, submissionId: string) {
    const supabase = await createSupabaseServerClient();

    try {
        // 1. Get the version currently assigned to this issue
        // Note: This logic assumes only one version is assigned to an issue at a time, which is standard
        const { data: version, error: versionError } = await supabase
            .from('submission_versions')
            .select('id')
            .eq('submission_id', submissionId)
            .eq('issue_id', issueId)
            .single();

        if (versionError) throw versionError;

        // 2. Remove the issue_id
        const { error: updateError } = await supabase
            .from('submission_versions')
            .update({ issue_id: null })
            .eq('id', version.id);

        if (updateError) throw updateError;

        // 3. Revert submission status to 'production' (or whatever appropriate)
        // For now, we'll set it to 'production' as that's where it likely came from
        const { error: statusError } = await supabase
            .from('submissions')
            .update({ status: 'production' })
            .eq('id', submissionId);

        if (statusError) throw statusError;

        revalidatePath(`/editor/issues/${issueId}`);
        return { success: true };
    } catch (error) {
        console.error('Error removing submission from issue:', error);
        return { success: false, error: 'Failed to remove submission from issue' };
    }
}

export async function getIssueSubmissions(issueId: string) {
    const supabase = await createSupabaseServerClient();

    try {
        // Fetch submissions that have a version assigned to this issue
        const { data, error } = await supabase
            .from('submission_versions')
            .select(`
        submission:submissions (
          id,
          title,
          status,
          current_stage,
          metadata
        ),
        version,
        published_at
      `)
            .eq('issue_id', issueId)
            .order('version', { ascending: false });

        if (error) throw error;

        // Flatten the structure
        const submissions = data.map((item: any) => ({
            id: item.submission.id,
            title: item.submission.title,
            status: item.submission.status,
            authors: item.submission.metadata?.authors || [], // Assuming metadata has authors
            version: item.version,
            published_at: item.published_at
        }));

        return { success: true, data: submissions };
    } catch (error) {
        console.error('Error fetching issue submissions:', error);
        return { success: false, error: 'Failed to fetch issue submissions' };
    }
}

export async function getAvailableSubmissions(journalId: string) {
    const supabase = await createSupabaseServerClient();

    try {
        // Fetch submissions in 'production' stage that are NOT assigned to an issue
        // This is a bit complex query, simplified for now:
        // Get all submissions in production/copyediting
        const { data, error } = await supabase
            .from('submissions')
            .select('id, title, status, metadata')
            .eq('journal_id', journalId)
            .in('status', ['production', 'queued']) // 'queued' might be used for active submissions
            .in('current_stage', ['production', 'copyediting']); // Only those ready for publishing

        if (error) throw error;

        // Filter out those that already have an issue assigned (client-side or separate query)
        // For better performance, we should do a "NOT EXISTS" query, but Supabase JS SDK makes that tricky without raw SQL
        // We'll filter client-side for now or assume the UI handles it

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching available submissions:', error);
        return { success: false, error: 'Failed to fetch available submissions' };
    }
}
