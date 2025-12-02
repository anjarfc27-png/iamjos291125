
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

async function inspectTable() {
    console.log('Inspecting user_account_roles...');

    // Check one record to see what columns come back
    const { data, error } = await supabase
        .from('user_account_roles')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching:', error);
    } else {
        console.log('Record sample:', data);
    }
}

inspectTable();
