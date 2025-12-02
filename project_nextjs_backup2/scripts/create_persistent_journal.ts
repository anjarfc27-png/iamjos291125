
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createPersistentJournal() {
    console.log('Creating Persistent Journal...');
    const testPath = 'phase24-journal';
    
    // Check if exists first
    const { data: existing } = await supabase.from('journals').select('id').eq('path', testPath).single();
    if (existing) {
        console.log('Journal already exists:', existing.id);
        return;
    }

    // Create Journal
    const { data: journalId, error } = await supabase.rpc('admin_create_journal', {
        p_path: testPath,
        p_enabled: true,
        p_settings: [
            { setting_name: 'name', setting_value: 'Journal of Phase 24' },
            { setting_name: 'initials', setting_value: 'JP24' },
            { setting_name: 'abbreviation', setting_value: 'J. Ph. 24' },
            { setting_name: 'description', setting_value: 'A persistent test journal for Phase 24 audit.' }
        ]
    });

    if (error) {
        console.error('RPC Failed:', error);
        return;
    }

    console.log(`✅ Journal created with ID: ${journalId}`);
}

createPersistentJournal();
