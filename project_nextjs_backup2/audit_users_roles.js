
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditSystem() {
    console.log('=== SYSTEM AUDIT START ===\n');

    // 1. Fetch Auth Users
    console.log('1. Checking Supabase Auth Users (auth.users)...');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error('Error fetching auth users:', authError);
        return;
    }

    const authMap = new Map();
    users.forEach(u => {
        authMap.set(u.email, u.id);
        console.log(`   - ${u.email} (ID: ${u.id})`);
    });

    // 2. Fetch Public User Accounts
    console.log('\n2. Checking Public User Accounts (public.user_accounts)...');
    const { data: accounts, error: accError } = await supabase
        .from('user_accounts')
        .select('id, email, username');

    if (accError) {
        console.error('Error fetching accounts:', accError);
        return;
    }

    const accountMap = new Map();
    accounts.forEach(a => {
        accountMap.set(a.email, a.id);
        const authId = authMap.get(a.email);
        const status = authId === a.id ? 'MATCH' : 'MISMATCH';
        console.log(`   - ${a.email} (ID: ${a.id}) [${status}]`);
        if (status === 'MISMATCH') {
            console.log(`     >>> WARNING: Auth ID is ${authId}`);
        }
    });

    // 3. Fetch User Roles
    console.log('\n3. Checking User Roles (public.user_account_roles)...');
    const { data: roles, error: rolesError } = await supabase
        .from('user_account_roles')
        .select('*');

    if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        return;
    }

    roles.forEach(r => {
        // Find who owns this role
        const account = accounts.find(a => a.id === r.user_id);
        const email = account ? account.email : 'UNKNOWN_USER_ID';
        console.log(`   - User: ${email} (ID: ${r.user_id}) -> Role: ${r.role_name} (${r.role_path})`);

        // Check if this ID exists in Auth
        const authUser = users.find(u => u.id === r.user_id);
        if (!authUser) {
            console.log(`     >>> CRITICAL: Role assigned to ID ${r.user_id} which does NOT exist in Auth!`);
        }
    });

    console.log('\n=== SYSTEM AUDIT COMPLETE ===');
}

auditSystem();
