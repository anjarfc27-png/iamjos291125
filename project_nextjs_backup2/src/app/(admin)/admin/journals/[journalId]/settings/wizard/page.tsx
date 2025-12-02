import { JournalSettingsWizard } from "@/features/journals/components/journal-settings-wizard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ journalId: string }>;
}

export default async function WizardPage({ params }: PageProps) {
    const { journalId } = await params;
    const supabase = await createSupabaseServerClient();

    // Fetch Journal
    const { data: journal } = await supabase
        .from("journals")
        .select("*")
        .eq("id", journalId)
        .single();

    if (!journal) {
        notFound();
    }

    // Fetch Settings
    const { data: settings } = await supabase
        .from("journal_settings")
        .select("setting_name, setting_value")
        .eq("journal_id", journalId);

    // Transform settings to object
    const settingsMap = (settings || []).reduce((acc: any, curr) => {
        acc[curr.setting_name] = curr.setting_value;
        return acc;
    }, {});

    // Merge journal data with settings
    const initialData = {
        ...journal,
        ...settingsMap,
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <JournalSettingsWizard journalId={journalId} initialData={initialData} />
        </div>
    );
}
