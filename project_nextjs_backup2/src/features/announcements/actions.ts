"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const announcementSchema = z.object({
    title: z.string().min(1, "Title is required"),
    shortDescription: z.string().optional(),
    description: z.string().optional(),
    dateExpire: z.string().optional().nullable(),
    journalId: z.string().optional().nullable(), // Null for site-wide
});

export async function createAnnouncement(formData: FormData) {
    const supabase = await createSupabaseServerClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    // Parse data
    const rawData = {
        title: formData.get("title"),
        shortDescription: formData.get("shortDescription"),
        description: formData.get("description"),
        dateExpire: formData.get("dateExpire") || null,
        journalId: formData.get("journalId") || null,
    };

    const result = announcementSchema.safeParse(rawData);
    if (!result.success) {
        return { success: false, message: result.error.issues[0].message };
    }

    const { title, shortDescription, description, dateExpire, journalId } = result.data;

    try {
        // Insert into announcements
        const { data: announcement, error: insertError } = await supabase
            .from('announcements')
            .insert({
                assoc_type: journalId ? 256 : 0, // 256 = Journal, 0 = Site (approximate OJS constants)
                assoc_id: journalId || '00000000-0000-0000-0000-000000000000',
                date_expire: dateExpire ? new Date(dateExpire).toISOString() : null,
                date_posted: new Date().toISOString(),
            })
            .select()
            .single();

        if (insertError) throw insertError;

        // Insert settings
        const settings = [
            { setting_name: 'title', setting_value: title },
            { setting_name: 'shortDescription', setting_value: shortDescription },
            { setting_name: 'description', setting_value: description },
        ].filter(s => s.setting_value);

        if (settings.length > 0) {
            const { error: settingsError } = await supabase
                .from('announcement_settings')
                .insert(settings.map(s => ({
                    announcement_id: announcement.id,
                    locale: 'en_US', // Default for now
                    ...s
                })));

            if (settingsError) throw settingsError;
        }

        revalidatePath('/admin/announcements');
        return { success: true, message: "Announcement created successfully" };

    } catch (error: any) {
        console.error("Create Announcement Error:", error);
        return { success: false, message: error.message };
    }
}

export async function deleteAnnouncement(id: string) {
    const supabase = await createSupabaseServerClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, message: error.message };
    }

    revalidatePath('/admin/announcements');
    return { success: true, message: "Announcement deleted" };
}

export async function getAnnouncements(journalId?: string) {
    const supabase = await createSupabaseServerClient();

    // Build query
    let query = supabase
        .from('announcements')
        .select(`
            *,
            settings:announcement_settings(*)
        `)
        .order('date_posted', { ascending: false });

    if (journalId) {
        query = query.eq('assoc_type', 256).eq('assoc_id', journalId);
    } else {
        // Site wide? Or all?
        // For admin page, maybe all.
    }

    const { data, error } = await query;

    if (error) {
        console.error("Get Announcements Error:", error);
        return [];
    }

    // Transform data to easier format
    return data.map((a: any) => {
        const title = a.settings.find((s: any) => s.setting_name === 'title')?.setting_value;
        const shortDescription = a.settings.find((s: any) => s.setting_name === 'shortDescription')?.setting_value;
        const description = a.settings.find((s: any) => s.setting_name === 'description')?.setting_value;

        return {
            id: a.id,
            datePosted: a.date_posted,
            dateExpire: a.date_expire,
            title,
            shortDescription,
            description
        };
    });
}
