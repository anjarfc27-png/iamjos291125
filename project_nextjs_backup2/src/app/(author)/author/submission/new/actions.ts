"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult = {
    success: boolean;
    data?: any;
    message?: string;
};

export async function createSubmissionAction(formData: FormData): Promise<ActionResult> {
    const supabase = await createSupabaseServerClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: "Unauthorized" };
    }

    const journalId = formData.get("journalId") as string;
    const sectionId = formData.get("sectionId") as string;
    const locale = formData.get("locale") as string || "en_US";

    if (!journalId) {
        return { success: false, message: "Journal ID is required" };
    }

    try {
        // 1. Create Submission
        // Schema: context_id, stage_id (1=Submission), status (1=Queued)
        const { data: submission, error: subError } = await supabase
            .from("submissions")
            .insert({
                context_id: journalId,
                stage_id: 1, // WORKFLOW_STAGE_SUBMISSION
                status: 1,   // STATUS_QUEUED
                locale: locale,
            })
            .select()
            .single();

        if (subError) throw new Error(`Submission creation failed: ${subError.message}`);

        // 2. Create Publication
        const { data: publication, error: pubError } = await supabase
            .from("publications")
            .insert({
                submission_id: submission.id,
                status: 1, // STATUS_QUEUED
                version: 1,
                primary_locale: locale,
                section_id: sectionId ? sectionId : null
            })
            .select()
            .single();

        if (pubError) throw new Error(`Publication creation failed: ${pubError.message}`);

        // 3. Link Publication to Submission
        const { error: linkError } = await supabase
            .from("submissions")
            .update({ current_publication_id: publication.id })
            .eq("id", submission.id);

        if (linkError) throw new Error(`Linking publication failed: ${linkError.message}`);

        // 4. Add Author (The submitter)
        // Fetch user group for author role
        const { data: authorGroup } = await supabase
            .from("user_groups")
            .select("id")
            .eq("context_id", journalId)
            .eq("role_id", 65536) // ROLE_ID_AUTHOR
            .single();

        const userGroupId = authorGroup?.id;

        if (userGroupId) {
            await supabase.from("stage_assignments").insert({
                submission_id: submission.id,
                user_group_id: userGroupId,
                user_id: user.id,
                date_assigned: new Date().toISOString()
            });
        }

        // Also add to authors table for the publication
        // This is crucial for metadata
        await supabase.from("authors").insert({
            publication_id: publication.id,
            given_name: user.user_metadata?.given_name || user.email?.split('@')[0] || "Author",
            family_name: user.user_metadata?.family_name || "",
            email: user.email || "",
            country: "ID", // Default
            user_group_id: userGroupId,
            seq: 1,
            include_in_browse: true
        });

        revalidatePath("/author/submissions");
        return { success: true, data: { submissionId: submission.id, publicationId: publication.id } };

    } catch (error: any) {
        console.error("createSubmissionAction Error:", error);
        return { success: false, message: error.message };
    }
}

export async function saveSubmissionMetadataAction(
    submissionId: string,
    publicationId: string,
    metadata: { title: string; abstract: string; keywords: string; locale: string }
): Promise<ActionResult> {
    const supabase = await createSupabaseServerClient();

    try {
        // Update Publication Settings
        const settings = [
            { publication_id: publicationId, setting_name: 'title', setting_value: metadata.title, locale: metadata.locale },
            { publication_id: publicationId, setting_name: 'abstract', setting_value: metadata.abstract, locale: metadata.locale },
        ];

        // Upsert settings
        for (const setting of settings) {
            const { error } = await supabase
                .from("publication_settings")
                .upsert(setting, { onConflict: 'publication_id,setting_name,locale' });

            if (error) throw error;
        }

        // Update keywords (simplified)
        // In OJS, keywords are controlled vocabularies. Here we might just save them as a setting or separate table.
        // Let's save as setting for now if not complex.
        if (metadata.keywords) {
            await supabase
                .from("publication_settings")
                .upsert({
                    publication_id: publicationId,
                    setting_name: 'keywords',
                    setting_value: metadata.keywords,
                    locale: metadata.locale
                }, { onConflict: 'publication_id,setting_name,locale' });
        }

        revalidatePath(`/author/submission/${submissionId}`);
        return { success: true };
    } catch (error: any) {
        console.error("saveSubmissionMetadataAction Error:", error);
        return { success: false, message: error.message };
    }
}

export async function uploadSubmissionFileAction(formData: FormData): Promise<ActionResult> {
    const supabase = await createSupabaseServerClient();

    const file = formData.get("file") as File;
    const submissionId = formData.get("submissionId") as string;
    const fileType = formData.get("fileType") as string; // e.g., 'submission', 'review'

    if (!file || !submissionId) {
        return { success: false, message: "File and Submission ID are required" };
    }

    try {
        // 1. Upload to Storage
        const fileName = `${submissionId}/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("submissions")
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // 2. Record in Database
        const { data: fileRecord, error: dbError } = await supabase
            .from("submission_files")
            .insert({
                submission_id: submissionId,
                file_stage: 1, // SUBMISSION
                name: file.name,
                path: uploadData.path,
                file_type: file.type,
                file_size: file.size,
                genre_id: 1, // Article Text (default)
                uploader_user_id: (await supabase.auth.getUser()).data.user?.id
            })
            .select()
            .single();

        if (dbError) throw dbError;

        return { success: true, data: fileRecord };
    } catch (error: any) {
        console.error("uploadSubmissionFileAction Error:", error);
        return { success: false, message: error.message };
    }
}
