
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function listTables() {
    console.log('Listing tables in public schema...');

    // Query pg_catalog to list tables
    // Note: Supabase JS client doesn't support direct SQL easily without RPC, 
    // but we can try to inspect via a known table or just try common names.
    // Actually, we can use the 'rpc' if a function exists, or just try to select from likely tables.

    const tablesToCheck = ['journals', 'journal', 'issues', 'submissions', 'users', 'user_accounts'];

    for (const table of tablesToCheck) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`[${table}] Error: ${error.message}`);
        } else {
            console.log(`[${table}] Exists. Count: ${count}`);
        }
    }
}

listTables();
