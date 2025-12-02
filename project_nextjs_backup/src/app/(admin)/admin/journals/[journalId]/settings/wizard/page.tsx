import { JournalSettingsWizard } from "@/features/journals/components/journal-settings-wizard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ journalId: string }>;
}

export default async function WizardPage({ params }: PageProps) {
    const { journalId } = await params;
    const supabase = await createSupabaseServerClient();

    const { data: journal } = await supabase
        .from("journals")
        .select("*")
        .eq("id", journalId)
        .single();

    if (!journal) {
        notFound();
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <JournalSettingsWizard journalId={journalId} initialData={journal} />
        </div>
    );
}
