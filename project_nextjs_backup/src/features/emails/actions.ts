"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateTemplateSchema = z.object({
    templateId: z.string().uuid(),
    subject: z.string().min(1, "Subject is required"),
    body: z.string().min(1, "Body is required"),
});

export async function getEmailTemplates(journalId?: string) {
    const supabase = await createSupabaseServerClient();

    // Fetch all templates (site-wide + journal specific if we supported it, but for now site-wide defaults)
    // In OJS, templates can be overridden per journal. 
    // For this implementation, we'll focus on the base templates.

    const { data, error } = await supabase
        .from('email_templates')
        .select(`
            *,
            settings:email_template_settings(*)
        `)
        .order('email_key');

    if (error) {
        console.error("Get Email Templates Error:", error);
        return [];
    }

    return data.map((t: any) => ({
        id: t.id,
        key: t.email_key,
        subject: t.settings.find((s: any) => s.setting_name === 'subject')?.setting_value || '',
        body: t.settings.find((s: any) => s.setting_name === 'body')?.setting_value || '',
        description: t.settings.find((s: any) => s.setting_name === 'description')?.setting_value || '',
        canEdit: t.can_edit
    }));
}

export async function updateEmailTemplate(formData: FormData) {
    const supabase = await createSupabaseServerClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const rawData = {
        templateId: formData.get("templateId"),
        subject: formData.get("subject"),
        body: formData.get("body"),
    };

    const result = updateTemplateSchema.safeParse(rawData);
    if (!result.success) {
        return { success: false, message: result.error.issues[0].message };
    }

    const { templateId, subject, body } = result.data;

    try {
        // Upsert settings
        // We need to handle 'subject' and 'body' settings

        const settingsToUpdate = [
            { setting_name: 'subject', setting_value: subject },
            { setting_name: 'body', setting_value: body },
        ];

        for (const setting of settingsToUpdate) {
            const { error } = await supabase
                .from('email_template_settings')
                .upsert({
                    email_template_id: templateId,
                    setting_name: setting.setting_name,
                    setting_value: setting.setting_value,
                    locale: 'en_US' // Hardcoded for now
                }, { onConflict: 'email_template_id, setting_name, locale' });

            if (error) throw error;
        }

        revalidatePath('/admin/workflow/emails');
        return { success: true, message: "Template updated successfully" };

    } catch (error: any) {
        console.error("Update Template Error:", error);
        return { success: false, message: error.message };
    }
}

export async function resetEmailTemplate(templateId: string) {
    // In a full OJS system, "reset" means deleting the journal-specific override and falling back to site default.
    // Since we are editing the site defaults directly here (simplified), "reset" might mean reverting to hardcoded seed data?
    // Or maybe we just don't implement "Reset" for site defaults yet, only "Edit".
    // Let's skip Reset for now as we don't have a "parent" to fall back to in this single-layer architecture yet.
    return { success: false, message: "Reset not implemented for site defaults" };
}
