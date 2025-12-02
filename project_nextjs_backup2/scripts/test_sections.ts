
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testSections() {
    console.log('Testing Sections...');

    // 1. Get Journal ID
    const { data: journal } = await supabase.from('journals').select('id').eq('path', 'phase24-journal').single();
    if (!journal) {
        console.error('Journal not found.');
        return;
    }
    const journalId = journal.id;
    console.log('Journal ID:', journalId);

    // Cleanup existing sections
    await supabase.from('sections').delete().eq('journal_id', journalId);

    // 2. Create Section
    console.log('Creating Section...');
    const { data: section, error: sectionError } = await supabase.from("sections").insert({
        journal_id: journalId,
        seq: 1,
        editor_restricted: false,
        meta_indexed: true,
        meta_reviewed: true,
        abstracts_not_required: false,
        hide_title: false,
        hide_author: false,
        is_active: true,
    }).select('id').single();

    if (sectionError) {
        console.error('Create Section Failed:', sectionError);
        return;
    }
    console.log('✅ Section created:', section.id);

    // Insert settings
    const settings = [
        { section_id: section.id, setting_name: "title", setting_value: 'Articles', locale: "" },
        { section_id: section.id, setting_name: "abbrev", setting_value: 'ART', locale: "" },
    ];
    const { error: settingsError } = await supabase.from("section_settings").insert(settings);
    if (settingsError) {
        console.error('Create Section Settings Failed:', settingsError);
    } else {
        console.log('✅ Section settings created.');
    }

    // 3. Verify
    const { data: sections } = await supabase.from('sections').select('*').eq('journal_id', journalId);
    console.log(`Sections count: ${sections?.length}`);

    const { data: fetchedSettings } = await supabase.from('section_settings').select('*').eq('section_id', section.id);
    console.log(`Settings count: ${fetchedSettings?.length}`);
}

testSections();
