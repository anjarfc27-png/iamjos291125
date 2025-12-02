import { createClient } from '@supabase/supabase-js';

// User provided keys directly
const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectRoles() {
    console.log('🕵️ Inspecting user_account_roles data...\n');

    const { data: roles, error } = await supabase
        .from('user_account_roles')
        .select('*');

    if (error) {
        console.error('❌ Error fetching roles:', error.message);
        return;
    }

    console.table(roles);

    // Check for potential issues
    const badRoles = roles.filter((r: any) => !r.role_id && !r.role);
    if (badRoles.length > 0) {
        console.log(`\n❌ Found ${badRoles.length} roles with BOTH role_id and role as NULL/Empty.`);
        console.log(JSON.stringify(badRoles, null, 2));
    } else {
        console.log('\n✅ No roles with both role_id and role missing found.');
    }
}

inspectRoles();
