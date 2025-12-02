"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSiteAdmin, requireJournalRole } from "@/lib/permissions";

// Complete OJS 3.3 journal schema
const journalSchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter."),
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
    .nullable(),
  isPublic: z.boolean(),
});

type Result = { success: true; journalId?: string } | { success: false; message: string };

const revalidateHostedJournals = () => revalidatePath("/admin/site-management/hosted-journals");

// CREATE JOURNAL ACTION - Complete with all OJS 3.3 fields
export async function createJournalAction(input: {
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

// UPDATE JOURNAL ACTION
export async function updateJournalAction(input: {
  id: string;
  title: string;
  initials?: string;
  abbreviation?: string;
  path: string;
  description?: string | null;
  isPublic: boolean;
}): Promise<Result> {
  const parsed = journalSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Validasi gagal." };
  }

  await requireJournalRole(input.id, ["manager", "editor"]);

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
  if (parsed.data.description !== undefined) {
    settingsUpdates.push({ setting_name: "description", setting_value: parsed.data.description ?? "" });
  }

  for (const setting of settingsUpdates) {
    await supabase.from("journal_settings").upsert({
      journal_id: input.id,
      locale: '',
      setting_name: setting.setting_name,
      setting_value: setting.setting_value,
    }, { onConflict: 'journal_id,setting_name,locale' });
  }

  revalidateHostedJournals();
  return { success: true };
}

// DELETE JOURNAL ACTION
export async function deleteJournalAction(id: string): Promise<Result> {
  await requireJournalRole(id, ["manager"]);

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("journals").delete().eq("id", id);

  if (error) {
    return { success: false, message: "Tidak dapat menghapus jurnal ini." };
  }

  revalidateHostedJournals();
  return { success: true };
}

// USER ROLE MANAGEMENT ACTIONS

export async function listJournalUserRoles(journalId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("user_account_roles")
    .select("user_id, role, assigned_at, user_accounts(first_name, last_name, email, username)")
    .eq("journal_id", journalId);

  if (error) return [];

  return data.map((row: any) => ({
    user_id: row.user_id,
    role: row.role,
    assigned_at: row.assigned_at,
    first_name: row.user_accounts?.first_name,
    last_name: row.user_accounts?.last_name,
    email: row.user_accounts?.email,
    username: row.user_accounts?.username,
  }));
}

export async function addJournalUserRole(journalId: string, userId: string, role: string): Promise<Result> {
  await requireJournalRole(journalId, ["manager", "admin"]);

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("user_account_roles")
    .insert({
      journal_id: journalId,
      user_id: userId,
      role: role,
    });

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "Pengguna sudah memiliki peran ini." };
    }
    return { success: false, message: "Gagal menambahkan peran." };
  }

  revalidatePath(`/journals/${journalId}/users`);
  return { success: true };
}

export async function removeJournalUserRole(journalId: string, userId: string, role: string): Promise<Result> {
  await requireJournalRole(journalId, ["manager", "admin"]);

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("user_account_roles")
    .delete()
    .eq("journal_id", journalId)
    .eq("user_id", userId)
    .eq("role", role);

  if (error) {
    return { success: false, message: "Gagal menghapus peran." };
  }

  revalidatePath(`/journals/${journalId}/users`);
  return { success: true };
}
