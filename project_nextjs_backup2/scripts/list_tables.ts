
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function listTables() {
    // This requires pg_catalog access which might be restricted via API
    // So we'll try to just select from common tables
    const tables = ['journals', 'journal_settings', 'sections', 'section_settings', 'users', 'user_accounts'];

    for (const table of tables) {
        const { error } = await supabase.from(table).select('count').limit(1);
        if (error) {
            console.log(`Table '${table}': Error - ${error.message}`);
        } else {
            console.log(`Table '${table}': Exists`);
        }
    }
}

listTables();
