
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTables() {
    const tables = [
        'site_appearance',
        'site_plugins',
        'site_information',
        'site_languages',
        'site_navigation',
        'site_bulk_emails'
    ];

    const results: Record<string, any> = {};

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            results[table] = { status: 'MISSING/ERROR', message: error.message };
        } else {
            results[table] = { status: 'OK', columns: data && data.length > 0 ? Object.keys(data[0]) : '(Table empty)' };
        }
    }

    console.log(JSON.stringify(results, null, 2));
}

checkTables();
