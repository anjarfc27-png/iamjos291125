
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
    const migrationPath = path.resolve(__dirname, '../supabase/migrations/20251129_atomic_operations.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration:', migrationPath);

    // Split by semicolon to execute statements individually if needed, 
    // but supabase.rpc might not support raw SQL execution directly without a helper.
    // Wait, Supabase JS client doesn't support raw SQL execution directly unless we have a function for it.
    // But we are trying to CREATE that function.

    // WORKAROUND: If we can't execute raw SQL, we might be stuck if we can't use the CLI.
    // However, often there is a `exec_sql` or similar RPC exposed in development setups, or we can try to use the `pg` library directly if available.
    // Let's check if `pg` is installed.

    try {
        // Try using pg directly if available in node_modules
        const { Client } = require('pg');

        // We need the connection string. Usually it's in the .env file as DATABASE_URL
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            console.error('DATABASE_URL not found in env');
            return;
        }

        const client = new Client({ connectionString });
        await client.connect();
        console.log('Connected to Postgres');

        await client.query(sql);
        console.log('Migration applied successfully via pg client');
        await client.end();

    } catch (e) {
        console.error('Failed to apply migration:', e);
        console.log('Attempting to use Supabase RPC "exec_sql" if it exists (unlikely but worth a shot if pg fails)');
    }
}

applyMigration();
