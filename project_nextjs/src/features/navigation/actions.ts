"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const menuItemSchema = z.object({
    menuId: z.string().uuid(),
    title: z.string().min(1, "Title is required"),
    url: z.string().optional(),
    type: z.enum(['custom', 'page']), // simplified for now
    parentId: z.string().optional().nullable(),
});

export async function getNavigationMenus(journalId?: string) {
    const supabase = await createSupabaseServerClient();

    // Fetch menus
    const { data: menus, error: menusError } = await supabase
        .from('navigation_menus')
        .select('*')
        .order('title');

    if (menusError) {
        console.error("Get Menus Error:", menusError);
        return [];
    }

    // Fetch items for all menus (or filter by menu IDs if needed, but for now fetch all)
    const { data: items, error: itemsError } = await supabase
        .from('navigation_menu_items')
        .select('*')
        .order('seq');

    if (itemsError) {
        console.error("Get Menu Items Error:", itemsError);
        return [];
    }

    // Combine
    return menus.map((menu: any) => ({
        id: menu.id,
        title: menu.title,
        area: menu.area_name,
        items: items.filter((item: any) => item.navigation_menu_id === menu.id)
            .map((item: any) => ({
                id: item.id,
                title: item.title,
                url: item.url,
                type: item.menu_item_type,
                seq: item.seq,
                parentId: item.parent_id
            }))
    }));
}

export async function addMenuItem(formData: FormData) {
    const supabase = await createSupabaseServerClient();

    const rawData = {
        menuId: formData.get("menuId"),
        title: formData.get("title"),
        url: formData.get("url"),
        type: formData.get("type") || 'custom',
        parentId: formData.get("parentId") || null,
    };

    const result = menuItemSchema.safeParse(rawData);
    if (!result.success) {
        return { success: false, message: result.error.issues[0].message };
    }

    const { menuId, title, url, type, parentId } = result.data;

    try {
        // Get max seq
        const { data: maxSeqData } = await supabase
            .from('navigation_menu_items')
            .select('seq')
            .eq('navigation_menu_id', menuId)
            .order('seq', { ascending: false })
            .limit(1)
            .single();

        const nextSeq = (maxSeqData?.seq || 0) + 1;

        const { error } = await supabase
            .from('navigation_menu_items')
            .insert({
                navigation_menu_id: menuId,
                title,
                url,
                menu_item_type: type,
                parent_id: parentId,
                seq: nextSeq
            });

        if (error) throw error;

        revalidatePath('/admin/site-settings/navigation');
        return { success: true, message: "Item added successfully" };

    } catch (error: any) {
        console.error("Add Menu Item Error:", error);
        return { success: false, message: error.message };
    }
}

export async function deleteMenuItem(itemId: string) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from('navigation_menu_items')
        .delete()
        .eq('id', itemId);

    if (error) {
        return { success: false, message: error.message };
    }

    revalidatePath('/admin/site-settings/navigation');
    return { success: true, message: "Item deleted" };
}
