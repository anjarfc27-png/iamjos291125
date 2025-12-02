"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// We need the service role key for admin operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

const updateUserSchema = z.object({
    userId: z.string().uuid(),
    // Identity
    firstName: z.string().min(1, "Given name is required"),
    lastName: z.string().optional(),
    preferredName: z.string().optional(),

    // Contact
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    affiliation: z.string().optional(),
    mailingAddress: z.string().optional(),
    country: z.string().optional(),

    // Public
    username: z.string().min(3, "Username must be at least 3 characters"),
    url: z.string().url("Invalid URL").optional().or(z.literal("")),
    orcid: z.string().optional(), // Basic validation, could be stricter
    biography: z.string().optional(),

    // Password
    password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
});

export async function getUserDetails(userId: string) {
    const supabase = await createSupabaseServerClient();

    // Verify access (admin or self)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Allow if admin or if fetching own profile
    if (user.id !== userId) {
        const { data: roles } = await supabase
            .from('user_account_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin');

        if (!roles || roles.length === 0) return null;
    }

    // Fetch core data
    const { data: account } = await supabaseAdmin
        .from('user_accounts')
        .select('*')
        .eq('id', userId)
        .single();

    if (!account) return null;

    // Fetch settings
    const { data: settings } = await supabaseAdmin
        .from('user_settings')
        .select('setting_name, setting_value')
        .eq('user_id', userId);

    const settingsMap = (settings || []).reduce((acc, curr) => {
        acc[curr.setting_name] = curr.setting_value;
        return acc;
    }, {} as Record<string, string>);

    return {
        ...account,
        settings: settingsMap
    };
}

export async function updateUserProfile(formData: FormData) {
    const rawData = {
        userId: formData.get("userId"),
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        preferredName: formData.get("preferredName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        affiliation: formData.get("affiliation"),
        mailingAddress: formData.get("mailingAddress"),
        country: formData.get("country"),
        username: formData.get("username"),
        url: formData.get("url"),
        orcid: formData.get("orcid"),
        biography: formData.get("biography"),
        password: formData.get("password"),
    };

    const result = updateUserSchema.safeParse(rawData);

    if (!result.success) {
        const errorMessage = result.error.issues?.[0]?.message || result.error.message || "Validation failed";
        return { success: false, message: errorMessage };
    }

    const data = result.data;
    const { userId } = data;

    const supabase = await createSupabaseServerClient();

    // Verify access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    // Allow if admin or self
    if (user.id !== userId) {
        const { data: roles } = await supabase
            .from('user_account_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin');
        if (!roles || roles.length === 0) {
            return { success: false, message: "Unauthorized: Admin access required" };
        }
    }

    // 1. Update auth.users (email, password)
    const authUpdates: any = { email: data.email };
    if (data.password) {
        authUpdates.password = data.password;
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdates);

    if (authError) {
        return { success: false, message: `Auth Update Failed: ${authError.message}` };
    }

    // 2. Update public.user_accounts (core fields)
    const { error: dbError } = await supabaseAdmin
        .from('user_accounts')
        .update({
            first_name: data.firstName,
            last_name: data.lastName,
            username: data.username,
            email: data.email
        })
        .eq('id', userId);

    if (dbError) {
        return { success: false, message: `DB Update Failed: ${dbError.message}` };
    }

    // 3. Update user_settings (extended fields)
    const settingsToUpdate = [
        { name: 'preferredName', value: data.preferredName },
        { name: 'phone', value: data.phone },
        { name: 'affiliation', value: data.affiliation },
        { name: 'mailingAddress', value: data.mailingAddress },
        { name: 'country', value: data.country },
        { name: 'url', value: data.url },
        { name: 'orcid', value: data.orcid },
        { name: 'biography', value: data.biography },
    ];

    for (const setting of settingsToUpdate) {
        if (setting.value !== undefined && setting.value !== null) {
            // Upsert setting
            const { error: settingError } = await supabaseAdmin
                .from('user_settings')
                .upsert({
                    user_id: userId,
                    setting_name: setting.name,
                    setting_value: setting.value,
                    // locale: 'en_US' // Optional: handle locale if needed
                }, { onConflict: 'user_id, setting_name' }); // Ensure unique constraint exists or handle duplicates

            if (settingError) {
                console.error(`Failed to save setting ${setting.name}:`, settingError);
            }
        }
    }

    revalidatePath('/admin/users');
    revalidatePath('/admin/profile');
    return { success: true, message: "User profile updated successfully" };
}

export async function mergeUsers(sourceUserId: string, targetUserId: string) {
    const supabase = await createSupabaseServerClient();

    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: roles } = await supabase
        .from('user_account_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

    if (!roles || roles.length === 0) {
        return { success: false, message: "Unauthorized: Admin access required" };
    }

    if (sourceUserId === targetUserId) {
        return { success: false, message: "Cannot merge user into themselves" };
    }

    try {
        // Call atomic RPC function
        const { error: rpcError } = await supabase.rpc('admin_merge_users', {
            source_user_id: sourceUserId,
            target_user_id: targetUserId
        });

        if (rpcError) throw rpcError;

        // Delete Source User via Admin API to ensure auth.users cleanup
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(sourceUserId);
        if (deleteError) throw deleteError;

        revalidatePath('/admin/users');
        return { success: true, message: "Users merged successfully" };

    } catch (error: any) {
        return { success: false, message: `Merge failed: ${error.message}` };
    }
}

export async function loginAsUser(userId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    // Check admin role
    const { data: roles } = await supabase
        .from('user_account_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

    if (!roles || roles.length === 0) {
        return { success: false, message: "Unauthorized" };
    }

    // Get target user email
    const { data: targetUser, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error || !targetUser.user) {
        return { success: false, message: "User not found" };
    }

    // Generate magic link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: targetUser.user.email!
    });

    if (linkError || !linkData.properties?.action_link) {
        return { success: false, message: "Failed to generate login link" };
    }

    return { success: true, url: linkData.properties.action_link };
}

export async function toggleUserBan(userId: string, ban: boolean) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    // Check admin role
    const { data: roles } = await supabase
        .from('user_account_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

    if (!roles || roles.length === 0) {
        return { success: false, message: "Unauthorized" };
    }

    const banDuration = ban ? "876000h" : "0s"; // 100 years or 0
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: banDuration
    });

    if (error) {
        return { success: false, message: `Failed to ${ban ? 'ban' : 'unban'} user` };
    }

    revalidatePath('/admin/users');
    return { success: true, message: `User ${ban ? 'banned' : 'unbanned'} successfully` };
}
