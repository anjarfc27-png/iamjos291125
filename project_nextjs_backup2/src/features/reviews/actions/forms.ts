"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
});

const elementSchema = z.object({
    formId: z.string().uuid(),
    question: z.string().min(1, "Question is required"),
    type: z.enum(['text', 'textarea', 'radio', 'checkbox']), // simplified types
    required: z.boolean().optional(),
    options: z.array(z.string()).optional(), // For radio/checkbox
});

export async function getReviewForms(journalId?: string) {
    const supabase = await createSupabaseServerClient();

    const { data: forms, error } = await supabase
        .from('review_forms')
        .select(`
            *,
            settings:review_form_settings(*)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Get Review Forms Error:", error);
        return [];
    }

    return forms.map((f: any) => ({
        id: f.id,
        title: f.settings.find((s: any) => s.setting_name === 'title')?.setting_value || 'Untitled Form',
        description: f.settings.find((s: any) => s.setting_name === 'description')?.setting_value || '',
        isActive: f.is_active
    }));
}

export async function getReviewFormDetails(formId: string) {
    const supabase = await createSupabaseServerClient();

    // Fetch form
    const { data: form } = await supabase
        .from('review_forms')
        .select(`*, settings:review_form_settings(*)`)
        .eq('id', formId)
        .single();

    if (!form) return null;

    // Fetch elements
    const { data: elements } = await supabase
        .from('review_form_elements')
        .select(`
            *,
            settings:review_form_element_settings(*)
        `)
        .eq('review_form_id', formId)
        .order('seq');

    return {
        id: form.id,
        title: form.settings.find((s: any) => s.setting_name === 'title')?.setting_value,
        description: form.settings.find((s: any) => s.setting_name === 'description')?.setting_value,
        elements: elements?.map((e: any) => ({
            id: e.id,
            type: e.element_type, // Need to map integer to string type if using OJS constants
            required: e.required,
            question: e.settings.find((s: any) => s.setting_name === 'question')?.setting_value,
            options: e.settings.find((s: any) => s.setting_name === 'options')?.setting_value ? JSON.parse(e.settings.find((s: any) => s.setting_name === 'options')?.setting_value) : []
        })) || []
    };
}

export async function createReviewForm(formData: FormData) {
    const supabase = await createSupabaseServerClient();

    const rawData = {
        title: formData.get("title"),
        description: formData.get("description"),
    };

    const result = formSchema.safeParse(rawData);
    if (!result.success) {
        return { success: false, message: result.error.issues[0].message };
    }

    const { title, description } = result.data;

    try {
        const { data: form, error: insertError } = await supabase
            .from('review_forms')
            .insert({ is_active: true })
            .select()
            .single();

        if (insertError) throw insertError;

        // Insert settings
        const settings = [
            { setting_name: 'title', setting_value: title },
            { setting_name: 'description', setting_value: description },
        ].filter(s => s.setting_value);

        if (settings.length > 0) {
            const { error: settingsError } = await supabase
                .from('review_form_settings')
                .insert(settings.map(s => ({
                    review_form_id: form.id,
                    locale: 'en_US',
                    ...s
                })));

            if (settingsError) throw settingsError;
        }

        revalidatePath('/admin/workflow/reviews/forms');
        return { success: true, message: "Form created successfully" };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function addFormElement(formData: FormData) {
    const supabase = await createSupabaseServerClient();

    // Simplified mapping for element_type integer
    // 1 = Text, 2 = Textarea, 3 = Radio, 4 = Checkbox
    const typeMap: Record<string, number> = {
        'text': 1,
        'textarea': 2,
        'radio': 3,
        'checkbox': 4
    };

    const rawData = {
        formId: formData.get("formId"),
        question: formData.get("question"),
        type: formData.get("type"),
        required: formData.get("required") === 'on',
        options: formData.get("options") ? (formData.get("options") as string).split('\n').filter(Boolean) : [],
    };

    const result = elementSchema.safeParse(rawData);
    if (!result.success) {
        return { success: false, message: result.error.issues[0].message };
    }

    const { formId, question, type, required, options } = result.data;

    try {
        // Get max seq
        const { data: maxSeqData } = await supabase
            .from('review_form_elements')
            .select('seq')
            .eq('review_form_id', formId)
            .order('seq', { ascending: false })
            .limit(1)
            .single();

        const nextSeq = (maxSeqData?.seq || 0) + 1;

        const { data: element, error: insertError } = await supabase
            .from('review_form_elements')
            .insert({
                review_form_id: formId,
                element_type: typeMap[type],
                required: required,
                seq: nextSeq,
                included: true
            })
            .select()
            .single();

        if (insertError) throw insertError;

        // Settings
        const settings = [
            { setting_name: 'question', setting_value: question },
            { setting_name: 'options', setting_value: JSON.stringify(options) },
        ];

        const { error: settingsError } = await supabase
            .from('review_form_element_settings')
            .insert(settings.map(s => ({
                review_form_element_id: element.id,
                locale: 'en_US',
                ...s
            })));

        if (settingsError) throw settingsError;

        revalidatePath(`/admin/workflow/reviews/forms/${formId}`); // Assuming we have a detail page
        return { success: true, message: "Question added" };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteReviewForm(id: string) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('review_forms').delete().eq('id', id);
    if (error) return { success: false, message: error.message };
    revalidatePath('/admin/workflow/reviews/forms');
    return { success: true, message: "Form deleted" };
}
