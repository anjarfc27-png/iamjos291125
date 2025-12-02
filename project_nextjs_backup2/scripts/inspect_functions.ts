
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listFunctions() {
    const { data, error } = await supabase
        .rpc('get_functions_list_if_exists_mock'); // This won't work if I don't have a listing RPC.

    // Better way: Query information_schema using a raw query if possible, or just try to call a dummy RPC.
    // Since I can't run raw SQL easily with supabase-js, I'll use the pg client again to inspect.

    try {
        const { Client } = require('pg');
        const connectionString = process.env.DATABASE_URL;
        const client = new Client({ connectionString });
        await client.connect();

        const res = await client.query(`
      SELECT routine_name, routine_schema 
      FROM information_schema.routines 
      WHERE routine_type = 'FUNCTION' 
      AND routine_schema = 'public'
      AND routine_name = 'admin_create_journal';
    `);

        console.log('Found functions:', res.rows);
        await client.end();
    } catch (e) {
        console.error('PG Client Error:', e);
    }
}

listFunctions();
