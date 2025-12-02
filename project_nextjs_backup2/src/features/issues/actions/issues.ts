'use server'

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const issueSchema = z.object({
    volume: z.coerce.number().optional(),
    number: z.string().optional(),
    year: z.coerce.number(),
    title: z.string().optional(),
    description: z.string().optional(),
    is_public: z.boolean().default(false),
    published_at: z.string().optional(),
    journal_id: z.string(),
});

export async function createIssue(formData: FormData) {
    const supabase = await createSupabaseServerClient();

    const rawData = {
        volume: formData.get('volume'),
        number: formData.get('number'),
        year: formData.get('year'),
        title: formData.get('title'),
        description: formData.get('description'),
        journal_id: formData.get('journal_id'),
        is_public: formData.get('is_public') === 'true',
    };

    try {
        const validatedData = issueSchema.parse(rawData);

        const { data, error } = await supabase
            .from('issues')
            .insert(validatedData)
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/editor/issues');
        return { success: true, data };
    } catch (error) {
        console.error('Error creating issue:', error);
        return { success: false, error: 'Failed to create issue' };
    }
}

export async function updateIssue(id: string, formData: FormData) {
    const supabase = await createSupabaseServerClient();

    const rawData = {
        volume: formData.get('volume'),
        number: formData.get('number'),
        year: formData.get('year'),
        title: formData.get('title'),
        description: formData.get('description'),
        journal_id: formData.get('journal_id'), // usually not changed but needed for schema validation if strict
        is_public: formData.get('is_public') === 'true',
    };

    // Remove journal_id from update payload to avoid issues if not passed
    const { journal_id, ...updateData } = rawData;

    try {
        // Partial validation could be done here

        const { data, error } = await supabase
            .from('issues')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/editor/issues');
        return { success: true, data };
    } catch (error) {
        console.error('Error updating issue:', error);
        return { success: false, error: 'Failed to update issue' };
    }
}

export async function deleteIssue(id: string) {
    const supabase = await createSupabaseServerClient();

    try {
        const { error } = await supabase
            .from('issues')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/editor/issues');
        return { success: true };
    } catch (error) {
        console.error('Error deleting issue:', error);
        return { success: false, error: 'Failed to delete issue' };
    }
}

export async function publishIssue(id: string) {
    const supabase = await createSupabaseServerClient();

    try {
        const { data, error } = await supabase
            .from('issues')
            .update({
                published_at: new Date().toISOString(),
                // OJS logic: publishing an issue might also publish all assigned submissions
                // For now, we just mark the issue as published
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/editor/issues');
        return { success: true, data };
    } catch (error) {
        console.error('Error publishing issue:', error);
        return { success: false, error: 'Failed to publish issue' };
    }
}

export async function unpublishIssue(id: string) {
    const supabase = await createSupabaseServerClient();

    try {
        const { data, error } = await supabase
            .from('issues')
            .update({ published_at: null })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/editor/issues');
        return { success: true, data };
    } catch (error) {
        console.error('Error unpublishing issue:', error);
        return { success: false, error: 'Failed to unpublish issue' };
    }
}
