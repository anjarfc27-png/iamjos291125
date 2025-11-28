import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { JournalSettingsWizard } from "@/features/journals/components/journal-settings-wizard";
import { notFound } from "next/navigation";

type Props = {
    params: Promise<{ journalId: string }>;
};

export default async function JournalSettingsWizardPage({ params }: Props) {
    const { journalId } = await params;
    const supabase = getSupabaseAdminClient();

    // Get journal data
    const { data: journal, error } = await supabase
        .from("journals")
        .select("*")
        .eq("id", journalId)
        .single();

    if (error || !journal) {
        notFound();
    }

    // Get journal settings
    const { data: settings } = await supabase
        .from("journal_settings")
        .select("*")
        .eq("journal_id", journalId);

    // Get name from settings
    const nameSetting = settings?.find(s => s.setting_name === "name");
    const descSetting = settings?.find(s => s.setting_name === "description");

    const initialData = {
        id: journal.id,
        name: nameSetting?.setting_value || "",
        path: journal.path || "",
        description: descSetting?.setting_value || "",
        settings: settings || [],
    };

    return <JournalSettingsWizard journalId={journalId} initialData={initialData} />;
}
