
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
const envPath = join(process.cwd(), '.env.local');
try {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                process.env[key.trim()] = value;
            }
        }
    });
} catch (error) {
    console.error('Error loading .env.local:', error);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key which should bypass RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});

async function checkRLS() {
    console.log('Checking RLS policies...');

    // Try to insert a dummy role to see if it works with service role
    // We use a non-existent user ID to avoid messing up real data, 
    // but this might fail due to FK constraint. 
    // Better to just check if we can select from the table.

    const { data, error } = await supabaseAdmin
        .from('user_account_roles')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error selecting from user_account_roles:', error);
    } else {
        console.log('Successfully selected from user_account_roles. Service role key works for SELECT.');
    }
}

checkRLS().catch(console.error);
