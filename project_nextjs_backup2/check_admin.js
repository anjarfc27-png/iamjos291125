
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminRole() {
    const email = 'admin@ojs.test';
    console.log(`Checking roles for ${email}...`);

    // 1. Get User ID
    const { data: user, error: userError } = await supabase
        .from('user_accounts')
        .select('id, username')
        .eq('email', email)
        .single();

    if (userError || !user) {
        console.error('User not found:', userError?.message);
        return;
    }

    console.log(`User Found: ${user.username} (${user.id})`);

    // 2. Check Roles
    const { data: roles, error: rolesError } = await supabase
        .from('user_account_roles')
        .select('*')
        .eq('user_id', user.id);

    if (rolesError) {
        console.error('Error fetching roles:', rolesError.message);
    } else {
        console.log('Assigned Roles:', roles.map(r => r.role_name || r.role));

        const isAdmin = roles.some(r => r.role === 'admin' || r.role_name === 'Site admin');
        console.log(`Is Admin? ${isAdmin ? 'YES' : 'NO'}`);
    }
}

checkAdminRole();
