
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

async function grantAdminRole(email: string) {
    console.log(`Granting admin role to ${email}...`);

    // 1. Find user by email
    const { data: user, error: userError } = await supabase
        .from('user_accounts')
        .select('id')
        .eq('email', email)
        .single();

    if (userError || !user) {
        console.error(`Error finding user ${email}:`, userError?.message || 'User not found');
        return;
    }

    console.log(`Found user ID: ${user.id}`);

    // 2. Check if role already exists
    const { data: existingRole, error: roleCheckError } = await supabase
        .from('user_account_roles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role_name', 'admin')
        .single();

    if (existingRole) {
        console.log('User already has admin role.');
        return;
    }

    // 3. Insert role
    const { error: insertError } = await supabase
        .from('user_account_roles')
        .insert({
            user_id: user.id,
            role_name: 'admin'
        });

    if (insertError) {
        console.error('Error granting role:', insertError.message);
    } else {
        console.log('Successfully granted admin role!');
    }
}

grantAdminRole('admin@ojs.test');
