
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function inspectSchema() {
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

    const schema: Record<string, any> = {};

    for (const table of tablesToCheck) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);

            if (error) {
                schema[table] = { status: 'ERROR', message: error.message };
            } else if (data && data.length > 0) {
                schema[table] = { status: 'OK', columns: Object.keys(data[0]) };
            } else {
                schema[table] = { status: 'EMPTY', message: 'Table is empty' };
            }
        } catch (e: any) {
            schema[table] = { status: 'EXCEPTION', message: e.message };
        }
    }

    console.log(JSON.stringify(schema, null, 2));
}

inspectSchema();
