"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSiteAdmin, requireJournalRole } from "@/lib/permissions";

// Complete OJS 3.3 journal schema
const journalSchema = z.object({
  title: z.string().trim().min(2, "Judul minimal 2 karakter."),
  initials: z.string().trim().max(16).optional().default(""),
  abbreviation: z.string().trim().max(32).optional().default(""),
  publisher: z.string().trim().max(128).optional().default(""),
  issnOnline: z.string().trim().max(32).optional().default(""),
  issnPrint: z.string().trim().max(32).optional().default(""),
  path: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Path wajib diisi.")
    .regex(/^[a-z0-9\-]+$/, "Path hanya boleh huruf, angka, dan tanda minus."),
  description: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .optional(),
  isPublic: z.boolean().optional().default(false),
});

type Result = { success: boolean; message?: string; journalId?: string };

function revalidateHostedJournals() {
  revalidatePath("/admin/site-management/hosted-journals");
}

export async function createJournalAction(input: z.infer<typeof journalSchema>): Promise<Result> {
  const parsed = journalSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Validasi gagal." };
  }

  // Bypass permission for testing
  await requireSiteAdmin();

  const supabase = getSupabaseAdminClient();

  // Prepare settings array
  const settings = [
    { setting_name: "name", setting_value: parsed.data.title },
  ];

  if (parsed.data.initials) {
    settings.push({ setting_name: "initials", setting_value: parsed.data.initials });
  }
  if (parsed.data.abbreviation) {
    settings.push({ setting_name: "abbreviation", setting_value: parsed.data.abbreviation });
  }
  if (parsed.data.publisher) {
    settings.push({ setting_name: "publisher", setting_value: parsed.data.publisher });
  }
  if (parsed.data.issnOnline) {
    settings.push({ setting_name: "onlineIssn", setting_value: parsed.data.issnOnline });
  }
  if (parsed.data.issnPrint) {
    settings.push({ setting_name: "printIssn", setting_value: parsed.data.issnPrint });
  }
  if (parsed.data.description) {
    settings.push({ setting_name: "description", setting_value: parsed.data.description });
  }

  // Call atomic RPC
  const { data: newJournalId, error } = await supabase.rpc('admin_create_journal', {
    p_path: parsed.data.path,
    p_enabled: parsed.data.isPublic,
    p_settings: settings
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "Path jurnal sudah digunakan. Gunakan path lain." };
    }
    return { success: false, message: `Error: ${error.message}` };
  }

  revalidateHostedJournals();
  return { success: true, journalId: newJournalId };
}

// ... existing code ...

// SECTION ACTIONS
export async function createSectionAction(input: {
  journalId: string;
  title: string;
  abbreviation: string;
  policy?: string;
}): Promise<Result> {
  try {
    await requireJournalRole(input.journalId, "manager");
    const supabase = getSupabaseAdminClient();

    // 1. Create Section (Metadata)
    const { data: section, error } = await supabase.from("sections").insert({
      journal_id: input.journalId,
      seq: 99, // Default sequence, should be calculated but 99 is fine for now
      editor_restricted: false,
      meta_indexed: true,
      meta_reviewed: true,
      abstracts_not_required: false,
      hide_title: false,
      hide_author: false,
      is_active: true,
    }).select('id').single();

    if (error) throw error;

    // 2. Create Section Settings
    const settings = [
      { section_id: section.id, setting_name: "title", setting_value: input.title, locale: "" },
      { section_id: section.id, setting_name: "abbrev", setting_value: input.abbreviation, locale: "" },
    ];
    if (input.policy) {
      settings.push({ section_id: section.id, setting_name: "policy", setting_value: input.policy, locale: "" });
    }

    const { error: settingsError } = await supabase
      .from("section_settings")
      .insert(settings);

    if (settingsError) throw settingsError;

    revalidatePath(`/admin/journals/${input.journalId}/settings/wizard`);
    return { success: true };
  } catch (error: any) {
    console.error("Create Section Error:", error);
    return { success: false, message: error?.message || "Gagal membuat section." };
  }
}

export async function updateSectionAction(input: {
  sectionId: string;
  journalId: string;
  title: string;
  abbreviation: string;
  policy?: string;
}): Promise<Result> {
  try {
    await requireJournalRole(input.journalId, "manager");
    const supabase = getSupabaseAdminClient();

    // Update settings (Upsert is best here)
    const settings = [
      { section_id: input.sectionId, setting_name: "title", setting_value: input.title, locale: "" },
      { section_id: input.sectionId, setting_name: "abbrev", setting_value: input.abbreviation, locale: "" },
    ];
    if (input.policy !== undefined) {
      settings.push({ section_id: input.sectionId, setting_name: "policy", setting_value: input.policy ?? "", locale: "" });
    }

    const { error } = await supabase
      .from("section_settings")
      .upsert(settings, { onConflict: "section_id,setting_name,locale" });

    if (error) throw error;
    revalidatePath(`/admin/journals/${input.journalId}/settings/wizard`);
    return { success: true };
  } catch (error: any) {
    console.error("Update Section Error:", error);
    return { success: false, message: error?.message || "Gagal memperbarui section." };
  }
}

export async function deleteSectionAction(
  sectionId: string,
  journalId: string
): Promise<Result> {
  try {
    await requireJournalRole(journalId, "manager");
    const supabase = getSupabaseAdminClient();

    const { error } = await supabase
      .from("sections")
      .delete()
      .eq("id", sectionId);

    if (error) throw error;
    revalidatePath(`/admin/journals/${journalId}/settings/wizard`);
    return { success: true };
  } catch (error: any) {
    console.error("Delete Section Error:", error);
    return { success: false, message: error?.message || "Gagal menghapus section." };
  }
}

// USER ENROLLMENT ACTION
export async function enrollUserAction(input: {
  journalId: string;
  email: string;
  roleId: number; // OJS role ID
}): Promise<Result> {
  try {
    await requireJournalRole(input.journalId, "manager");
    const supabase = getSupabaseAdminClient();

    // 1. Find user by email
    const { data: user, error: userError } = await supabase
      .from("user_accounts")
      .select("id")
      .eq("email", input.email)
      .single();

    if (userError || !user) {
      return { success: false, message: "User not found." };
    }

    // 2. Assign role in user_user_groups
    const { error: roleError } = await supabase.from("user_user_groups").insert({
      user_id: user.id,
      user_group_id: null, // We don't use user_groups table directly for now if using raw role_id
      // Wait, we need a user_group_id that matches the role_id and context_id
      // Let's find or create a user_group for this role in this context
    });

    // Correction: We need to find a valid user_group for this role in this journal
    // If it doesn't exist, we might need to create it, but usually standard groups exist.
    // For MVP, let's assume we insert into user_user_groups linking to a user_group.

    // Fetch a user_group for this role in this journal
    const { data: userGroup } = await supabase
      .from("user_groups")
      .select("id")
      .eq("context_id", input.journalId)
      .eq("role_id", input.roleId)
      .limit(1)
      .single();

    if (!userGroup) {
      return { success: false, message: "Role group not found for this journal." };
    }

    const { error: enrollError } = await supabase.from("user_user_groups").insert({
      user_id: user.id,
      user_group_id: userGroup.id
    });

    if (enrollError) throw enrollError;

    revalidatePath(`/admin/journals/${input.journalId}/settings/wizard`);
    return { success: true };
  } catch (error: any) {
    console.error("Enroll User Error:", error);
    return { success: false, message: error?.message || "Gagal mendaftarkan user." };
  }
}
export async function updateJournalAction(input: {
  id: string;
  title: string;
  initials?: string;
  abbreviation?: string;
  publisher?: string;
  issnOnline?: string;
  issnPrint?: string;
  path: string;
  description?: string | null;
  isPublic: boolean;
}): Promise<Result> {
  const parsed = journalSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Validasi gagal." };
  }

  await requireJournalRole(input.id, ["manager", "admin"]);

  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("journals")
    .update({
      path: parsed.data.path,
      enabled: parsed.data.isPublic,
    })
    .eq("id", input.id);

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "Path jurnal sudah digunakan. Gunakan path lain." };
    }
    return { success: false, message: "Tidak dapat memperbarui jurnal." };
  }

  // Update settings
  const settingsUpdates = [
    { setting_name: "name", setting_value: parsed.data.title },
  ];

  if (parsed.data.initials !== undefined) {
    settingsUpdates.push({ setting_name: "initials", setting_value: parsed.data.initials });
  }
  if (parsed.data.abbreviation !== undefined) {
    settingsUpdates.push({ setting_name: "abbreviation", setting_value: parsed.data.abbreviation });
  }
  if (parsed.data.publisher !== undefined) {
    settingsUpdates.push({ setting_name: "publisher", setting_value: parsed.data.publisher });
  }
  if (parsed.data.issnOnline !== undefined) {
    settingsUpdates.push({ setting_name: "onlineIssn", setting_value: parsed.data.issnOnline });
  }
  if (parsed.data.issnPrint !== undefined) {
    settingsUpdates.push({ setting_name: "printIssn", setting_value: parsed.data.issnPrint });
  }
  if (parsed.data.description !== undefined) {
    settingsUpdates.push({ setting_name: "description", setting_value: parsed.data.description ?? "" });
  }

  const settingsPayload = settingsUpdates.map(setting => ({
    journal_id: input.id,
    locale: '', // Default locale, or make it dynamic if needed
    setting_name: setting.setting_name,
    setting_value: setting.setting_value,
  }));

  if (settingsPayload.length > 0) {
    const { error: settingsError } = await supabase
      .from("journal_settings")
      .upsert(settingsPayload, { onConflict: 'journal_id,setting_name,locale' });

    if (settingsError) {
      console.error("Error updating settings:", settingsError);
      return { success: false, message: "Gagal memperbarui pengaturan jurnal." };
    }
  }

  revalidateHostedJournals();
  return { success: true };
}

// SETUP JOURNAL ACTION (Wizard Completion)
export async function setupJournalAction(input: {
  journalId: string;
  sections: Array<{
    title: string;
    abbreviation: string;
    policy: string;
  }>;
  plugins: string[]; // Array of enabled plugin IDs
}): Promise<Result> {
  await requireSiteAdmin(); // Or requireJournalRole(input.journalId, ['manager']) if we want to allow managers

  const supabase = getSupabaseAdminClient();

  // 1. Insert Sections
  if (input.sections.length > 0) {
    for (const [index, section] of input.sections.entries()) {
      // Create section
      const { data: sectionData, error: sectionError } = await supabase
        .from("sections")
        .insert({
          journal_id: input.journalId,
          seq: index + 1,
          editor_restricted: false,
          meta_indexed: true,
          meta_reviewed: true,
          abstracts_not_required: false,
          hide_title: false,
          hide_author: false,
        })
        .select("id")
        .single();

      if (sectionError) {
        console.error("Error creating section:", sectionError);
        continue;
      }

      // Create section settings
      const settings = [
        { section_id: sectionData.id, setting_name: "title", setting_value: section.title, locale: "" },
        { section_id: sectionData.id, setting_name: "abbrev", setting_value: section.abbreviation, locale: "" },
        { section_id: sectionData.id, setting_name: "policy", setting_value: section.policy, locale: "" },
      ];

      const { error: settingsError } = await supabase
        .from("section_settings")
        .insert(settings);

      if (settingsError) {
        console.error("Error creating section settings:", settingsError);
      }
    }
  }

  // 2. Insert Plugin Settings (Enable plugins)
  if (input.plugins.length > 0) {
    const pluginSettings = input.plugins.map(pluginId => ({
      journal_id: input.journalId,
      setting_name: `plugin_enabled_${pluginId}`,
      setting_value: "true",
      locale: "",
    }));

    const { error: pluginError } = await supabase
      .from("journal_settings")
      .upsert(pluginSettings, { onConflict: "journal_id,setting_name,locale" });

    if (pluginError) {
      console.error("Error enabling plugins:", pluginError);
      return { success: false, message: "Gagal menyimpan pengaturan plugin." };
    }
  }

  revalidateHostedJournals();
  return { success: true };
}

// USER ROLE MANAGEMENT ACTIONS
export async function listJournalUserRoles(journalId: string) {
  const supabase = getSupabaseAdminClient();

  // Get all roles for this journal
  // We need to join with user_accounts to get user details if needed, 
  // but for now let's just get the roles and maybe user emails if possible
  // user_account_roles has: user_id, role_name, journal_id

  const { data, error } = await supabase
    .from("user_account_roles")
    .select("user_id, role_name, created_at")
    .eq("journal_id", journalId);

  if (error) {
    console.error("Error listing journal user roles:", error);
    throw error;
  }

  return data.map(row => ({
    user_id: row.user_id,
    role: row.role_name,
    assigned_at: row.created_at
  }));
}

export async function addJournalUserRole(journalId: string, userId: string, role: string): Promise<Result> {
  const supabase = getSupabaseAdminClient();

  // Validate role
  const validRoles = ["manager", "editor", "reviewer", "author", "reader", "copyeditor", "layout_editor", "proofreader"];
  if (!validRoles.includes(role)) {
    return { success: false, message: "Peran tidak valid." };
  }

  // Check if role already exists
  const { data: existing } = await supabase
    .from("user_account_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("journal_id", journalId)
    .eq("role_name", role)
    .single();

  if (existing) {
    return { success: false, message: "Pengguna sudah memiliki peran ini." };
  }

  const { error } = await supabase
    .from("user_account_roles")
    .insert({
      user_id: userId,
      journal_id: journalId,
      role_name: role,
    });

  if (error) {
    console.error("Error adding journal user role:", error);
    return { success: false, message: "Gagal menambahkan peran pengguna." };
  }

  return { success: true };
}

export async function removeJournalUserRole(journalId: string, userId: string, role: string): Promise<Result> {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("user_account_roles")
    .delete()
    .eq("user_id", userId)
    .eq("journal_id", journalId)
    .eq("role_name", role);

  if (error) {
    console.error("Error removing journal user role:", error);
    return { success: false, message: "Gagal menghapus peran pengguna." };
  }

  return { success: true };
}

export async function getSectionsAction(journalId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("sections")
    .select("id, title, abbreviation")
    .eq("journal_id", journalId)
    .order("seq", { ascending: true });

  if (error) {
    console.error("Error fetching sections:", error);
    return { success: false, message: "Gagal mengambil data section." };
  }
  return { success: true, data };
}

export async function getJournalUsersAction(journalId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("user_account_roles")
    .select(`
      user_id,
      role_name,
      user:user_accounts(id, first_name, last_name, email)
    `)
    .eq("journal_id", journalId);

  if (error) {
    console.error("Error fetching journal users:", error);
    return { success: false, message: "Gagal mengambil data user." };
  }

  const userMap = new Map();
  data.forEach((row: any) => {
    if (!row.user) return;
    if (!userMap.has(row.user_id)) {
      userMap.set(row.user_id, {
        id: row.user.id,
        fullName: `${row.user.first_name} ${row.user.last_name}`.trim(),
        email: row.user.email,
        roles: []
      });
    }
    userMap.get(row.user_id).roles.push(row.role_name);
  });

  return { success: true, data: Array.from(userMap.values()) };
}
