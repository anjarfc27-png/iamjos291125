
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function inspectSchema() {
    console.log('Inspecting Database Schema...');

    const tablesToCheck = [
        'journals',
        'journal_settings',
        'sections',
        'section_settings',
        'issues',
        'issue_settings',
        'submissions',
        'submission_settings',
        'user_accounts',
        'user_account_roles',
        'announcements',
        'announcement_settings',
        'email_templates',
        'navigation_menus',
        'navigation_menu_items'
    ];

    const schema: Record<string, string[]> = {};

    for (const table of tablesToCheck) {
        // We can't easily get column definitions via JS client without admin API or RPC.
        // However, we can select a single row to see available columns if data exists,
        // OR we can try to infer from a "select *" with limit 0 if the client supports it (it usually returns empty data).
        // Better approach for "audit": Try to select * limit 1.

        const { data, error } = await supabase.from(table).select('*').limit(1);

        if (error) {
            console.log(`[${table}] Error accessing: ${error.message}`);
            schema[table] = ['ERROR: ' + error.message];
        } else if (data && data.length > 0) {
            schema[table] = Object.keys(data[0]);
        } else {
            // Table exists but is empty. We can't see columns easily this way.
            // Let's try to insert a dummy row and fail, or just note it's empty.
            // Actually, for an audit, knowing it's empty is useful.
            // But we really want columns.
            // Let's try to use a known RPC if available, or just list it as "Empty (Columns unknown via simple query)".
            schema[table] = ['(Table is empty, cannot infer columns from data)'];
        }
    }

    console.log(JSON.stringify(schema, null, 2));
}

inspectSchema();
