
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRoles() {
    const logStream = fs.createWriteStream('roles_output.txt');
    const log = (msg: string) => {
        console.log(msg);
        logStream.write(msg + '\n');
    };

    log('--- CHECKING ALL USERS ---');
    const { data: users, error: usersError } = await supabase
        .from('user_accounts')
        .select('id, email, username, first_name, last_name')
        .limit(20);

    if (usersError) {
        log(`Error fetching users: ${usersError.message}`);
    } else {
        log(`Found ${users?.length || 0} users:`);
        users?.forEach(u => log(`- ${u.email} (${u.username}) [ID: ${u.id}]`));
    }

    log('\n--- CHECKING ADMIN ROLES ---');
    const { data: adminRoles, error: rolesError } = await supabase
        .from('user_account_roles')
        .select('user_id, role_name, created_at')
        .eq('role_name', 'admin');

    if (rolesError) {
        log(`Error fetching admin roles: ${rolesError.message}`);
    } else {
        log(`Found ${adminRoles?.length || 0} admin role assignments:`);
        adminRoles?.forEach(r => log(`- User ID: ${r.user_id}, Role: ${r.role_name}`));
    }

    logStream.end();
}

checkRoles();
