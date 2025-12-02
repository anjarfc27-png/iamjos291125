
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testJournalCreation() {
    console.log('Testing Journal Creation via RPC...');
    const testPath = 'test-journal-script-' + Date.now();

    // 1. Create Journal
    const { data: journalId, error } = await supabase.rpc('admin_create_journal', {
        p_path: testPath,
        p_enabled: true,
        p_settings: [
            { setting_name: 'name', setting_value: 'Script Test Journal' },
            { setting_name: 'initials', setting_value: 'STJ' }
        ]
    });

    if (error) {
        console.error('RPC Failed:', error);
        return;
    }

    console.log(`Journal created with ID: ${journalId}`);

    // 2. Verify Journal Table
    const { data: journal } = await supabase.from('journals').select('*').eq('id', journalId).single();
    if (journal) {
        console.log('✅ Journal record found:', journal.path);
    } else {
        console.error('❌ Journal record NOT found!');
    }

    // 3. Verify Settings Table
    const { data: settings } = await supabase.from('journal_settings').select('*').eq('journal_id', journalId);
    if (settings && settings.length > 0) {
        console.log(`✅ Found ${settings.length} settings records.`);
        settings.forEach(s => console.log(`   - ${s.setting_name}: ${s.setting_value}`));
    } else {
        console.error('❌ No settings found!');
    }

    // 4. Cleanup
    console.log('Cleaning up...');
    const { error: deleteError } = await supabase.from('journals').delete().eq('id', journalId);
    if (deleteError) {
        console.error('Failed to delete test journal:', deleteError);
    } else {
        console.log('✅ Test journal deleted.');
    }
}

testJournalCreation();
