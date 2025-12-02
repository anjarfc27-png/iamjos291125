import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMissingTables() {
    console.log('Checking for potentially missing OJS tables...');

    const tablesToCheck = [
        'queries',
        'query_participants',
        'edit_decisions',
        'navigation_menus',
        'navigation_menu_items',
        'navigation_menu_item_settings',
        'announcements',
        'announcement_settings'
    ];

    let allExist = true;

    for (const table of tablesToCheck) {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
            console.error(`[MISSING] Table '${table}': ${error.message}`);
            allExist = false;
        } else {
            console.log(`[EXISTS] Table '${table}'`);
        }
    }

    if (allExist) {
        console.log('\n✅ All checked tables exist.');
    } else {
        console.log('\n⚠️ Some tables are missing.');
        process.exit(1);
    }
}

checkMissingTables().catch(console.error);
