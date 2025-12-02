import { createClient } from '@supabase/supabase-js';

// User provided keys directly
const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyJournalWizard() {
    console.log('🧙‍♂️ Verifying Journal Wizard Persistence...\n');

    const testPath = `wizard-test-${Date.now()}`;
    let journalId = '';

    try {
        // 1. Create Journal (Simulate Step 1 & 2)
        console.log('1. Creating Test Journal...');
        const { data: newJournalId, error: createError } = await supabase.rpc('admin_create_journal', {
            p_path: testPath,
            p_enabled: true,
            p_settings: [{ setting_name: 'name', setting_value: 'Wizard Test Journal' }]
        });

        if (createError) throw new Error(`Create failed: ${createError.message}`);
        journalId = newJournalId;
        console.log(`   ✅ Created journal: ${journalId} (${testPath})`);

        // 2. Insert Sections (Simulate Step 3)
        console.log('2. Inserting Sections...');
        const { data: sectionData, error: sectionError } = await supabase
            .from("sections")
            .insert({
                journal_id: journalId,
                seq: 1,
                editor_restricted: false,
                meta_indexed: true,
                meta_reviewed: true,
                abstracts_not_required: false,
                hide_title: false,
                hide_author: false,
            })
            .select("id")
            .single();

        if (sectionError) throw new Error(`Section insert failed: ${sectionError.message}`);
        console.log(`   ✅ Created section: ${sectionData.id}`);

        // Insert Section Settings
        const { error: secSettingError } = await supabase
            .from("section_settings")
            .insert([
                { section_id: sectionData.id, setting_name: "title", setting_value: "Articles", locale: "" },
                { section_id: sectionData.id, setting_name: "abbrev", setting_value: "ART", locale: "" }
            ]);

        if (secSettingError) throw new Error(`Section settings failed: ${secSettingError.message}`);
        console.log('   ✅ Created section settings');

        // 3. Insert Plugin Settings (Simulate Step 4)
        console.log('3. Enabling Plugins...');
        const { error: pluginError } = await supabase
            .from("journal_settings")
            .upsert([
                { journal_id: journalId, setting_name: "plugin_enabled_quickSubmit", setting_value: "true", locale: "" }
            ], { onConflict: "journal_id,setting_name,locale" });

        if (pluginError) throw new Error(`Plugin enable failed: ${pluginError.message}`);
        console.log('   ✅ Enabled quickSubmit plugin');

        // 4. Verification Read
        console.log('4. Verifying Data...');

        // Check Section
        const { data: checkSection } = await supabase
            .from('sections')
            .select('*, section_settings(*)')
            .eq('journal_id', journalId)
            .single();

        if (!checkSection) throw new Error('Verification failed: Section not found');
        console.log('   ✅ Section verified');

        // Check Plugin
        const { data: checkPlugin } = await supabase
            .from('journal_settings')
            .select('*')
            .eq('journal_id', journalId)
            .eq('setting_name', 'plugin_enabled_quickSubmit')
            .single();

        if (!checkPlugin || checkPlugin.setting_value !== 'true') throw new Error('Verification failed: Plugin setting not found or wrong value');
        console.log('   ✅ Plugin setting verified');

        console.log('\n✨ Journal Wizard Verification PASSED!');

    } catch (err: any) {
        console.error('\n❌ Verification FAILED:', err.message);
    } finally {
        // Cleanup
        if (journalId) {
            console.log('\n🧹 Cleaning up...');
            await supabase.from('journals').delete().eq('id', journalId);
            console.log('   Deleted test journal.');
        }
    }
}

verifyJournalWizard();
