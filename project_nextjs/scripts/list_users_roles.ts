
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listUsersAndRoles() {
    console.log('Fetching users and roles...\n');

    // Fetch users from user_accounts
    const { data: users, error: userError } = await supabase
        .from('user_accounts')
        .select('id, username, email, first_name, last_name');

    if (userError) {
        console.error('Error fetching users:', userError);
        return;
    }

    // Fetch roles from user_account_roles
    const { data: roles, error: roleError } = await supabase
        .from('user_account_roles')
        .select('user_id, role_name');

    if (roleError) {
        console.error('Error fetching roles:', roleError);
        return;
    }

    // Map roles to users
    const userMap = new Map();
    users.forEach(user => {
        userMap.set(user.id, { ...user, roles: [] });
    });

    roles.forEach(role => {
        const user = userMap.get(role.user_id);
        if (user) {
            user.roles.push(role.role_name);
        }
    });

    // Display results
    console.log('Registered Accounts & Roles:');
    console.log('----------------------------');
    userMap.forEach(user => {
        console.log(`Username: ${user.username}`);
        console.log(`Email:    ${user.email}`);
        console.log(`Name:     ${user.first_name} ${user.last_name || ''}`);
        console.log(`Roles:    ${user.roles.length > 0 ? user.roles.join(', ') : 'No roles assigned'}`);
        console.log('----------------------------');
    });
}

listUsersAndRoles().catch(console.error);
