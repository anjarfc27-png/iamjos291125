
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

console.log('--- DIAGNOSTICS ---');
console.log('URL:', supabaseUrl);
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('Service Key (last 5):', supabaseServiceKey?.slice(-5));
console.log('Anon Key    (last 5):', anonKey?.slice(-5));
console.log('Are keys IDENTICAL?', supabaseServiceKey === anonKey);
console.log('-------------------');

// Mock getRolePath since we can't easily import it without transpilation issues sometimes
function getRolePath(userGroupName: string): string {
    const normalized = userGroupName?.trim() || ''
    const rolePaths: Record<string, string> = {
        'site admin': 'admin',
        'manager': 'manager',
        'editor': 'editor',
        'section editor': 'section_editor',
        'assistant': 'assistant',
        'copyeditor': 'copyeditor',
        'proofreader': 'proofreader',
        'layout editor': 'layout-editor',
        'author': 'author',
        'reviewer': 'reviewer',
        'reader': 'reader',
        'subscription manager': 'subscription-manager'
    }
    const lowerNormalized = normalized.toLowerCase()
    return rolePaths[lowerNormalized] || rolePaths[userGroupName] || 'reader'
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});

async function checkRoles() {
    console.log('Checking roles for admin@ojs.test...');

    // 1. Get User ID
    const { data: user, error: userError } = await supabaseAdmin
        .from('user_accounts')
        .select('id, username, email')
        .eq('email', 'admin@ojs.test')
        .single();

    if (userError || !user) {
        console.error('User not found:', userError);
        return;
    }

    console.log(`User found: ${user.id} (${user.username})`);

    // 2. Check user_account_roles directly
    console.log('Querying user_account_roles table...');
    const { data: rawRoles, error: rawRolesError } = await supabaseAdmin
        .from('user_account_roles')
        .select('*')
        .eq('user_id', user.id);

    if (rawRolesError) {
        console.error('Error querying user_account_roles:', rawRolesError);
    } else {
        console.log('Raw roles in DB:', rawRoles);
    }

    // 3. Simulate getUserRoles logic
    console.log('Simulating getUserRoles logic...');
    if (rawRoles && rawRoles.length > 0) {
        const roles = rawRoles.map(role => ({
            user_group_id: role.role_name,
            user_group_name: role.role_name,
            context_id: null,
            journal_name: 'Site',
            role_path: getRolePath(role.role_name)
        }));
        console.log('Mapped roles:', roles);
    } else {
        console.log('No roles found in user_account_roles.');
    }
}

checkRoles().catch(console.error);
