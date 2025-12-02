
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSettings() {
    console.log('Checking journal_settings table for new fields...');

    // 1. Get all journals to map IDs to names
    const { data: journals } = await supabase
        .from('journals')
        .select('id, path');

    const journalMap = new Map(journals?.map(j => [j.id, j.path]));

    // 2. Get settings
    const { data: settings, error } = await supabase
        .from('journal_settings')
        .select('journal_id, setting_name, setting_value')
        .in('setting_name', ['publisher', 'onlineIssn', 'printIssn']);

    if (error) {
        console.error('Error fetching settings:', error);
        return;
    }

    if (settings && settings.length > 0) {
        console.log(`✅ Found ${settings.length} saved settings.`);

        // Group by journal
        const grouped = settings.reduce((acc, curr) => {
            const path = journalMap.get(curr.journal_id) || 'Unknown Journal';
            if (!acc[path]) acc[path] = {};
            acc[path][curr.setting_name] = curr.setting_value;
            return acc;
        }, {} as Record<string, any>);

        console.log(JSON.stringify(grouped, null, 2));
    } else {
        console.log('ℹ️  No settings found for publisher, onlineIssn, or printIssn yet.');
    }
}

checkSettings();
