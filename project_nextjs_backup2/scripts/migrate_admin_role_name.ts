
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateAdminRole() {
    console.log('Migrating "admin" role to "site admin"...');

    // 1. Update role_name
    const { data, error } = await supabase
        .from('user_account_roles')
        .update({ role_name: 'site admin' })
        .eq('role_name', 'admin')
        .select();

    if (error) {
        console.error('Error migrating roles:', error.message);
    } else {
        console.log(`Successfully migrated ${data.length} records.`);
        data.forEach(r => console.log(`- Updated User ID: ${r.user_id} to 'site admin'`));
    }
}

migrateAdminRole();
