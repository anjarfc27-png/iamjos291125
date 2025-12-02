
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

const OJS_ROLES = [
    { name: 'Site Administrator', id: 'admin', path: 'admin' },
    { name: 'Journal Manager', id: 'manager', path: 'manager' },
    { name: 'Editor', id: 'editor', path: 'editor' },
    { name: 'Section Editor', id: 'section_editor', path: 'section-editor' },
    { name: 'Reviewer', id: 'reviewer', path: 'reviewer' },
    { name: 'Author', id: 'author', path: 'author' },
    { name: 'Reader', id: 'reader', path: 'reader' },
    { name: 'Subscription Manager', id: 'subscription-manager', path: 'subscription-manager' },
    { name: 'Layout Editor', id: 'layout-editor', path: 'layout-editor' },
    { name: 'Copyeditor', id: 'copyeditor', path: 'copyeditor' },
    { name: 'Proofreader', id: 'proofreader', path: 'proofreader' },
];

async function auditUsersAndRoles() {
    const logStream = fs.createWriteStream('user_role_audit_report.txt');
    const log = (msg: string) => {
        console.log(msg);
        logStream.write(msg + '\n');
    };

    log('================================================================');
    log('               SYSTEM ROLE & ACCOUNT AUDIT REPORT               ');
    log('================================================================');
    log(`Date: ${new Date().toISOString()}`);
    log('');

    // 1. OJS 3.3 Standard Roles
    log('1. STANDARD OJS 3.3 ROLES (Reference)');
    log('----------------------------------------------------------------');
    OJS_ROLES.forEach(r => {
        log(`- ${r.name.padEnd(25)} (ID: ${r.id}, Path: /${r.path})`);
    });
    log('');

    // 2. Current System Users & Roles
    log('2. CURRENT REGISTERED ACCOUNTS & ROLES');
    log('----------------------------------------------------------------');

    // Fetch users
    const { data: users, error: usersError } = await supabase
        .from('user_accounts')
        .select('id, email, username, first_name, last_name')
        .order('email');

    if (usersError) {
        log(`ERROR fetching users: ${usersError.message}`);
        return;
    }

    // Fetch roles
    const { data: roles, error: rolesError } = await supabase
        .from('user_account_roles')
        .select('user_id, role_name, created_at');

    if (rolesError) {
        log(`ERROR fetching roles: ${rolesError.message}`);
        return;
    }

    // Map roles to users
    const roleMap = new Map<string, string[]>();
    roles?.forEach(r => {
        const current = roleMap.get(r.user_id) || [];
        current.push(r.role_name);
        roleMap.set(r.user_id, current);
    });

    // Print Table
    log(
        'Email'.padEnd(35) +
        'Username'.padEnd(20) +
        'Roles'.padEnd(40) +
        'User ID'
    );
    log('-'.repeat(110));

    users?.forEach(u => {
        const userRoles = roleMap.get(u.id) || ['(No Role)'];
        const roleString = userRoles.join(', ');

        log(
            u.email.padEnd(35) +
            u.username.padEnd(20) +
            roleString.padEnd(40) +
            u.id
        );
    });

    log('');
    log('================================================================');
    log('                       END OF REPORT                            ');
    log('================================================================');

    logStream.end();
}

auditUsersAndRoles();
