
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

console.log('URL:', supabaseUrl);
console.log('Service Key (first 10 chars):', supabaseServiceKey?.substring(0, 10));
console.log('Is Service Key same as Anon Key?', supabaseServiceKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('Has DATABASE_URL?', !!process.env.DATABASE_URL);
console.log('DATABASE_URL prefix:', process.env.DATABASE_URL?.substring(0, 15));

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});

async function fixRoles() {
    console.log('Starting role fix...');

    // Try to insert directly without checking first (upsert)
    // We need user ID first.

    const { data: user, error: userError } = await supabaseAdmin
        .from('user_accounts')
        .select('id, username')
        .eq('username', 'admin')
        .single();

    if (userError || !user) {
        console.error('Admin user not found:', userError);
        return;
    }

    console.log(`Found user: ${user.id}`);

    console.log(`Attempting to insert role for admin...`);
    const { error: insertError } = await supabaseAdmin
        .from('user_account_roles')
        .upsert({
            user_id: user.id,
            role_name: 'Site admin',
            role_path: 'admin'
        }, { onConflict: 'user_id, role_name' });

    if (insertError) {
        console.error(`Error inserting role:`, insertError);
    } else {
        console.log(`Successfully added role Site admin to admin`);
    }
}

fixRoles().catch(console.error);
