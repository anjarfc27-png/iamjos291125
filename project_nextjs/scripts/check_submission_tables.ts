
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
        'publication_settings',
        'review_rounds',
        'review_discussions',
        'submission_files',
        'submission_activity_logs',
        'stage_assignments',
        'submission_versions',
        'submission_participants'
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
